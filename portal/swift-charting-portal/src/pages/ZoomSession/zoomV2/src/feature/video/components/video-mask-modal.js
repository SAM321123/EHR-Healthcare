import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import ZoomMediaContext from '../../../context/media-context';
import { useDebounceFn } from '../../../hooks/useDebounceFn';
import { usePrevious } from '../../../hooks/usePrevious';
import './video-mask-modal.scss';
import blurImg from '../../../component/images/blur.png';
import moonImg from '../../../component/images/moon.jpg';



const maskBackgroundList = [
  { key: 'blur', url: blurImg, label: 'Blur' },
  { key: 'moon', url: moonImg, label: 'Moon' }
];

export const VideoMaskModel = (props) => {
  const { visible, isMirrored, setVisible } = props;
  const { mediaStream } = useContext(ZoomMediaContext);
  const canvasRef = useRef(null);
  const clipRef = useRef(null);
  const [clipPos, setClipPos] = useState({ x: 0, y: 0 });
  const [background, setBackground] = useState('blur');
  const [isConfiged, setIsConfiged] = useState(false);
  const previousBackground = usePrevious(background);
  const previousClipPos = usePrevious(clipPos);

  const onClipDrag = useDebounceFn((_event, data) => {
    const { x, y } = data;
    setClipPos({ x, y });
  }, 50).run;

  const onBackgroundClick = useCallback((key) => {
    setBackground(key);
  }, []);

  const onCloseVideoPreview = useCallback(() => {
    mediaStream?.stopPreviewVideoMask();
    setVisible(false);
    setIsConfiged(false);
  }, [mediaStream, setVisible]);

  useEffect(() => {
    if (visible) {
      const bg = maskBackgroundList.find((item) => item.key === background)?.url ?? null;
      const scale = 32 / 13;
      let x = Math.floor(clipPos.x * scale) + 256;
      if (isMirrored) {
        x = 1280 - x;
      }
      const y = Math.floor(clipPos.y * scale) + 256;
      const mask = {
        imageUrl: bg,
        cropped: true,
        rootWidth: 1280,
        rootHeight: 720,
        clip: [
          {
            type: 'circle',
            radius: 256,
            x,
            y
          }
        ]
      };
      if (canvasRef.current) {
        if (isConfiged) {
          if (background !== previousBackground || clipPos !== previousClipPos)
            mediaStream?.updateVideoMask(mask);
        } else {
          if (bg !== undefined) {
            mediaStream?.previewVideoMask(canvasRef.current, mask);
            setIsConfiged(true);
          }
        }
      }
    }
  }, [visible, mediaStream, background, clipPos, isConfiged, previousBackground, previousClipPos, isMirrored]);

  return (
    <Dialog open={visible} onClose={onCloseVideoPreview} fullWidth maxWidth="sm">
      <DialogTitle>
        Video Mask Setting
        <IconButton
          edge="end"
          color="inherit"
          onClick={onCloseVideoPreview}
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="video-preview">
          <canvas className="video-preview-canvas" ref={canvasRef} />
          {background !== 'none' && (
            <Draggable nodeRef={clipRef} bounds="parent" onDrag={onClipDrag} defaultPosition={clipPos}>
              <div className="video-clip" ref={clipRef} />
            </Draggable>
          )}
        </div>
        <Typography variant="h6" gutterBottom>Choose background</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant={background === 'none' ? 'contained' : 'outlined'}
            onClick={() => onBackgroundClick('none')}
          >
            None
          </Button>
          {maskBackgroundList.map((item) => (
            <Button
              key={item.key}
              variant={background === item.key ? 'contained' : 'outlined'}
              onClick={() => onBackgroundClick(item.key)}
              sx={{ position: 'relative' }}
            >
              <img src={item.url} alt="" className="video-background-item-img" style={{ width: 40, height: 40, marginRight: 8 }} />
              {item.label}
            </Button>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
