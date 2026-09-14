import * as React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import TextField from '@mui/material/TextField';
import cloneDeep from 'lodash/cloneDeep';
import TagsInput from '../../TagsInput';

const FormTagsInput = ({
  variant,
  label,
  register,
  control,
  setValue,
  loading,
  onSearch,
  optionsParser = (options) => options,
  ...restProps
}) => (
  <Controller
    control={control}
    {...register}
    render={({ field, fieldState: { error } }) => {
      const { ref, onChange, value } = field;
      return (
        <TagsInput
          {...field}
          onChange={(newValue) => {
            setValue(register?.name, newValue);
            onChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={error?.message}
              helperText={error?.message || null}
              required={restProps?.required?.value}
              inputRef={ref}
              onChange={onSearch}
              InputProps={{
                ...params.InputProps,
              }}
              size="small"
            />
          )}
          {...restProps}
          // eslint-disable-next-line no-nested-ternary
          value={value ? optionsParser(cloneDeep(value)) : []}
        />
      );
    }}
  />
);

FormTagsInput.defaultProps = {
  variant: 'combo-box-demo',
  label: '',
  register: {},
  error: '',
  loading: false,
};

FormTagsInput.propTypes = {
  variant: PropTypes.string,
  label: PropTypes.string,
  register: PropTypes.instanceOf(Object),
  error: PropTypes.string,
  loading: PropTypes.bool,
};

export default FormTagsInput;
