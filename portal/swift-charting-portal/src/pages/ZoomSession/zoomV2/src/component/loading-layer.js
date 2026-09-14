import React from 'react';
import './loading-layer.scss';
import Loader from 'src/components/Loader';

const LoadingLayer = (props={}) => {
  const { content } = props;
  return (
    <div className="loading-layer">
      <Loader style={{ fontSize: '86px', color: '#fff' }} />
      <p className="loading-text">{content}</p>
    </div>
  );
};

export default LoadingLayer;
