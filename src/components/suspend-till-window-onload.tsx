import * as React from 'react';

export type Props = {
  children: React.ReactNode;
  resolve?: boolean;
  disable?: boolean;
}

export default class SuspendTillWindowOnload extends React.PureComponent<Props> {

  static defaultProps = {
    disable: false,
  };

  static isDocumentLoaded() {
    return document.readyState === 'complete';
  }

  private resolveFlag = false;

  getWindowOnLoadPromise() {
    if (!this.getWindowOnLoadPromise['promise']) {
      if (SuspendTillWindowOnload.isDocumentLoaded()) {
        this.getWindowOnLoadPromise['promise'] = Promise.resolve();
      } else {
        this.getWindowOnLoadPromise['promise'] = new Promise((resolve) => {
          if (SuspendTillWindowOnload.isDocumentLoaded()) {
            resolve();
            return;
          }
          this.getWindowOnLoadPromise['resolve'] = resolve;
          window.addEventListener('load', resolve, false);
        });
      }
      this.getWindowOnLoadPromise['promise'].then(() => {
        this.resolveFlag = true;
      });
    }
    return this.getWindowOnLoadPromise['promise'];
  }

  autoResolve(nextProps?: Props) {
    if (!this.resolveFlag) {
      const { resolve } = nextProps || this.props;
      if (resolve) {
        this.resolveFlag = true;
        this.removeWindowLoadEventListener();
        this.triggerResolve();
      }
    }
  }

  triggerResolve() {
    this.getWindowOnLoadPromise['resolve'] && this.getWindowOnLoadPromise['resolve']();
    this.getWindowOnLoadPromise['resolve'] = null;
  }

  componentWillMount(): void {
    this.autoResolve();
  }

  componentWillUpdate(nextProps: Readonly<Props>): void {
    this.autoResolve(nextProps);
  }

  removeWindowLoadEventListener() {
    if (this.getWindowOnLoadPromise['resolve']) {
      window.removeEventListener('load', this.getWindowOnLoadPromise['resolve'], false);
    }
  }

  componentWillUnmount() {
    this.removeWindowLoadEventListener();
  }

  render() {
    const { children, disable, resolve } = this.props;
    const finalChildren = React.Children.only(children);
    if (disable || resolve || this.resolveFlag) {
      return finalChildren;
    }
    return (
      <React.Suspense fallback={null}>
        {
          React.createElement(
            React.lazy((): Promise<{ default: any }> => {
              return this.getWindowOnLoadPromise().then(() => ({
                default: () => {
                  return finalChildren;
                },
              }));
            }),
          )
        }
      </React.Suspense>
    );
  }
}
