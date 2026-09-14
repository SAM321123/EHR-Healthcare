import React, { useEffect, useState, useCallback } from 'react';
import Typography from 'src/components/Typography';
import { isFunction } from 'src/lib/lodash';
import Box from 'src/components/Box';
import CustomButton from 'src/components/CustomButton';
import { bodyAreaCoords } from './utils';

const BodyMap = ({ modalCloseAction, setBodyGraphValue }) => {
  const [selectedPart, setSelectedPart] = useState(null);

  useEffect(
    () => () => {
      if (isFunction(setBodyGraphValue)) setBodyGraphValue(selectedPart);
    },
    [selectedPart]
  );

  const getElement = useCallback(
    (id) => document?.getElementById(id),
    [selectedPart]
  );
  const onBodyPartClick = useCallback(
    (event) => {
      const bodyArea = event?.target?.getAttribute('title');
      const bodyValue = event?.target?.getAttribute('value');

      const coord = event?.target?.getAttribute('coords');

      const pairs = coord.split(',').reduce((result, value, index, array) => {
        if (index % 2 === 0) result.push(array.slice(index, index + 2));
        return result;
      }, []);

      const bodyCanvas = getElement('bodyCanvas'); // byId('myCanvas');
      const ctx = bodyCanvas?.getContext('2d');
      if (bodyArea === selectedPart?.title) {
        ctx.clearRect(0, 0, bodyCanvas?.width, bodyCanvas?.height);
        setSelectedPart('');
        return;
      }

      setSelectedPart({ title: bodyArea, value: bodyValue });
      ctx.clearRect(0, 0, bodyCanvas?.width, bodyCanvas?.height);
      ctx.lineTo(0, 0, bodyCanvas?.width, bodyCanvas?.height);
      ctx.beginPath();
      ctx.moveTo(pairs[0][0], pairs[0][1]);

      // Draw lines to each of the subsequent coordinates
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i < pairs.length; i++) {
        ctx.lineTo(pairs[i][0], pairs[i][1]);
      }
      // Fill the shape
      ctx.fillStyle = 'rgba(52, 178, 56, 0.5)';
      ctx.fill();
    },
    [selectedPart]
  );

  let hdc;

  const drawPoly = useCallback((coOrdStr) => {
    const mCoords = coOrdStr?.split(',');
    let i;
    const n = mCoords?.length;

    hdc?.beginPath();
    hdc?.moveTo(mCoords[0], mCoords[1]);
    for (i = 2; i < n; i += 2) {
      hdc?.lineTo(mCoords[i], mCoords[i + 1]);
    }
    hdc?.lineTo(mCoords[0], mCoords[1]);
    hdc?.stroke();
  }, []);
  const handleMouseEnter = useCallback((element) => {
    // const hoveredElement = element;
    const coordStr = element?.getAttribute
      ? element?.getAttribute('coords')
      : null;
    // const areaType = element.getAttribute('shape');

    // eslint-disable-next-line default-case
    drawPoly(coordStr);
  }, []);

  const handleMouseOut = useCallback(() => {
    const bodyCanvas = getElement('bodyCanvas');
    hdc?.clearRect(0, 0, bodyCanvas?.width, bodyCanvas?.height);
  }, []);

  return (
    <div
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      <div style={{ cursor: 'crosshair' }}>
        <div
          id="mapster_wrap_0"
          style={{
            display: 'block',
            position: 'relative',
            padding: '0px',
            width: '435px',
            height: '433px',
          }}
        >
          <img
            alt="bodymap"
            src="/assets/images/bodymap.png"
            useMap="#body-map"
            style={{ width: '435px', height: '433px', opacity: 1 }}
          />
          <canvas
            id="bodyCanvas"
            width="435px"
            height="433px"
            style={{
              position: 'absolute',
              left: '0px',
              top: '0px',
              padding: '0px',
              border: '0px',
              pointerEvents: 'none',
            }}
          />
        </div>

        <map name="body-map">
          {bodyAreaCoords?.map((item) => (
            <area
              aria-hidden="true"
              onClick={onBodyPartClick}
              shape="poly"
              alt={item?.value}
              key={item?.value}
              onFocus={handleMouseEnter}
              onBlur={handleMouseOut}
              {...item}
            />
          ))}
        </map>
      </div>
      {selectedPart && (
        <Typography variant="caption">
          Body Part Selected: {selectedPart?.title}
        </Typography>
      )}
      <Box align="right" sx={{ mt: 2 }}>
        <CustomButton
          label="Submit"
          onClick={isFunction(modalCloseAction) ? modalCloseAction : null}
        />
      </Box>
    </div>
  );
};

export default BodyMap;
