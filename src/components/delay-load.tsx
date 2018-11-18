import * as React from 'react';

export type Props = {
  children: React.ReactNode;
  delay?: number;
  resolve?: boolean;
  disable?: boolean;
}

export default class DelayLoad extends React.PureComponent<Props> {

  static defaultProps = {
    delay: 0,
    disable: false,
  };

  private resolveFlag = false;

  getSingletonDelayPromise(ms?: number) {
    if (!this.getSingletonDelayPromise['promise']) {
      this.getSingletonDelayPromise['promise'] = new Promise((resolve) => {
        this.getSingletonDelayPromise['resolve'] = resolve;
        this.getSingletonDelayPromise['hook'] = setTimeout(resolve, ms || 0);
      }).then(() => {
        this.resolveFlag = true;
      });
    }
    return this.getSingletonDelayPromise['promise'];
  }

  clearHook() {
    if (this.getSingletonDelayPromise['hook']) {
      this.getSingletonDelayPromise['hook'] && clearTimeout(this.getSingletonDelayPromise['hook']);
      this.getSingletonDelayPromise['hook'] = null;
    }
  }

  componentWillUnmount(): void {
    this.clearHook();
  }

  autoResolve(nextProps?: Props) {
    if (!this.resolveFlag) {
      const { resolve } = nextProps || this.props;
      if (resolve) {
        this.resolveFlag = true;
        this.clearHook();
        this.getSingletonDelayPromise['resolve'] && this.getSingletonDelayPromise['resolve']();
      }
    }
  }

  componentWillMount(): void {
    this.autoResolve();
  }

  componentWillUpdate(nextProps: Readonly<Props>): void {
    this.autoResolve(nextProps);
  }

  render() {
    const { children, delay: ms, disable, resolve } = this.props;
    const finalChildren = React.Children.only(children);
    if (disable || resolve || this.resolveFlag) {
      return finalChildren;
    }
    return (
      <React.Suspense fallback={null}>
        {
          React.createElement(
            React.lazy((): Promise<{ default: any }> => {
              return this.getSingletonDelayPromise(ms).then(() => ({
                default: () => finalChildren,
              }));
            }),
          )
        }
      </React.Suspense>
    );
  }
}
