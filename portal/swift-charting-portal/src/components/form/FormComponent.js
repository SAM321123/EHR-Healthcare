/* eslint-disable react/jsx-pascal-case */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';

import WiredSelect from 'src/wiredComponent/Form/Select';
import WiredAutoComplete from 'src/wiredComponent/Form/Autocomplete';
import {
  onlyNumber,
  regEmail,
  regPassword,
  regTextArea,
  regexName,
  regexAlphanumeric,
  onlyAlphabet,
  noHtmlTagPattern,
  regPostalCode,
} from 'src/lib/constants';
import { FormLabel, InputLabel, Tooltip } from '@mui/material';
import { City, Country, State } from 'country-state-city';
import { getFormValidations } from 'src/lib/utils';
import { get, isEmpty } from '../../lib/lodash';
import AutoComplete from './AutoComplete';
import CheckboxLabel from './Checkbox';
import RadioGroup from './RadioButton';
import TextAreaInput from './TextArea';
import DatePicker from './DatePicker';
import TextInput from './TextInput';
import NestedForm from './NestedForm';
import Select from './Select';

import Editor from './Editor/editor';
import UploadFile from './UploadFile';
import FormPhoneInput from './PhoneInput';
import TextLabel from './TextLabel';
import DatetimePicker from './DatetimePicker';
import FormMapAutocomplete from './MapAutocomplete';
import FormTimePicker from './TimePicker';
import TagsInput from './TagsInput';
import Matrix from './Matrix';
import FormEsignature from './E-Signature';
import Slider from './Slider';
import CheckboxGroup from './CheckboxGroup';
import NestedFormTable from './NestedFormTable';
import palette from 'src/theme/palette';
import FormTimeInput from './TimeInput';
import NestedFormTableV2 from './NestedFormTableV2';
import { StripeTextFieldCVC, StripeTextFieldExpiry, StripeTextFieldNumber } from './StripeInput/stripeFields';

const getAddressGroup = (item, columnsPerRow, form) => {
  const allCountries = Country.getAllCountries();
  const usCountry = allCountries.find((country) => country.isoCode === 'US');
  const otherCountries = allCountries.filter((country) => country.isoCode !== 'US');
  const {watch,setValue} = form;
  const handleCountryChange = ()=>{
    setValue(`${item.name}.state`, undefined)
    setValue(`${item.name}.locality`, undefined)
    setValue(`${item.name}.stateCode`,undefined)
  }

  const cityArray =  !isEmpty(watch(`${item.name}.stateCode`))? City.getCitiesOfState(watch(`${item.name}.countryCode`),watch(`${item.name}.stateCode`)):[];
  const statesArray = !isEmpty(watch(`${item.name}.countryCode`)) ? State.getStatesOfCountry(watch(`${item.name}.countryCode`)):[];
  const handleStateChange = ()=>{
    setValue(`${item.name}.locality`, undefined)
  }
  return ([
    { label: 'Address',required: {value:false},...item,inputType: 'addressAutoComplete', colSpan:item?.itemProps?.address?.colSpan ||  columnsPerRow/2},
// {
//   component: ()=> <div style={{display: 'flex', border: '1px dashed rgba(145, 158, 171, 0.32)'}} />,
//   colSpan:columnsPerRow
// },  
//  {
//     inputType: 'text',
//     name: 'address.addressLine1',
//     textLabel: 'Address',
//     required: item.required,
//     maxLength: { value: 250 },
//     pattern:regTextArea,
//     isShrink:watch('address.description'),
//     colSpan:item?.itemProps?.addressLine1?.colSpan || 1
//   },
  // {
  //   inputType: 'text',
  //   name: 'address.addressLine2',
  //   textLabel: 'Address line 2',
  //   maxLength: { value: 250 },
  //   pattern:regTextArea,
  //   isShrink:watch('address.description')
  // },
  {
    inputType: 'select',
    name: `${item.name}.countryCode`,
    label: item?.itemProps?.countryCode?.label || 'Country',
    valueAccessor: 'isoCode',
    labelAccessor: 'name',
    options: usCountry ? [usCountry, ...otherCountries] : allCountries,
    colSpan: item?.itemProps?.countryCode?.colSpan || columnsPerRow/2,
    required: item.required,
    onChange:handleCountryChange
  },
  {
    inputType: 'select',
    name: `${item.name}.stateCode`,
    textLabel: item?.itemProps?.stateCode?.label|| 'State',
    valueAccessor: 'isoCode',
    labelAccessor: 'name',
    options:statesArray,
    colSpan: item?.itemProps?.stateCode?.colSpan|| columnsPerRow/2,
    required: item.required,
    onChange:handleStateChange
  },
  {
    inputType: 'text',
    name: `${item.name}.locality`,
    valueAccessor: 'name',
    labelAccessor: 'name',
    required:item.required,
    textLabel: item?.itemProps?.city?.label|| 'City',
    disabled:isEmpty(watch(`${item.name}.stateCode`)),
    colSpan: item?.itemProps?.city?.colSpan || columnsPerRow/2,
  },
  {
    inputType: 'text',
    name: `${item.name}.postalCode`,
    textLabel: item?.itemProps?.postalCode?.label|| 'ZIP code',
    colSpan:item?.itemProps?.postalCode?.colSpan ||  columnsPerRow/2,
    maxLength: { value: 12 },
    required: item.required,
    pattern:regPostalCode,
    isShrink:watch(`${item.name}.description`)
  },
])}

const TooltipComp = ({ description }) => (
  <Tooltip title={description} arrow placement="bottom-start" followCursor>
    <img
      alt="info"
      src="/assets/icons/info.svg"
      width="18"
      style={{
        marginLeft: '4px',
        paddingTop: '0px',
      }}
      color="#919EAB"
    />
  </Tooltip>
);

const ItemWrapper = (Component) =>
  function WithFormItem(props) {
    const { form, dependencies, columnsPerRow, item, fieldWrapper, index } =
    props;
    const [extraAPIParams, setExtraAPIParams] = useState();

    const { watch } = form;
    const FormItemComponent = fieldWrapper
      ? fieldWrapper(Component, index, item)
      : Component;

    const handleDependencyChange = useCallback(
      (value, isValueChanged = false) => {
        const dependenciesCalc = dependencies?.calc(value, form, {
          isValueChanged,
        });
        if (dependenciesCalc?.reFetch) {
          setExtraAPIParams(dependenciesCalc);
        } else {
          setExtraAPIParams();
        }
      },
      [dependencies, form]
    );

    useEffect(() => {
      const subscription = watch((value, { name,type }) => {
        if (dependencies?.keys?.indexOf(name) > -1) {
          handleDependencyChange(value, type==='change');
        }
      });
      return () => subscription.unsubscribe();
    }, [watch]);


    useEffect(() => {
      if (dependencies?.keys) {
        setTimeout(()=>{

          handleDependencyChange(form.getValues());
        },100)
      }
    }, []);

    if (props?.hide) {
      return null;
    }

    if (dependencies?.keys) {
      watch(dependencies?.keys);
      const dependenciesCalc = dependencies?.calc(form.getValues(), form);
      if (dependenciesCalc?.hide) {
        return null;
      }
    }

    let overrideProps = {};

    if (item?.inputType === 'number') {
      overrideProps = { type: 'number' };
    }

    const isOtherInput =
      item?.inputType === 'radio' ||
      item?.inputType === 'editor' ||
      item?.inputType === 'matrix' ||
      item?.inputType === 'signature' ||
      item?.inputType === 'checkBox' ||
      item?.inputType === 'uploadFile';

    return (
      <Grid
        key={item}
        item
        xs={12}
        sx={{ display: 'flex',...item?.cstSx }}
        md={12 / (item?.colSpan ? columnsPerRow / item.colSpan : columnsPerRow)}
      >
        <FormItemComponent
          {...props}
          {...extraAPIParams}
          extraAPIParams={extraAPIParams}
          {...overrideProps}
        />
        {item?.description && !isOtherInput && (
          <TooltipComp description={item?.description} />
        )}
      </Grid>
    );
  };

const ComponentMap = {
  autoComplete: ItemWrapper(AutoComplete),
  checkBox: ItemWrapper(CheckboxLabel),
  textArea: ItemWrapper(TextAreaInput),
  radio: ItemWrapper(RadioGroup),
  date: ItemWrapper(DatePicker),
  text: ItemWrapper(TextInput),
  editor: ItemWrapper(Editor),
  wiredAuto: ItemWrapper(WiredAutoComplete),
  wiredSelect: ItemWrapper(WiredSelect),
  select: ItemWrapper(Select),
  uploadFile: ItemWrapper(UploadFile),
  phoneInput: ItemWrapper(FormPhoneInput),
  textLabel: ItemWrapper(TextLabel),
  nestedForm: ItemWrapper(NestedForm),
  nestedTable: ItemWrapper(NestedFormTable),
  nestedTableV2: ItemWrapper(NestedFormTableV2),
  dateTime: ItemWrapper(DatetimePicker),
  addressAutoComplete: ItemWrapper(FormMapAutocomplete),
  timePicker: ItemWrapper(FormTimePicker),
  tags: ItemWrapper(TagsInput),
  matrix: ItemWrapper(Matrix),
  signature: ItemWrapper(FormEsignature),
  slider: ItemWrapper(Slider),
  multiSelect: ItemWrapper(Select),
  multiChoice: ItemWrapper(CheckboxGroup),
  number: ItemWrapper(TextInput),
  timeInput: ItemWrapper(FormTimeInput),
  stripeCardNumber:ItemWrapper(StripeTextFieldNumber),
  stripeExpiry:ItemWrapper(StripeTextFieldExpiry),
  stripeCVV:ItemWrapper(StripeTextFieldCVC),
};

const regexMap = {
  onlyAlphabet,
  alphanumeric: regexAlphanumeric,
  commonText: noHtmlTagPattern,
  email: regEmail,
};

const validatePattern = (item) => {
  const { inputType, pattern, multiline, validation } = item || {};
  if ((inputType === 'text' || inputType === 'textArea') && validation) {
    return regexMap[validation];
  }
  if (pattern) return pattern;
  if ((inputType === 'text' && multiline) || inputType === 'textArea') {
    return {
      value: regTextArea.value,
      message: `${item?.label || ''} ${regTextArea?.message}`,
    };
  }
  if (inputType !== 'text') return undefined;

  switch (item?.type) {
    case 'number':
      return {
        value: onlyNumber.value,
        message: `${item?.label || item?.textLabel} ${onlyNumber?.message}`,
      };
    case 'email':
      return regEmail;
    case 'password':
      return regPassword;
    default:
      return {
        value: regexName.value,
        message: `${item?.textLabel} ${regexName?.message}`,
      };
  }
};

const Container = ({ children, applyContainer, spacing }) => {
  if (applyContainer) {
    return (
      <Grid container spacing={spacing}>
        {children}
      </Grid>
    );
  }

  return (
    <Grid item style={{ paddingLeft: 0, paddingTop: 0, width: '100%' }}>
      <Grid
        container
        spacing={spacing}
        sx={{
          margin: '0',
          paddingRight: '0px',
          width: '100%',
          paddingLeft: 0,
          paddingBottom: 0,
        }}
      >
        {children}
      </Grid>
    </Grid>
  );
};

const FormComponent = ({
  formGroups,
  columnsPerRow,
  gridGap = 3,
  defaultValue = {},
  form,
  fieldWrapper,
  applyContainer = true,
  preview=false,
}) => {
  const {
    register,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = form;
  return (
    <Container applyContainer={applyContainer} spacing={gridGap}>
      {formGroups?.map((item, index) => {
        if (item?.inputType === 'checkBox' || item?.inputType === 'switch') {
          item.defaultChecked = defaultValue?.[item?.name];
        } else {
          item.defaultValue = defaultValue?.[item?.name];
        }
        if (item?.inputType === 'multiSelect') {
          item.multiple = true;
        }
        if (item?.component && !item.hide) {
          const Component = item.component;
          const _Component = ItemWrapper(Component);
          return (
            <Grid
              key={index}
              item
              xs={12}
              md={
                12 /
                (item?.colSpan ? columnsPerRow / item.colSpan : columnsPerRow)
              }
              {...item.gridProps}
            >
              <_Component
                control={control}
                register={register}
                setValue={setValue}
                item={item}
                error={get(errors, `${item.name}.message`)}
                getValues={getValues}
                form={form}
                {...item}
              />
            </Grid>
          );
        }
        if (
          ComponentMap[item?.inputType] ||
          item?.inputType === 'mapAutoComplete'
        ) {
          const FormItemComponent = ComponentMap[item?.inputType];
          return item?.inputType === 'mapAutoComplete' ? (
            <AddressComponent
              formGroups={getAddressGroup(item, columnsPerRow, form)}
              columnsPerRow={columnsPerRow}
              gridGap={gridGap}
              defaultValue={defaultValue}
              form={form}
              fieldWrapper={fieldWrapper}
              name={item.name}
              preview={preview}
            />
          ) : (
            <FormItemComponent
              key={`${item.inputType}-${index}-${item.textLabel || item.label}`}
              preview={preview}
              sx={{
                backgroundColor: 'transparent',
                ...item?.inputStyle,
              }}
              error={get(errors, `${item?.name}.message`, '')}
              register={
                item?.formGroups || item.inputType === 'matrix'
                  ? register
                  : {
                      ...register(item?.name, {
                        required: item?.required && {
                          message: `${
                            item.label || item.textLabel || 'This field'
                          } is required`,
                          value: item?.required?.value && !item.hide,
                        },
                        pattern: validatePattern(item),
                        maxLength: item?.maxLength && {
                          message: `${
                            item.label || item.textLabel
                          } should not be greater than ${item.maxLength.value}`,
                          ...item?.maxLength,
                        },
                        minLength: item?.minLength && {
                          message: `${
                            item.label || item.textLabel
                          } should be greater than ${item.minLength.value}`,
                          ...item?.minLength,
                        },
                        validate: getFormValidations(item),
                      }),
                    }
              }
              setValue={setValue}
              control={control}
              getValues={getValues}
              form={form}
              {...item}
              columnsPerRow={columnsPerRow}
              item={item}
              fieldWrapper={fieldWrapper}
              index={index}
              label={item.label || item.textLabel}
            />
          );
        }
        if (Array.isArray(item.fields)) {
          return (
            <Grid
            key={`${item.inputType}-${index}-${item.textLabel || item.label}-with-fields`}
              item
              xs={12}
              md={
                12 /
                (item?.colSpan ? columnsPerRow / item.colSpan : columnsPerRow)
              }
              {...item.gridProps}
            >
              {item?.label && (
                <div style={{display:'flex' }}>
                  <FormLabel
                    required={item?.required?.value}
                    shrink={false}
                    style={{
                      color: palette.text.primary,
                      fontSize: 12,
                      lineHeight: '18px',
                      fontWeight: 500,
                      marginBottom: '4px',
                    }}
                  >
                    {item?.label}
                  </FormLabel>
                </div>
              )}
              <Grid style={{ display: 'flex', gap: 10 }}>
                {item.fields.map((_item,_index) => {
                  if (_item?.component && !_item.hide) {
                    const Component = _item.component;
                    const _Component = ItemWrapper(Component);
                    return (
                      <Grid
                       key={`${_index}-${index}-${item.textLabel || item.label}-fields`}
                        item
                        xs={12}
                        md={
                          12 /
                          (_item?.colSpan
                            ? columnsPerRow / _item.colSpan
                            : columnsPerRow)
                        }
                        {..._item.gridProps}
                      >
                        <_Component
                          control={control}
                          register={register}
                          setValue={setValue}
                          item={_item}
                          error={get(errors, `${_item.name}.message`)}
                          getValues={getValues}
                          form={form}
                          {..._item}
                        />
                      </Grid>
                    );
                  }
                  const FormItemComponent = ComponentMap[_item?.inputType];
                  return (
                    <FormItemComponent
                    key={`${_item.inputType}-${_index}-${index}-${item.textLabel || item.label}-fields`}
                      sx={{
                        backgroundColor: 'transparent',
                        ..._item?.inputStyle,
                      }}
                      preview={preview}
                      error={get(errors, `${_item?.name}.message`, '')}
                      register={
                        _item?.formGroups || _item.inputType === 'matrix'
                          ? register
                          : {
                              ...register(_item?.name, {
                                required: _item?.required && {
                                  message: `${
                                    _item.label ||
                                    _item.textLabel ||
                                    'This field'
                                  } is required`,
                                  ..._item?.required,
                                },
                                pattern: validatePattern(_item),
                                maxLength: _item?.maxLength && {
                                  message: `${
                                    _item.label || _item.textLabel
                                  } should not be greater than ${
                                    _item.maxLength.value
                                  }`,
                                  ..._item?.maxLength,
                                },
                                minLength: _item?.minLength && {
                                  message: `${
                                    _item.label || _item.textLabel
                                  } should be greater than ${
                                    _item.minLength.value
                                  }`,
                                  ..._item?.minLength,
                                },
                                validate: getFormValidations(_item),
                              }),
                            }
                      }
                      setValue={setValue}
                      control={control}
                      getValues={getValues}
                      form={form}
                      {..._item}
                      columnsPerRow={columnsPerRow}
                      item={_item}
                      fieldWrapper={fieldWrapper}
                      index={index}
                      label=""
                      textLabel=""
                    />
                  );
                })}
              </Grid>
            </Grid>
          );
        }
        return null;
      })}
    </Container>
  );
};

const AddressComponent = ({
  formGroups,
  columnsPerRow,
  gridGap,
  defaultValue,
  form,
  fieldWrapper,
  name,
}) => {
  const { watch, setValue } = form;

  useEffect(() => {
    if (!isEmpty(defaultValue)) {
      const  address  = defaultValue?.[name] || {};
      setTimeout(()=>{      
      setValue(`${name}.countryCode`, address.countryCode,{
        shouldValidate: true,

      });
      setValue(`${name}.state`, address.state,{
        shouldValidate: true,

      });
      setValue(`${name}.locality`, address.locality,{
        shouldValidate: true,

      });
      // setValue(`${name}.addressLine1', address.addressLine1);
      // setValue(`${name}.addressLine2', address.addressLine2);
      setValue(`${name}.postalCode`, address.postalCode,{
        shouldValidate: true,

      });
      setValue(`${name}.stateCode`, address.stateCode,{
        shouldValidate: true,

      });
    },100)
    }
  }, [defaultValue]);

  useEffect(() => {
    const subscription = watch((value, { name : itemName },...rest) => {
        if (itemName === name) {
          const address = value?.[name] || {};
          if(!isEmpty(address)){
          setValue(`${name}.countryCode`, address?.countryCode,{
            shouldValidate: true,

          });
          setValue(`${name}.state`, address?.state,{
            shouldValidate: true,

          });
          setValue(`${name}.locality`, address?.locality,{
            shouldValidate: true,

          });
          // setValue(`${name}.addressLine1', address?.addressLine1);
          // setValue(`${name}.addressLine2', address?.addressLine2);
          setValue(`${name}.postalCode`, address?.postalCode,{
            shouldValidate: true,

          });
          setValue(`${name}.stateCode`, address?.stateCode,{
            shouldValidate: true,

          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <FormComponent
      formGroups={formGroups}
      columnsPerRow={columnsPerRow}
      gridGap={gridGap}
      defaultValue={defaultValue}
      form={form}
      fieldWrapper={fieldWrapper}
      applyContainer={false}
    />
  );
};

export default FormComponent;
