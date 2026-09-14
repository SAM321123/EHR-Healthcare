import PropTypes from 'prop-types';

import MUIRadio from '@mui/material/Radio';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import MUIRadioGroup from '@mui/material/RadioGroup';
import MUIFormControlLabel from '@mui/material/FormControlLabel';

const RadioGroup = (props) => {
  const { options = [], textLabel,disabled, ...restProps } = props;
  return (

          <FormControl>
            <FormLabel sx={{ mr: 2 }}>{textLabel}</FormLabel>
            <MUIRadioGroup 
              row 
              {...restProps} 
            >
              {options.map((item) => (
                <MUIFormControlLabel
                  key="options"
                  value={item?.value}
                  disabled={disabled}
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
          </FormControl>
  );
};

RadioGroup.defaultProps = {
  options: [],
  defaultValue: '',
  controller: () => {},
  radioGroupProps: {},
  register: {},
};

RadioGroup.propTypes = {
  options: PropTypes.objectOf,
  defaultValue: PropTypes.string,
  controller: PropTypes.func,
  radioGroupProps: PropTypes.objectOf,
  register: PropTypes.instanceOf(Object),
};

export default RadioGroup;
