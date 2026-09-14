import React from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = (props) => {
  const {
    source = '',
    educationContentId = '',
    containerStyle = {},
    width,
    height,
    setWatched = () => {},
  } = props || {};
  return (
    <div style={containerStyle}>
      <ReactPlayer
        url={source}
        pip
        className="react-player"
        playing
        controls
        volume={1}
        width={width || '100%'}
        height={height || '100%'}
        onEnded={() => {
          setWatched(educationContentId);
        }}
      />
    </div>
  );
};

export default VideoPlayer;
