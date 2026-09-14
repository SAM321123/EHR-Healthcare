/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useFieldArray } from 'react-hook-form';
import Select from 'src/components/form/Select';
import WiredSelect from 'src/wiredComponent/Form/Select';
import Delete from '@mui/icons-material/Delete';
import palette from 'src/theme/palette';
import FabButton from 'src/components/FabButton';
import WiredAutoComplete from 'src/wiredComponent/Form/Autocomplete';
import {
  onlyNumber,
  regEmail,
  regPassword,
  regTextArea,
  regexName,
} from 'src/lib/constants';
import { getFormValidations } from 'src/lib/utils';
import { Grid } from '@mui/material';
import TextInput from '../TextInput';
import RadioGroup from '../RadioButton';
import AutoComplete from '../AutoComplete';
import DatePicker from '../DatePicker';
import TextAreaInput from '../TextArea';
import Typography from '../../Typography';

import './nestedForm.scss';
import UploadFile from '../UploadFile';

const ItemWrapper = (Component) =>
  function WithFormItem(props) {
    const { form, dependencies, index, register,item,columnsPerRow } = props;
    const { watch } = form;
    const [extraAPIParams, setExtraAPIParams] = useState();
    const dependenciesArray = dependencies?.keys?.map(
      (key) => `${register.name.split('.')[0]}.${index}.${key}`
    );

    const handleDependencyChange = useCallback(
      (value) => {
        const dependenciesCalc = dependencies?.calc(value, index, form);
        if (dependenciesCalc.reFetch) {
          setExtraAPIParams(dependenciesCalc);
        }
        // else if (dependenciesCalc?.required) {
        //   setExtraAPIParams({
        //     ...dependenciesCalc,
        //     register: {
        //       ...form.register(register.name, {
        //         required: dependenciesCalc?.required && {
        //           message: `${dependenciesCalc?.label} is required`,
        //           ...dependenciesCalc?.required,
        //         },
        //       }),
        //     },
        //   });
        // }
        else {
          setExtraAPIParams();
        }
      },
      [dependencies, form, index]
    );

    useEffect(() => {
      const subscription = watch((value, { name, type }) => {
        if (type === 'change' || dependencies?.listenAllChanges) {
          if (dependenciesArray?.indexOf(name) > -1) {
            handleDependencyChange(value);
          }
        }
      });
      return () => subscription.unsubscribe();
    }, [watch]);

    useEffect(() => {
      if (dependencies?.keys) {
        handleDependencyChange(form.getValues());
      }
    }, []);

    if (dependencies?.keys) {
      const dependenciesArray = dependencies?.keys?.map(
        (key) => `${register.name.split('.')[0]}.${index}.${key}`
      );
      watch(dependenciesArray);
      const dependenciesCalc = dependencies?.calc(form.getValues(), null,form);
      if (dependenciesCalc?.hide) {
        return null;
      }
    }
    return (
      <Grid
      key={item}
      item
      xs={12}
      sx={{ display: 'flex' }}
      md={12 / (item?.colSpan ? columnsPerRow / item.colSpan : columnsPerRow)}
    >
      <Component
        {...props}
        {...extraAPIParams}
        extraAPIParams={extraAPIParams}
      />
     </Grid>
    );
  };

const ComponentMap = {
  text: ItemWrapper(TextInput),
  autoComplete: ItemWrapper(AutoComplete),
  date: ItemWrapper(DatePicker),
  radio: ItemWrapper(RadioGroup),
  textArea: ItemWrapper(TextAreaInput),
  wiredSelect: ItemWrapper(WiredSelect),
  select: ItemWrapper(Select),
  wiredAuto: ItemWrapper(WiredAutoComplete),
  uploadFile: ItemWrapper(UploadFile),

};

const validatePattern = (item) => {
  const { inputType, pattern, multiline } = item || {};
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

const NestedForm = (props) => {
  const {
    formGroups,
    register,
    dependencies,
    setValue,
    name,
    control,
    getValues,
    defaultValue,
    form,
    item: { columnsPerRow },
    label,
    isMore = true,
    headerLabel=false,
  } = props;

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <form style={{ width: '100%' }}>
      {headerLabel && <Grid sx={{flexDirection:'row',justifyContent:'space-between',display:'flex',alignItems:'center',paddingBottom:'24px'}}>
        <Typography sx={{ fontSize: '14px', fontWeight: 700 }} variant="body1">
          {label}
        </Typography>
        {isMore && <FabButton onClick={() => append(fields.length)} />}
      </Grid>}
      <Grid>
        <Grid>

          {fields.map((field, index) => (
            <Grid container spacing={3} key={field.id}>
              {formGroups?.map((groupData, i) => {
                let groupFields = [];
                if (groupData.fields && Array.isArray(groupData.fields)) {
                  groupFields = groupData.fields;
                } else {
                  groupFields = [groupData];
                }
                return (
                  < >
                      {groupFields.map((item) => {
                        if (
                          item?.inputType === 'checkBox' ||
                          item?.inputType === 'switch'
                        ) {
                          item.defaultChecked = get(
                            defaultValue,
                            `[${index}]${item?.name}`
                          );
                        } else if (item?.component) {
                          item.defaultValue = defaultValue;
                        } else {
                          item.defaultValue = get(
                            defaultValue,
                            `[${index}]${item?.name}`
                          );
                        }
                        if (item?.component) {
                          const Component = item?.component;
                          return (
                            <Component
                              key={item}
                              control={control}
                              register={register}
                              setValue={setValue}
                              item={item}
                              getValues={getValues}
                              index={index + 1}
                              name={name}
                              isNested
                            />
                          );
                        }

                        if (ComponentMap[item?.inputType]) {
                          const FormComponent = ComponentMap[item?.inputType];
                          const required =
                            item.required && isFunction(item.required)
                              ? item.required(index)
                              : item.required;
                          const disabled =
                            item.disabled && isFunction(item.disabled)
                              ? item.disabled(index)
                              : item.disabled;
                          const extraInputProps =
                            item.extraInputProps &&
                            isFunction(item.extraInputProps)
                              ? item.extraInputProps(index)
                              : item.InputProps;
                          return (
                            <FormComponent
                              key={i}
                              register={{
                                ...register(`${name}.${index}.${item?.name}`, {
                                  required: required && {
                                    message: `${
                                      item.label || item.textLabel
                                    } is required`,
                                    ...required,
                                  },
                                  pattern: validatePattern(item),
                                  maxLength: item?.maxLength && {
                                    message: `${
                                      item.label || item.textLabel
                                    } should not be greater than ${
                                      item.maxLength.value
                                    }`,
                                    ...item?.maxLength,
                                  },
                                  label: false,
                                  validate: getFormValidations(item)
                                }),
                              }}
                              setValue={setValue}
                              control={control}
                              dependencies={dependencies}
                              index={index}
                              InputProps={{
                                ...(item?.InputProps || {}),
                                ...(extraInputProps || {}),
                              }}
                              type={item?.type}
                              required={item?.required}
                              form={form}
                              {...item}
                              sx={{
                                ...(item.sx || {}),
                                '& legend': { display: 'none' },
                                '& fieldset': { top: 0 },
                              }}
                              label={false}
                              disabled={disabled}
                              isNested
                              identifier={name}
                              columnsPerRow={columnsPerRow}
                              item={item}
                              getValues={getValues}
                              {...groupData}
                            />
                          );
                        }
                        return null;
                      })}
                    </>
                );
              })}
              {fields.length !== 1 && (
                <Grid item style={{ width: '8%' }}>
                  <Delete
                    size="small"
                    onClick={() => remove(index)}
                    sx={{
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px',
                      color: palette.grey[600],
                    }}
                  />
                </Grid>
              )}
            </Grid>
          ))}
        </Grid>
        {!headerLabel && <Grid sx={{paddingTop:'12px'}}>

        {isMore && <FabButton icon={false} onClick={() => append(fields.length)} />}
      </Grid>}
      </Grid>
    </form>
  );
};

NestedForm.defaultProps = {
  formGroups: {},
  register: () => {},
  setValue: () => {},
  name: '',
  control: {},
};

NestedForm.propTypes = {
  formGroups: PropTypes.objectOf,
  register: PropTypes.func,
  setValue: PropTypes.func,
  name: PropTypes.string,
  control: PropTypes.objectOf,
};

export default NestedForm;
