/* eslint-disable no-param-reassign */
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useFieldArray } from 'react-hook-form';
import Select from 'src/components/form/Select';
import WiredSelect from 'src/wiredComponent/Form/Select';
import Delete from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
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
import TextInput from '../TextInput';
import RadioGroup from '../RadioButton';
import AutoComplete from '../AutoComplete';
import DatePicker from '../DatePicker';
import TextAreaInput from '../TextArea';
import Typography from '../../Typography';

import './nestedFormTable.scss';
import CheckboxLabel from '../Checkbox';

const ItemWrapper = (Component) =>
  function WithFormItem(props) {
    const { form, dependencies, index, register } = props;
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
      watch(dependenciesArray);
      const dependenciesCalc = dependencies?.calc(form.getValues(),index, form);
      console.log("🚀 ~ WithFormItem ~ dependenciesCalc:", dependenciesCalc)
      if (dependenciesCalc?.hide) {
        return null;
      }
    }
    return (
      <Component
        {...props}
        {...extraAPIParams}
        extraAPIParams={extraAPIParams}
      />
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
  checkBox: ItemWrapper(CheckboxLabel),

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

const NestedFormTable = (props) => {
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
    renderDelete=()=>true,
  } = props;

  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <form style={{ width: '100%' }}>
      <div className="main-header" style={{marginBottom:20}}>
        <Typography sx={{ fontSize: '14px', fontWeight: 700 }} variant="body1">
          {label}
        </Typography>
        {isMore && <FabButton onClick={() => append(fields.length)} />}
      </div>
      <div className="nested-form-table">
        <table>
          <tr className="nested-form-table-row nested-form-table-header-row">
            {formGroups?.map((item) => (
              <th
                key={item}
                className="nested-form-table-row-item nested-form-table-header-row-item"
                style={{
                  width: `${
                    92 /
                    (item?.colSpan
                      ? columnsPerRow / item.colSpan
                      : columnsPerRow)
                  }%`,
                }}
              >
                <Typography>{item.label || item.textLabel}</Typography>
              </th>
            ))}
              <th
                style={{ width: '8%' }}
                className="nested-form-table-row-item nested-form-table-header-row-item"
              >
                <Typography />
              </th>
          </tr>

          {fields.map((field, index) => (
            <tr className="nested-form-table-row" spacing={1} key={field.id}>
              {formGroups?.map((groupData, i) => {
                let groupFields = [];
                if (groupData.fields && Array.isArray(groupData.fields)) {
                  groupFields = groupData.fields;
                } else {
                  groupFields = [groupData];
                }
                return (
                  <td
                    key={groupData}
                    className="nested-form-table-row-item"
                    style={{
                      width: `${
                        92 /
                        (groupData?.colSpan
                          ? columnsPerRow / groupData.colSpan
                          : columnsPerRow)
                      }%`,
                    }}
                    {...groupData.gridProps}
                  >
                    <div
                      className="td-data-container"
                      style={{
                        flexDirection:
                          groupData?.layout === 'col' ? 'column' : 'row',
                      }}
                    >
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
                              index={index}
                              name={name}
                              isNested
                              form={form}
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
                              required={item?.required}
                              {...(item?.inputType !== 'text'
                                ? { ...item }
                                : '')}
                              form={form}
                              {...item}
                              sx={{
                                ...(item.sx || {}),
                                '& legend': { display: 'none' },
                                '& fieldset': { top: 0 },
                              }}
                              label={false}
                              textLabel=""
                              disabled={disabled}
                              isNested
                              identifier={name}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </td>
                );
              })}
           
                <td style={{ width: '8%' }}>
                 <div style={{display:'flex',gap:8,justifyContent:'center'}}>
                 {fields.length !== 1&&renderDelete(index) && <Delete
                    size="small"
                    onClick={() => remove(index)}
                    sx={{
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px',
                      color: palette.grey[600],
                    }}
                  />
                }
                   <AddCircleOutlineIcon
                    size="small"
                    onClick={() => append(fields.length)}
                    sx={{
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px',
                      color: palette.grey[600],
                    }}
                  />
                  </div>
                </td>

            </tr>
          ))}
        </table>
      </div>
    </form>
  );
};

NestedFormTable.defaultProps = {
  formGroups: {},
  register: () => {},
  setValue: () => {},
  name: '',
  control: {},
};

NestedFormTable.propTypes = {
  formGroups: PropTypes.objectOf,
  register: PropTypes.func,
  setValue: PropTypes.func,
  name: PropTypes.string,
  control: PropTypes.objectOf,
};

export default NestedFormTable;
