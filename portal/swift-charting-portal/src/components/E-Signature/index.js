import React, { useCallback, useEffect, useRef, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import SignatureCanvas from 'react-signature-canvas';
import { debounce } from 'lodash';
import { Card, Link, TextField } from '@mui/material';

import palette from 'src/theme/palette';
import Typography from '../Typography';
import Box from '../Box';

const Esignature = ({ onChange, defaultValue, label, error }) => {
  const [flag, setFlag] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const sigCanvas = useRef(null);
  const canvasRef = useRef(null);

  const debouncedCanvasUpdate = useCallback(
    debounce((text) => {
      const canvas = canvasRef?.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.font = "1.3rem 'Dancing Script', cursive";
      context.fillStyle = '#145394';
      context.fillText(text, 10, 30);
      const imageUrl = canvasRef?.current?.toDataURL('image/png');
      onChange(imageUrl);
    }, 1000), // delay of 1 second
    []
  );

  const handleInputChange = useCallback(
    (event) => {
      const text = event.target.value;
      setInputValue(event.target.value);
      debouncedCanvasUpdate(text);
    },
    [debouncedCanvasUpdate, onChange]
  );

  const handleClick = useCallback(() => {
    setFlag((curr) => !curr);
    setInputValue('');
    onChange('');
  }, []);

  const onClear = useCallback(() => {
    sigCanvas?.current?.clear();
    onChange('');
  }, []);

  useEffect(() => {
    if (defaultValue) {
      sigCanvas?.current?.fromDataURL(defaultValue);
    }
  }, [flag, defaultValue]);

  const onEnd = () => {
    const signatureDrawByUser = sigCanvas?.current?.toDataURL('image/png');
    onChange(signatureDrawByUser);
  };

  return (
    <Card
      sx={{
        backgroundColor: palette.background.paper,
        border: !error ? `1px solid ${palette.grey[300]}` : `1px solid #FF4842`,
        boxShadow: 'none',
        borderRadius: '6px',
      }}
    >
      <Box sx={{ p: '15px' }}>
        <Typography className="esignature-text" sx={{ fontSize: '20px', fontWeight: '500' }}>
          {label || 'e-signature'}
        </Typography>
        <Typography className="signature-text" sx={{ fontSize: '20px', fontWeight: '500',display:'none' }}>
          signature
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: '6px',
            mb: '1px',
            gap:5,
          }}
        >
          {flag ? (
            <Link
              sx={{ cursor: 'pointer', textDecoration: 'none' }}
              onClick={onClear}
              class="clear-text"
            >
              clear
            </Link>
          ) : (
            <Typography
              sx={{ fontStyle: 'italic', fontFamily: 'Georgia,Times,serif;' }}
            >
              Print your name
            </Typography>
          )}

          <Link
            sx={{ cursor: 'pointer', textDecoration: 'none' }}
            onClick={handleClick}
            className="type-draw-text"
          >
            {flag ? 'Type Instead' : 'Draw Instead'}
          </Link>
        </Box>
        {!flag ? (
          <TextField
            size="small"
            style={{ width: '100%' }}
            onChange={handleInputChange}
            value={inputValue}
          />
        ) : (
          <Box sx={{ border: `1px solid ${palette.grey[700]}` }}>
            <SignatureCanvas
              penColor="#145394"
              minWidth={1}
              maxWidth={1}
              onEnd={onEnd}
              ref={sigCanvas}
              canvasProps={{
                style: { width: '100%', fontSize: '1.3rem', height: '150px' },
              }}
            />
          </Box>
        )}
        <Box
          style={{
            width: '100%',
            height: '70px',
            overflow: 'hidden',
            display: !flag ? 'block' : 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasRef?.current?.offsetWidth}
            style={{
              marginTop: '10px',
              width: '100%',
              height: '150px',
            }}
          />
        </Box>
      </Box>
    </Card>
  );
};
export default Esignature;
