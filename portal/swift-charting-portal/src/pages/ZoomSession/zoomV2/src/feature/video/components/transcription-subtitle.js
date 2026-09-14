import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import './transcription-subtitle.scss';

export const TranscriptionSubtitle = (props) => {
  const { text } = props;
  const [visible, setVisible] = useState(false);
  const timerRef = useRef();
  useEffect(() => {
    if (text) {
      setVisible(true);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, 3000);
    }
  }, [text]);
  return (
    <div className={classNames('transcript-subtitle', { 'transcript-subtitle-show': visible })}>
      <p className="transcript-subtitle-message">{text}</p>
    </div>
  );
};
