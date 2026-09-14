import React from 'react';
import ChipMUI from '@mui/material/Chip';
import palette from 'src/theme/palette';
import  startCase from 'lodash/startCase';
import { getChipColor } from '../Table/tableChips';

const Chip = ({ label, ...restProps }) => (
  <ChipMUI
    label={startCase(label)}
    sx={{
      mx: 2,
      fontSize: '0.6rem',
      height: 18,
      color: palette.background.appleGreen,
      ...getChipColor(label),
    }}
    {...restProps}
  />
);

export default Chip;
