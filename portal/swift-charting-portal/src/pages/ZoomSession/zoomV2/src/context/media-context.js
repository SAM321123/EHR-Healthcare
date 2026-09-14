import React from 'react';
import { MediaStream } from '../index-types';
const MediaContext= {
  audio: {
    encode: false,
    decode: false,
  },
  video: {
    encode: false,
    decode: false,
  },
  share: {
    encode: false,
    decode: false,
  },
  mediaStream: MediaStream,
}
export default React.createContext(MediaContext);
