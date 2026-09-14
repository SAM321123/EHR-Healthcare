/* eslint-disable no-param-reassign */
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

import Delete from '@mui/icons-material/Delete';
import { useFieldArray } from 'react-hook-form';
import Select from 'src/components/form/Select';
import {
  onlyNumber,
  regEmail,
  regPassword,
  regTextArea,
  regexName,
} from 'src/lib/constants';
import { getFormValidations } from 'src/lib/utils';
import palette from 'src/theme/palette';
import WiredAutoComplete from 'src/wiredComponent/Form/Autocomplete';
import WiredSelect from 'src/wiredComponent/Form/Select';
import Typography from '../../Typography';
import AutoComplete from '../AutoComplete';
import DatePicker from '../DatePicker';
import RadioGroup from '../RadioButton';
import TextAreaInput from '../TextArea';
import TextInput from '../TextInput';

import CheckboxLabel from '../Checkbox';
import './nestedFormTable.scss';

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
        } else {
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
      const dependenciesCalc = dependencies?.calc(form.getValues(), index, form);
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

const NestedFormTableV2 = (props) => {
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
  } = props;

  const { fields, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <form style={{ width: '100%' }}>
      <div className="nested-form-table">
        <table>
          <thead>
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
                    backgroundColor: palette.background.babyBlue,
                  }}
                  {...item.gridProps}
                >
                  <div className="nested-form-table-row-item-text">
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        fontSize: '12px',
                        lineHeight: '20px',
                      }}
                      color={palette.text.offGray}
                    >
                      {item?.label}
                    </Typography>
                  </div>
                </th>
              ))}
              <th className="nested-form-table-row-item nested-form-table-header-row-item" style={{
                    backgroundColor: palette.background.babyBlue,

              }}>
                <div className="nested-form-table-row-item-text">
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      fontSize: '12px',
                      lineHeight: '20px',
                      backgroundColor: palette.background.babyBlue
                    }}
                    color={palette.text.offGray}

                  >
                    Action
                  </Typography>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>{
           fields?.length ? fields.map((field, index) => (
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
                                {...(item?.inputType !== 'text' ? { ...item } : '')}
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
                <td style={{ width: '6%' }}>
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
                </td>
              </tr>
            )): <tr className="nested-form-table-row">
            <td colSpan={formGroups.length + 1} className="no-records" style={{padding:'40px'}}>
            <Typography style={{color:palette.text.offWhite}}>No Result Found!</Typography>
            </td>
          </tr>}</tbody>
        </table>
      </div>
    </form>
  );
};

NestedFormTableV2.propTypes = {
  name: PropTypes.string,
  control: PropTypes.any,
  defaultValue: PropTypes.object,
  getValues: PropTypes.func,
  dependencies: PropTypes.object,
  formGroups: PropTypes.array,
  register: PropTypes.any,
  setValue: PropTypes.func,
  item: PropTypes.object,
  form: PropTypes.object,
  label: PropTypes.string,
  isMore: PropTypes.bool,
};

export default NestedFormTableV2;
