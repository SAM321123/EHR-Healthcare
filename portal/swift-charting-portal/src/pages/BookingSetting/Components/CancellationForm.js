import TextLabel from 'src/components/form/TextLabel';
import TextInput from 'src/components/form/TextInput';
import palette from 'src/theme/palette';
import { maxLength, regTextArea } from 'src/lib/constants';
import { useRef } from 'react';

const FormInput = ({
  name,
  required,
  endAdornment,
  formProps: { control, register, setValue, getValues, form },
  ...otherProps
}) => {
  const { watch } = form;
  const ref = useRef();
  watch(name);
  const formData = form.getValues();
  if (formData?.[name]?.length > 2) {
    setValue(name, ref.current);
  } else {
    ref.current = formData?.[name];
  }
  return (
    <div>
      <TextInput
        type="number"
        name={name}
        maxLength={maxLength(name, 2)}
        InputProps={{
          endAdornment,
        }}
        sx={{
          width: 80,
          backgroundColor: 'transparent',
        }}
        register={{
          ...register(name, {
            required,
            maxLength: { value: 2, message: 'max 2 digits' },
          }),
        }}
        setValue={setValue}
        control={control}
        getValues={getValues}
        form={form}
        {...otherProps}
      />
    </div>
  );
};

const validateMaxLength = (value) => {
  if (value?.length > 500) {
    return false;
  }
  return true;
};

const FormTextArea = ({
  name,
  required,
  formProps: { control, register, setValue, getValues, form },
  ...otherProps
}) => (
  <div>
    <TextInput
      type="text"
      name={name}
      variant="outlined"
      sx={{
        backgroundColor: 'transparent',
      }}
      minRows={3}
      multiline
      register={{
        ...register(name, {
          required,
          pattern: regTextArea,
          maxLength: { value: 500, message: 'Max 500 Character' },
          validate: (value) => validateMaxLength(value),
        }),
      }}
      setValue={setValue}
      control={control}
      getValues={getValues}
      form={form}
      {...otherProps}
    />
  </div>
);

const HRSLabel = ({ styles = {} }) => (
  <div
    style={{
      height: '37px',
      margin: '0 10px',
      padding: '6px 20px',
      color: palette.grey[800],
      borderRadius: '8px',
      border: '0.5px solid var(--grey-2, #D7D7D7)',
      ...styles,
    }}
  >
    <span>Hr</span>
  </div>
);

const InputWrapperStyle = {
  // alignItems: 'flex-end',
  flexDirection: 'row',
  display: 'flex',
  marginBottom: '10px',
};

const CancellationForm = ({ formProps }) => (
  <div>
    {/* <div style={InputWrapperStyle}>
      <div>
        <Typography
          sx={{
            fontSize: '12px',
            color: palette.grey[600],
          }}
          variant="span"
        >
          Time
        </Typography>
        <FormInput
          name="cancellationChargeTime"
          label="cancellation Charge Time"
          formProps={formProps}
        />
      </div>
      <HRSLabel styles={{ marginTop: 24 }} />
      <div>
        <Typography
          sx={{ fontSize: '12px', color: palette.grey[600] }}
          variant="span"
        >
          Percentage
        </Typography>
        <FormInput
          name="cancellationCharge"
          formProps={formProps}
          endAdornment="%"
        />
      </div>
    </div>
    <div>
      <TextLabel
        inputType="textLabel"
        text="If a client cancels within the above mentioned hours of the appointment, charge the above mentioned % cancellation fees"
        sx={{
          fontSize: '12px',
          color: palette.grey[800],
        }}
      />
    </div> */}
    <div style={{ marginTop: '0px', marginBottom: '12px' }}>
      <TextLabel
        inputType="textLabel"
        text="Allow clients to cancel up to  XX hours before the appointment"
        sx={{
          fontSize: '12px',
          color: palette.grey[500],
        }}
      />
    </div>
    <div style={InputWrapperStyle}>
      <FormInput name="cancellationLeadTime" formProps={formProps} />
      <HRSLabel />
    </div>
    <TextLabel
      inputType="textLabel"
      text="Clients will not be allowed to cancel if less than the hours specified in above statement are left for the appointment"
      sx={{
        fontSize: '12px',
        color: palette.grey[800],
      }}
    />
    <div style={{ marginTop: '26px', marginBottom: '12px' }}>
      <TextLabel
        inputType="textLabel"
        text="Allow clients to reschedule online up to XX hours before the appointment"
        sx={{
          fontSize: '12px',
          color: palette.grey[500],
        }}
      />
    </div>
    <div style={InputWrapperStyle}>
      <FormInput name="cancellationRescheduleTime" formProps={formProps} />
      <HRSLabel />
    </div>
    <TextLabel
      inputType="textLabel"
      text="Clients will not be allowed to reschedule online if less than the hours specified in above statement are left for the appointment"
      sx={{
        fontSize: '12px',
        color: palette.grey[800],
      }}
    />
    <div style={{ marginTop: '12px' }}>
      <FormTextArea
        name="cancellationPolicyText"
        formProps={formProps}
        textLabel="Cancellation Policy Text"
        placeholder="Type here"
      />
    </div>
  </div>
);

export default CancellationForm;
