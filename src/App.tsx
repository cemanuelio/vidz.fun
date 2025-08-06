import { useEffect, useRef, useState, type FC, type MouseEvent } from 'react';
import Item, { type ItemRef } from './components/item/Item';
import { FaPlus, FaTimes, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import Omni from './components/omni/Omni';

import './App.scss';

const App: FC = () => {
  const [active, setActive] = useState<string>('');
  const [videos, setVideos] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showOmni, setShowOmni] = useState(false);

  const videoRefs = useRef<{ [videoId: string]: ItemRef }>({});

  useEffect(
    () => {
      if (!videos.includes(active)) {
        setActive(videos.length > 0 ? videos[0] : '');
      }

      if (videos.length === 0) {
        setShowOmni(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videos]
  );

  const removeVideo = (videoId: string) => setVideos(p => p.filter(it => it !== videoId));

  const updateGlobalMuteState = () => setIsMuted(Object.values(videoRefs.current).every(it => it.isMuted()));

  const toggleAudio = () =>
    setIsMuted(p => {
      if (p) {
        Object.values(videoRefs.current).forEach(ref => ref.unMute());
      } else {
        Object.values(videoRefs.current).forEach(ref => ref.mute());
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

  const onAdd = (videoId: string) => {
    setVideos(p => [...p, videoId]);
    setActive(videoId);
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
            {videos.map(videoId => (
              <Item
                key={videoId}
                ref={setRef.bind(null, videoId)}
                videoId={videoId}
                active={active}
                setActive={setActive}
                onRemove={removeVideo}
                onMuteStateChange={updateGlobalMuteState}
              />
            ))}
          </div>
          <div className="footer">
            <button className="add" data-tooltip-id="main-tooltip" data-tooltip-content="Adicionar novo video" data-tooltip-place="top-start" onClick={onClickAdd}>
              <FaPlus />
            </button>
            <button className="mute" data-tooltip-id="main-tooltip" data-tooltip-content={`${isMuted ? 'Desmutar' : 'Mutar'} todos os vídeos`} data-tooltip-place="top" onClick={toggleAudio}>
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <button className="close-all" data-tooltip-id="main-tooltip" data-tooltip-content="Fechar todos os videos" data-tooltip-place="top-end" onClick={closeAll}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}
      {showOmni && <Omni onAdd={onAdd} onCancel={onCancel} showCancel={videos.length > 0} />}
      <Tooltip id="main-tooltip" className="main-tooltip" />
    </div>
  );
};

export default App;
