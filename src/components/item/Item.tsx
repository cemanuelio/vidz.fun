import { clsx } from 'clsx';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ChangeEvent, type MouseEvent } from 'react';
import { v4 as uuid } from 'uuid';
import playing from '../../assets/playing.gif';
import { FaTimes, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { BsArrowsFullscreen } from 'react-icons/bs';
import type { Video } from '../../App';

import './Item.scss';

interface ItemProps {
  video: Video;
  active: string;
  setActive: (videoId: string) => void;
  onRemove: (videoId: string) => void;
  onMuteStateChange: () => void;
}

export interface ItemRef {
  id: () => string;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
}

// KEEP IT SIMPLE
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const YT: { Player: any; PlayerState: any };

type Player = typeof YT.Player;

const Item = forwardRef<ItemRef, ItemProps>(({ active, video, setActive, onRemove, onMuteStateChange }, ref) => {
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const id = useRef(`video-${uuid()}`);
  const player = useRef<Player>(null);

  useEffect(
    () => {
      player.current = new YT.Player(id.current, {
        videoId: video.id,
        events: {
          onReady: (e: { target: Player }) => {
            updateVolume();
            e.target.playVideo();
          },
          onStateChange: (e: { data: number }) => {
            console.log('state', e.data);
            switch (e.data) {
              case YT.PlayerState.PAUSED:
              case YT.PlayerState.ENDED:
                setIsPaused(true);
                break;
              case YT.PlayerState.PLAYING:
                setIsPaused(false);
                break;
              default:
                break;
            }
          },
        },
      });

      const volumeWatcher = setInterval(() => updateVolume(), 500);

      return () => {
        if (volumeWatcher) {
          clearInterval(volumeWatcher);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(
    () => {
      setIsActive(active === video.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active]
  );

  useEffect(() => {
    if (player.current && player.current.setVolume) {
      if (volume != 0 && player.current.isMuted()) {
        player.current.unMute();
      }
      player.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(
    () => {
      onMuteStateChange();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMuted]
  );

  useImperativeHandle(ref, () => ({
    id: () => video.id,
    isMuted: () => isMuted,
    mute,
    unMute,
  }));

  const mute = () => player.current && player.current.mute();

  const unMute = () => {
    if (player.current) {
      player.current.unMute();
      if (player.current.getVolume() === 0) {
        player.current.setVolume(30);
      }
    }
  };

  const updateVolume = () => {
    if (player.current && player.current.getVolume) {
      setVolume(player.current.getVolume());
      setIsMuted(player.current.isMuted());
    }
  };

  const activate = () => setActive(video.id);

  const stopPropagation = (e: MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const close = (e: MouseEvent<HTMLButtonElement>) => {
    stopPropagation(e);
    onRemove(video.id);
  };

  const onChangeVolume = (e: ChangeEvent<HTMLInputElement>) => setVolume(parseInt(e.target.value, 10));

  const toggleAudio = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isMuted) {
      unMute();
    } else {
      mute();
    }
  };

  const getTooltipHtml = () => `<p class="video-title-tooltip">${video.title}<br /><span>${video.author}</span></p>`;

  return (
    <div className={clsx('item', { active: isActive, paused: isPaused })}>
      <div id={id.current} />
      <div
        className="mini"
        onClick={activate}
        data-tooltip-id="main-tooltip"
        data-tooltip-html={getTooltipHtml()}
        data-tooltip-place="right"
        data-tooltip-offset={17}
      >
        <div className="overlay" />
        <div className="thumb" style={{ backgroundImage: `url(${video.thumbnail})` }} />
        <div className="content">
          <button
            className="close"
            onClick={close}
            data-tooltip-id="main-tooltip"
            data-tooltip-content="Fechar este vídeo"
            data-tooltip-place="bottom-end"
          >
            <FaTimes />
          </button>
          <div className="volume" onClick={stopPropagation}>
            <button
              onClick={toggleAudio}
              data-tooltip-id="main-tooltip"
              data-tooltip-content={`${isMuted ? 'Desmutar' : 'Mutar'} este video`}
              data-tooltip-place="bottom-start"
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={onChangeVolume} />
          </div>
          <img src={playing} width="70" height="70" alt="Reproduzindo" />
          <div className="fullscreen">
            <BsArrowsFullscreen />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Item;
