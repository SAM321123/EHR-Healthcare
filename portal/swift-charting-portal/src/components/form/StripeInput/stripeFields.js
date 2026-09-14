import { Grid, InputLabel } from '@mui/material';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from '@stripe/react-stripe-js';
import PropTypes from 'prop-types';
import { Controller, useController } from 'react-hook-form';
import TextField from 'src/components/TextInput'; // Updated to use your TextInput component
import palette from 'src/theme/palette';
import StripeInput from './stripeInput'; // Custom Stripe Input Component
import Typography from 'src/components/Typography';

// Reusable StripeTextField component using react-hook-form Controller
function StripeTextField({
  control,
  name,
  label,
  stripeElement,
  textLabel,
  required,
  disabled,
  placeholder = 'Enter here',
  sx = {},
  InputProps,
  isShrink = false,
  gridProps,
  register,
  ...restProps
}) {
  
  return (
    <Controller
    name={register?.name}
    control={control}
    render={({ field: { ref, ...field }, fieldState: { error } }) => (
      <Grid item sm={12}  {...gridProps}>
            {textLabel && <InputLabel
          required={required}
          shrink={false}
          sx={{ fontSize:12,lineHeight:'18px',fontWeight:500,color:palette.text.primary,marginBottom:'4px','& .MuiFormLabel-root': {
            fontSize: '12px',
            marginBottom:'4px',
            lineHeight:'18px',
            fontWeight:500,
            color:palette.text.primary,
            
          }, }}
      >
          {textLabel}

          </InputLabel>}
          <TextField
      type={'text'}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      fullWidth
      textLabel={textLabel || label}
      InputProps={{
        ...InputProps,
        inputProps: {
          component: stripeElement,
        },
        inputComponent: StripeInput,  // Use StripeInput as the inputComponent for Stripe Elements
      }}
      {...restProps}
      error={!!error}
      helperText={error?.message || ''}
      {...field}
      value={field.value === 0 ? 0 : field.value || ''}
      sx={{
        '& .MuiInputBase-input': {
          padding: '13px 12px',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          border: `1px solid ${palette.border.main}`,
        },
        '& .MuiInputBase-root ::placeholder': {
          fontFamily: 'Poppins',
          fontSize: 12,
          fontWeight: 400,
          lineHeight: '18px',
          color: palette.text.secondary,
        },
        ...sx,
      }}
    />
      </Grid>
    )}
  />
  );
}

StripeTextField.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  stripeElement: PropTypes.elementType.isRequired,
  textLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  sx: PropTypes.object,
  InputProps: PropTypes.object,
  isShrink: PropTypes.bool,
};

// Credit Card Number Field
export function StripeTextFieldNumber(props) {
  return <StripeTextField {...props}  stripeElement={CardNumberElement} />;
}

// Expiry Date Field
export function StripeTextFieldExpiry(props) {
  return <StripeTextField {...props} stripeElement={CardExpiryElement} />;
}

// CVC Code Field
export function StripeTextFieldCVC(props) {
  return <StripeTextField {...props} stripeElement={CardCvcElement} />;
}

export default StripeTextField;
