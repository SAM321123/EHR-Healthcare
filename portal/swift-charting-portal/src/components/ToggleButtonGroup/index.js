import React, { useCallback, useState } from 'react';
import { ToggleButtonGroup, ToggleButton, useTheme } from '@mui/material';

import { get } from 'src/lib/lodash';
import Typography from '../Typography';

import './toggleButtonGroup.scss';

const RadioButtonGroup = ({
  name, options, style = {}, register, onChange, defaultValue = '', reduxValue,
}) => {
  const { labelStyle = {}, buttonStyle = {}, wrapperStyle = {} } = style;
  const theme = useTheme();
  const tableHeaderColors = get(theme, 'palette.table.tableHeader', {});
  const [value, setValue] = useState(reduxValue === undefined ? defaultValue : reduxValue);

  const handleRadioChange = useCallback((event, newValue) => {
    setValue(newValue);
    onChange({ [name]: newValue });
  }, [onChange, name]);

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={options.length > 1 && handleRadioChange}
      aria-label="radio-buttons"
      className="toggle-Buttons-wrapper"
      style={{ ...wrapperStyle }}
    >
      {options?.map((item) => (
        <ToggleButton
          value={item?.value}
          className="toggle_button"
          aria-label={item?.label}
          key={item?.label}
          startIcon={item?.startIcon}
          sx={{
            border: 'none',
            color: tableHeaderColors?.toggleButtonLabel,
            backgroundColor: tableHeaderColors?.toggleButtonBackground,
            '&.MuiToggleButton-root.Mui-selected': {
              background: `${tableHeaderColors?.togglebuttonSelectedBackground} !important`,
              color: `${tableHeaderColors?.toggleButtonActiveLabel}!important`,
              '& .MuiTypography-body1': {
                fontWeight: value === item?.label ? '600' : 'inherit',
              },
            },
          }}
          {...register}
          style={{ ...buttonStyle }}
        >
          <Typography className="button-label" style={labelStyle}>
            {item.startIcon && (
              <span className="toggleButton-start-icon">{item.startIcon}</span>
            )}

            {item?.label}
          </Typography>
          {item?.count && (
            <Typography
              className="count"
              sx={{
                backgroundColor:
                  value === item?.value
                    ? `${tableHeaderColors?.selectedCountBackground} !important`
                    : `${tableHeaderColors?.countBackground}`,
              }}
            >
              {item?.count}
            </Typography>
          )}
          {item.endIcon && <Typography>{item.endIcon}</Typography>}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default RadioButtonGroup;
