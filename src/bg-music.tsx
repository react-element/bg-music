import * as React from 'react';
import cx from 'classnames';
import withoutProps from 'without-props';
import { isWeixin } from './utils';
import Default from './default';
// import DelayLoad from './components/delay-load';
import SuspendTillWindowOnload from './components/suspend-till-window-onload';

import './bg-music.less';

export type Props = {
  src: string;
  playContent: React.ReactNode | (() => React.ReactNode);
  pauseContent: React.ReactNode;
  prefixCls?: string;
  onChange?: (state: State) => any;
  isPlaying?: boolean;
  className?: string;
  rotate?: boolean;
  loop?: boolean;
}

export type State = {
  isPlaying?: boolean;
}

export default class BgMusic extends React.Component<Props, State> {

  static Default: typeof Default;

  static defaultProps: Partial<Props> = {
    prefixCls: 'xc-bg-music',
    rotate: true,
    loop: true,
    isPlaying: true,
  };

  /**
   * 音频 react ref 钩子
   */
  private readonly audioRef: React.RefObject<HTMLAudioElement>;

  constructor(props: Props) {
    super(props);
    if (!this.isDumbComponent()) {
      this.state = this.createInitState();
    }
    this.audioRef = React.createRef();
  }

  /**
   * 更新 state 状态
   * @param nextState
   */
  updateState(nextState: State) {
    if (this.isDumbComponent()) {
      const { onChange } = this.props;
      onChange && onChange(nextState);
    } else {
      this.setState(nextState);
    }
  }

  /**
   * 创建初始状态
   */
  createInitState(): State {
    return {
      isPlaying: this.props.isPlaying,
    };
  }

  /**
   * 判断是否是无状态组件
   */
  isDumbComponent() {
    return !!this.props.onChange;
  }

  /**
   * 获取 isPlaying 的播放状态
   */
  checkIsPlaying(): boolean {
    return !!(this.isDumbComponent() ? this.props.isPlaying : this.state.isPlaying);
  }

  /**
   * 微信 bridge ready
   * @param isPlaying
   */
  onWeixinJSBridgeReady = (isPlaying?: boolean) => {
    if (isPlaying === undefined) {
      isPlaying = this.checkIsPlaying();
    }
    isPlaying ? this.playAudio() : this.pauseAudio();
  };

  /**
   * 播放音频
   */
  playAudio = () => {
    const audioEl = this.audioRef.current;
    if (audioEl) {
      // noinspection JSIgnoredPromiseFromCall
      audioEl.play();
      audioEl.paused && this.updateState({ isPlaying: false });
    }
  };

  /**
   * 暂停音频
   */
  pauseAudio = () => {
    const audioEl = this.audioRef.current;
    if (audioEl) {
      audioEl.pause();
      audioEl.paused || this.updateState({ isPlaying: false });
    }
  };

  /**
   * 处理点击事件
   */
  onClick = () => {
    const nextIsPlaying = !this.checkIsPlaying();
    this.updateState({ isPlaying: nextIsPlaying });
    this.onWeixinJSBridgeReady(nextIsPlaying);
  };

  /**
   * 处理微信 audio 播放
   */
  onWeixinAudioPlay() {
    document.addEventListener('WeixinJSBridgeReady', this.playAudio.bind(this), false);
  }

  /**
   * 处理非微信 audio 播放
   */
  onNonWeixinAudioPlay() {
    this.onWeixinJSBridgeReady();
    const audioRef = this.audioRef.current;
    if (audioRef && audioRef.paused) {
      const onTouchStartOnce = () => {
        const isPlaying = this.checkIsPlaying();
        isPlaying && this.playAudio();
        window.removeEventListener('touchstart', onTouchStartOnce, false);
      };
      window.addEventListener('touchstart', onTouchStartOnce, false);
    }
  }

  /**
   * 首次加载完 dom
   */
  componentDidMount() {
    const isPlaying = this.checkIsPlaying();
    if (isPlaying) {
      isWeixin() ? this.onWeixinAudioPlay() : this.onNonWeixinAudioPlay();
    }
  }

  /**
   * 渲染播放内容
   */
  renderPlayContent(isHidden?: boolean) {
    const { rotate, playContent, prefixCls } = this.props;
    return (
      <SuspendTillWindowOnload resolve={!isHidden}>
        <div className={cx(`${prefixCls}-play-content`, rotate && `${prefixCls}-rotate`, isHidden && `${prefixCls}-hide`)}>
          {playContent}
        </div>
      </SuspendTillWindowOnload>
    );
  }

  /**
   * 渲染暂停内容
   */
  renderPauseContent(isHidden?: boolean) {
    const { pauseContent, prefixCls } = this.props;
    return (
      <SuspendTillWindowOnload resolve={!isHidden}>
        <div className={cx(isHidden && `${prefixCls}-hide`)}>
          {pauseContent}
        </div>
      </SuspendTillWindowOnload>
    );
  }

  render() {
    const { className, prefixCls, ...restProps } = withoutProps(
      this.props,
      ['isPlaying', 'rotate', 'rotate', 'onChange', 'pauseContent', 'playContent'],
    );
    const isPlaying = this.checkIsPlaying();
    return (
      <a className={cx(`${prefixCls}`, className)} onClick={this.onClick}>
        <audio className={`${prefixCls}-audio`} ref={this.audioRef} {...restProps as any}/>
        {this.renderPlayContent(!isPlaying)}
        {this.renderPauseContent(isPlaying)}
      </a>
    );
  }
}
