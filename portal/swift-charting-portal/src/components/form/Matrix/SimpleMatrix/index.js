/* eslint-disable no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import PropTypes from 'prop-types';
import {
  FormLabel,
  Grid,
  useTheme,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';

import { get, isEmpty } from 'src/lib/lodash';

import AutoComplete from 'src/components/form/AutoComplete';
import CheckboxLabel from 'src/components/form/Checkbox';
import TextAreaInput from 'src/components/form/TextArea';
// import RadioButton from 'src/components/form/RadioButton';
import DatePicker from 'src/components/form/DatePicker';
import TextInput from 'src/components/form/TextInput';
// import Switch from "../../../Switch";
import NestedForm from 'src/components/form/NestedForm';
// import WiredSelect from 'src/wiredComponents/WiredSelect';
// import WiredAutoComplete from 'src/wiredComponents/WiredAutoComplete';
// import Slider from 'src/components/Slider';
import DropDown from 'src/components/form/Select';
import TagsInput from 'src/components/form/TagsInput';

import './simpleMatrix.scss';
import Radio from 'src/components/form/RadioButton';
import { noHtmlTagPattern, regEmail, regexAlphanumeric, regTextArea ,onlyAlphabet} from 'src/lib/constants';
import palette from 'src/theme/palette';

const EditComponentMap = {
  autoComplete: AutoComplete,
  checkBox: CheckboxLabel,
  textArea: TextAreaInput,
  radio: Radio,
  date: DatePicker,
  text: TextInput,
  // switch: Switch,
  nestedList: NestedForm,
  // wiredSelect: WiredSelect,
  // wiredAutoComplete: WiredAutoComplete,
  // slider: Slider,
  select: DropDown,
  tags: TagsInput,
};

const SimpleMatrix = ({
  headerStyle,
  itemStyle,
  containerStyle,
  headerComponent: TableHeader,
  register,
  setValue,
  getValues,
  matrix,
  form,
  label,
  ...props
}) => {
  const regexMap = {
    onlyAlphabet,
    alphanumeric: regexAlphanumeric,
    commonText: noHtmlTagPattern,
    email: regEmail,
  };
  
  // eslint-disable-next-line consistent-return
  const validatePattern = (item) => {
    const { type:inputType, pattern, multiline, validation } = item || {};
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
  };
  const rows= matrix?.[0]?.rowData || [];
  const columns = matrix?.[0]?.columns || [
    {
      dataKey: 'rh',
    },
  ];
  const theme = useTheme();
  const tableColor = get(theme, 'palette.table', {});

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div style={{
      display:'flex',
      flexDirection:'column',
      width: `${
      100 /
      (props?.colSpan
        ? props?.columnsPerRow / props.colSpan
        : props?.columnsPerRow)
    }%`}}>
    <FormLabel sx={{ mr: 2,fontSize:'12px',lineHeight:'19.6px',color:palette.text.primary }}>{label}</FormLabel>
    <Grid
      className="preview_table_paper"
    >
      {TableHeader}
      <TableContainer className="preview_table_container">
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow
             className='nested-form-row nested-form-header-row'
            >
              {columns?.map((column, index) => (
                <TableCell
                  key={column?.id}
                  style={{ width: column?.width }}
                  data-testId={`${column?.dataKey}-column`}
                  className={column.fixed ? 'preview_pinnedColumn' : 'preview_header'}
                  sx={{
                    backgroundColor: '#EAF0F7',
                    borderBlock: 'none',
                    ...headerStyle,
                  }}
                >
                  <div className={index === 0 ? "preview_header_cell preview_header_left" : "preview_header_cell"}>
                    {column?.label}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isEmpty(rows) ? (
              <TableCell
                align="center"
                colSpan={columns?.length}
                className="preview_table_loader"
              >
                <div>No Result Found!</div>
              </TableCell>
            ) : (
              rows?.map((item) => {
                const key = Object.keys(item)[0];
                const row = Object.values(item)[0];
                return (
                  <TableRow
                    hover
                    key={key}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'white !important',
                      },
                    }}
                  >
                    {columns?.map((column, columnIndex) => {
                      if (column?.dataKey === 'rh' && row[column?.dataKey]?.label) {
                        return (
                          <TableCell
                            key={column?.dataKey}
                            style={{
                              borderBlock: 'none',
                              cursor: 'pointer',
                              ...itemStyle,
                            }}
                          >
                            {row[column?.dataKey]?.label}
                          </TableCell>
                        );
                      }
                      if (EditComponentMap[row?.[column?.dataKey]?.type]) {
                        const FormItemComponent = EditComponentMap[row[column?.dataKey]?.type];
                        return (
                          <TableCell
                            style={{
                              flexBasis: '100%',
                            }}
                            key={column?.dataKey}
                          >
                            <FormItemComponent
                              sx={{
                                ...(column?.inputStyle),
                              }}
                              name={(column?.type === 'radio') || (column?.type === 'checkbox') ? key : `${key}-${column?.dataKey}`}
                              form={form}
                              error={get(errors, `${column?.name}.message`, '')}
                              register={{
                                ...register(column?.type === 'radio' ? key : `${key}-${column?.dataKey}`, {
                                  required: column?.required,
                                  pattern: validatePattern(column),
                                  maxLength: column?.maxLength,
                                }),
                              }}
                              setValue={setValue}
                              control={control}
                              getValues={getValues}
                              options={column?.type === 'radio' 
                              ? [{label: row?.[column?.dataKey]?.label || '',
                               value: column?.dataKey}] : []}
                              {...row?.[column?.dataKey]}
                            />
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          style={{
                            borderBlock: 'none',
                            cursor: 'pointer',
                            ...itemStyle,
                          }}
                          key={columnIndex}
                        />
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
    </div>
  );
};

SimpleMatrix.defaultProps = {
  columns: [],
  data: [],
  headerStyle: {},
  containerStyle: {},
  itemStyle: {},
  headerComponent: () => { },
  moreActions: [],
};

SimpleMatrix.propTypes = {
  columns: PropTypes.instanceOf(Object),
  data: PropTypes.instanceOf(Object),
  headerStyle: PropTypes.instanceOf(Object),
  containerStyle: PropTypes.instanceOf(Object),
  itemStyle: PropTypes.instanceOf(Object),
  headerComponent: PropTypes.element,
  moreActions: PropTypes.instanceOf(Object),
};

export default SimpleMatrix;
