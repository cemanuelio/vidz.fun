import { useEffect, useRef, useState, type FC, type MouseEvent } from 'react';
import Item, { type ItemRef } from './components/item/Item';
import { FaInfoCircle, FaPlus, FaTimes, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import Omni from './components/omni/Omni';

import './App.scss';

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
}

const App: FC = () => {
  const [active, setActive] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showOmni, setShowOmni] = useState(false);

  const videoRefs = useRef<{ [videoId: string]: ItemRef }>({});

  useEffect(
    () => {
      if (!videos.map((it) => it.id).includes(active)) {
        setActive(videos.length > 0 ? videos[0].id : '');
      }

      if (videos.length === 0) {
        setShowOmni(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videos]
  );

  const removeVideo = (videoId: string) => setVideos((p) => p.filter((it) => it.id !== videoId));

  const updateGlobalMuteState = () => setIsMuted(Object.values(videoRefs.current).every((it) => it.isMuted()));

  const toggleAudio = () =>
    setIsMuted((p) => {
      if (p) {
        Object.values(videoRefs.current).forEach((ref) => ref.unMute());
      } else {
        Object.values(videoRefs.current).forEach((ref) => ref.mute());
      }
      return !p;
    });

  const setRef = (videoId: string, ref: ItemRef) => {
    if (ref) {
      videoRefs.current[videoId] = ref;
    } else if (Object.keys(videoRefs.current).includes(videoId)) {
      delete videoRefs.current[videoId];
    }
  };

  const closeAll = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setVideos([]);
  };

  const onAdd = (video: Video) => {
    setVideos((p) => [...p, video]);
    setActive(video.id);
    setShowOmni(false);
  };

  const onCancel = () => setShowOmni(false);

  const onClickAdd = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowOmni(true);
  };

  return (
    <div className="app">
      {videos.length > 0 && (
        <div className="sidebar">
          <div className="list">
            {videos.map((video) => (
              <Item
                key={video.id}
                ref={setRef.bind(null, video.id)}
                video={video}
                active={active}
                setActive={setActive}
                onRemove={removeVideo}
                onMuteStateChange={updateGlobalMuteState}
              />
            ))}
          </div>
          <div className="footer">
            <button data-tooltip-id="main-tooltip" data-tooltip-content="Adicionar um novo video" data-tooltip-place="top-start" onClick={onClickAdd}>
              <FaPlus />
            </button>
            <button
              data-tooltip-id="main-tooltip"
              data-tooltip-content={`${isMuted ? 'Ativar o som de' : 'Silenciar'} todos os vídeos`}
              data-tooltip-place="top-start"
              onClick={toggleAudio}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <button data-tooltip-id="main-tooltip" data-tooltip-content="Fechar todos os videos" data-tooltip-place="top-start" onClick={closeAll}>
              <FaTimes />
            </button>
            <a
              href="https://github.com/cemanuelio/vidz.fun/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              data-tooltip-id="main-tooltip"
              data-tooltip-content="Sobre o vidz.fun"
              data-tooltip-place="top-start"
            >
              <FaInfoCircle />
            </a>
          </div>
        </div>
      )}
      {showOmni && <Omni onAdd={onAdd} onCancel={onCancel} showCancel={videos.length > 0} />}
      <Tooltip id="main-tooltip" className="main-tooltip" />
    </div>
  );
};

export default App;
