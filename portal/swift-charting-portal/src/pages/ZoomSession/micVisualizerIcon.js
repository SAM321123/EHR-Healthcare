import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from '@mui/icons-material';
import { Avatar, Box, IconButton } from '@mui/material';

const MicVisualizerIcon = ({ isMicOn,toggleMic }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isMicOn) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 512;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        audioRef.current = { analyser, dataArray, audioContext };

        const detectSound = () => {
          analyser.getByteFrequencyData(dataArray);
          const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setIsSpeaking(volume > 20); // adjust threshold as needed
        };

        const interval = setInterval(detectSound, 100);
        return () => clearInterval(interval);
      });
    } else {
      setIsSpeaking(false);
      if (audioRef.current) {
        audioRef.current.audioContext.close();
        audioRef.current = null;
      }
    }
  }, [isMicOn]);

  return (
    <IconButton onClick={toggleMic} sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
      {isMicOn ? (
        <Mic
          sx={{
            color: isSpeaking ? 'primary.main' : 'action.disabled',
            animation: isSpeaking ? 'pulsate 1s infinite' : 'none',
          }}
        />
      ) : (
        <MicOff sx={{ color: 'action.disabled' }} />
      )}

      <style>
        {`
          @keyframes pulsate {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </IconButton>
  );
};

export default MicVisualizerIcon;
