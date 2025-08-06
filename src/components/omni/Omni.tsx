import { useState, type ChangeEvent, type FC, type KeyboardEvent } from "react";
import getYouTubeID from "get-youtube-id";
import { clsx } from "clsx";

import './Omni.scss';

const CHECK_ID_URL = 'https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=';

interface OmniProps {
  onAdd: (videoId: string) => void;
  onCancel: () => void;
  showCancel: boolean;
}

const Omni: FC<OmniProps> = ({ onAdd, onCancel, showCancel }) => {
  const [error, setError] = useState('');
  const [value, setValue] = useState('');

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 2500);
  };

  const submit = async () => {
    let id = null;

    if (value) {
      try {
        id = getYouTubeID(value);

        if (!id && /^[A-Za-z0-9_-]{11}$/.test(value)) {
          id = value;
        }

        if (!id) {
          throw new Error('URL/VideoID inválido!');
        }

        const res = await fetch(CHECK_ID_URL + id);

        switch (res.status) {
          case 200:
            onAdd(id);
            break;
          case 401:
            throw new Error('A reprodução em outros sites (embed) foi desativada pelo proprietário do vídeo.');
          default:
            throw new Error('URL/VideoID inválido!');
        }
      } catch (e: any) {
        showError(e.message);
      }
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  const onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={clsx('omni', { invalid: !!error })}>
      <input type="text" placeholder="Youtube URL / Video ID" value={value} onChange={onChange} onKeyUp={onKeyUp} autoFocus={true} />
      <span>{error}</span>
      <button onClick={submit} className="play">Play</button>
      {showCancel && <button onClick={onCancel} className="cancel">Cancelar</button>}
    </div>
  );
};

export default Omni;
