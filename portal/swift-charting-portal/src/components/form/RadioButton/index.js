import { Controller } from 'react-hook-form';
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';

import MUIRadio from '@mui/material/Radio';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import MUIRadioGroup from '@mui/material/RadioGroup';
import MUIFormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import palette from 'src/theme/palette';

const FormRadioButton = (props) => {
  const { options = [], control, register, textLabel, error,...restProps } = props;

  return (
    <Controller
      control={control}
      {...register}
      render={({ field }) => {
        const { value } = field;
        return (
          <FormControl error={error} sx={{           '& .MuiFormLabel-root': {
            fontSize: '12px',
            marginBottom:'4px',
            color:palette.text.primary,
            lineHeight:'18px',
            fontWeight:500,
          },}}>
            {textLabel && <FormLabel required={restProps?.item?.required?.value} sx={{ mr: 2 }}>{textLabel}</FormLabel>}
            <MUIRadioGroup row {...field} value={(value || value===0) ? cloneDeep(value) : ''}>
              {options.map((item) => (
                <MUIFormControlLabel
                  key="options"
                  value={item?.value}
                  style={{
                    borderRadius: '8px',
                    paddingRight: '15px',
                  }}
                  sx={{
                    '& .MuiTypography-root': {
                      paddingBottom: '0',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: '19.6px',
                    },
                  }}
                  control={<MUIRadio />}
                  label={item?.label}
                />
              ))}
            </MUIRadioGroup>
            <FormHelperText id="select-helper-text" sx={{ marginLeft: '4px' }}>
              {error}
            </FormHelperText>
          </FormControl>
        );
      }}
    />
  );
};

FormRadioButton.defaultProps = {
  options: [],
  defaultValue: '',
  controller: () => {},
  radioGroupProps: {},
  register: {},
};

FormRadioButton.propTypes = {
  options: PropTypes.objectOf,
  defaultValue: PropTypes.string,
  controller: PropTypes.func,
  radioGroupProps: PropTypes.objectOf,
  register: PropTypes.instanceOf(Object),
};

export default FormRadioButton;
