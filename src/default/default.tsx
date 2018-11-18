import * as React from 'react';
import BgMusic from '../bg-music';
import bg from '../assets/music/bg.mp3';
import play from '../assets/images/play.png';
import pause from '../assets/images/pause.png';

export default class Default extends React.PureComponent {
  render() {
    return (
      <BgMusic
        src={bg}
        playContent={<img src={play} alt="播放"/>}
        pauseContent={<img src={pause} alt="暂停"/>}
      />
    );
  }
}
