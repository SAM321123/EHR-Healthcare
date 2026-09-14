import { useRef, useContext, useEffect } from 'react';
import ZoomMediaContext from '../../../context/media-context';

function getStyleAttributeNumericalValue(attr) {
  const v = /(\d+)/.exec(attr)?.[1];
  return v ? Number(v) : 0;
}
function SelfViewContainer(props) {
  const { isRenderSelfViewWithVideoElement, ...restProps } = props;
  const canvasRef = useRef(null);
  const { style } = restProps;
  const { mediaStream } = useContext(ZoomMediaContext);
  useEffect(() => {
    if (!isRenderSelfViewWithVideoElement && canvasRef.current && style) {
      const width = getStyleAttributeNumericalValue(style.width);
      const height = getStyleAttributeNumericalValue(style.height);
      try {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      } catch (e) {
        mediaStream?.updateVideoCanvasDimension(canvasRef.current, width, height);
      }
    }
  }, [isRenderSelfViewWithVideoElement, style, mediaStream]);
  return isRenderSelfViewWithVideoElement ? <video {...restProps} /> : <canvas ref={canvasRef} {...restProps} />;
}

export default SelfViewContainer;
