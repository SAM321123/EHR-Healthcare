/* eslint-disable no-param-reassign */
import {
  useCallback, useEffect, useState,
} from 'react';
import ActionButton from "src/components/ActionButton";
import CheckboxLabel from 'src/components/Checkbox';
import Radio from 'src/components/RadioButton';
import Select from 'src/components/Select';
import TextInput from 'src/components/TextInput';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { regTextArea } from 'src/lib/constants';
import { isEmpty } from 'src/lib/lodash';
import { generateUniqueId } from 'src/lib/utils';
import DropDownModal from './DropDownModal';
import './matrix.scss';

const InputTypeOptions = [
  { label: 'Select', value: 'select' },
  { label: 'CheckBox', value: 'checkBox' },
  { label: 'TextArea', value: 'textArea' },
  { label: 'Radio', value: 'radio' },
  { label: 'Date', value: 'date' },
  { label: 'Text', value: 'text' },
];

const ComponentMap = {
  checkBox: CheckboxLabel,
  radio: Radio,
  label: TextInput,
};

const EditableMatrix = ({
  name, setValue, defaultValue,form:{watch=()=>{},setError,clearErrors},
  }) => {
  const [rows, setRows] = useState(defaultValue?.[0]?.rowData || []);
  const [columns, setColumns] = useState(defaultValue?.[0]?.columns || [
    {
      dataKey: 'rh',
    },
  ]);
  const [open, setOpen] = useState(false);
  const enableScore = watch('enableScore')
  const [errors,setErrors] = useState({});

useEffect(() => {
  if (!isEmpty(errors)) {
    setError('matrix', {
      type: 'manual',
      message: 'Invalid data',
    });
  } else {
    clearErrors('matrix');
  }
}, [errors]);

  useEffect(() => {
    setValue(name, [
      {
        enableScore,
        rowData: rows,
        columns,
      },
    ],{shouldDirty: true},);
  }, [columns, enableScore, name, rows, setValue]);

  const handleEnableScore = useCallback(()=>{
    const modifiedRow = [...rows];
    if(enableScore){
      columns?.forEach((column, index)=> {
        if(index !== 0) {
        column.type = 'radio';
        delete column.options;
        modifiedRow?.forEach((row) => {
        const rowKey = Object.keys(row)[0];
        if (row[rowKey][column?.dataKey]) {
          row[rowKey][column?.dataKey].type = 'radio';
          delete row[rowKey][column?.dataKey].options;
        }
      });
      }});
      setRows(modifiedRow)
    }
  }, [columns, enableScore, rows]);

  useEffect(()=>{
    if(enableScore){
      handleEnableScore()
    }
  },[enableScore])

  const handleAddRow = useCallback(() => {
    const newRow = {};
    const columnsData = {};
    const rowKey = generateUniqueId();

    columns?.forEach((column) => {
      columnsData[`${column?.dataKey}`] = {
        ...(column?.type ? { type: column?.type } : {}),
      };
    });

    newRow[`${rowKey}`] = {
      ...columnsData,
    };
    setRows([...rows, newRow]);
  }, [columns, rows]);

  const updateRowAfterAddColumn = useCallback((column) => {
    rows?.forEach((item, rowIndex) => {
      const key = Object.keys(item)[0];
      const value = Object.values(item)[0];
      rows[rowIndex][`${key}`] = {
        ...value,
        [`${column?.dataKey}`]: {
          type: column?.type,
        },
      };
    });
  }, [rows]);

  const handleAddColumn = useCallback(() => {
    const colId = generateUniqueId();
    let newColumn = {}
    if(enableScore){
      newColumn = {
        type: 'radio',
        dataKey: colId,
      }
    }else{
      newColumn={
        type: 'text',
        dataKey: colId,
      }
    };
    setColumns([...columns, newColumn]);
    updateRowAfterAddColumn(newColumn);
  }, [columns, enableScore, updateRowAfterAddColumn]);

  const handleDeleteRow = useCallback((rowIndex) => {
    const updatedRows = [...rows];
    updatedRows.splice(rowIndex, 1);

    setRows(updatedRows);
  }, [rows]);

  const handleDeleteColumn = useCallback((columnIndex, columnDataKey) => {
    const updatedColumns = [...columns];
    updatedColumns.splice(columnIndex, 1);

    setColumns(updatedColumns);
    if (!isEmpty(rows)) {
      const modifiedRows = [...rows];
      modifiedRows?.forEach((row) => {
        const rowKey = Object.keys(row)?.[0];
        delete row?.[rowKey]?.[columnDataKey];
      });
      setRows(modifiedRows);
    }
  }, [columns, rows]);

  const handleCellChange = useCallback((e, rowId, columnDataKey, rowIndex) => {
    if (e?.target?.value === '' || new RegExp(/^.*$/).test(e?.target?.value)) {
      delete errors[`${rowIndex}${rowId}${columnDataKey}`];
    } else {
      setErrors({ ...errors , [`${rowIndex}${rowId}${columnDataKey}`]: 'Invalid character' });
    }
    const updatedRows = [...rows];
    updatedRows[rowIndex][rowId][columnDataKey].label = e?.target?.value;
    setRows(updatedRows);
  }, [errors, rows]);

  const handleOnColumnChange = useCallback((e, columnDataKey) => {
    if (e.target.value === '' || new RegExp(regTextArea.value).test(e.target.value)) {
      delete errors[columnDataKey];
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [columnDataKey]: 'Invalid character',
      }));
    }
    const updatedColumns = [...columns];
    updatedColumns.forEach((column) => {
      if (column?.dataKey === columnDataKey) {
        column.label = e.target.value;
      }
    });
    setColumns(updatedColumns);
  }, [columns, errors]);

  const handleInputType = useCallback((data) => {
    const selectedOption = data.target;
    columns?.forEach((column) => {
      if (selectedOption?.name === column?.dataKey) {
        column.type = selectedOption.value;
        delete column.options;
      }
    });
    const modifiedRow = [...rows];
    modifiedRow?.forEach((row) => {
      const rowKey = Object.keys(row)[0];
      if (row[rowKey][selectedOption?.name]) {
        row[rowKey][selectedOption?.name].type = selectedOption.value;
        delete row[rowKey][selectedOption?.name].options;
      }
    });
    setRows(modifiedRow);
  }, [columns, rows]);

  const handleDropDown = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const handleOnSelectOption = useCallback(({ options, columnId }) => {
    columns?.forEach((column) => {
      if (column?.dataKey === columnId) {
        column.options = options;
      }
    });
    const modifiedRow = [...rows];
    modifiedRow?.forEach((row) => {
      const rowKey = Object.keys(row)[0];
      if (row[rowKey][columnId]) {
        row[rowKey][columnId].options = options;
      }
    });
    setRows(modifiedRow);
  }, [rows, columns]);

  const handleScore = useCallback((e, columnDataKey) => {
    const updatedColumns = [...columns];
    updatedColumns.forEach((column) => {
      if (column?.dataKey === columnDataKey) {
        column.score = e.target.value;
      }
    });
    setColumns(updatedColumns);
  }, [columns]);

  const getComponent = (cell, row, key, rowIndex) => {
    if (ComponentMap[cell?.type]) {
      const FormItemComponent = ComponentMap[cell?.type];
      return (
        <>
          <FormItemComponent
            disabled
            name={key}
            options={[{label: '', value: key}]}
            value={row?.[cell?.dataKey]?.label}
          />
          <TextInput
            name={key}
            value={row?.[cell?.dataKey]?.label}
            onChange={(e) => handleCellChange(e, key, cell?.dataKey, rowIndex)}
            placeholder="Label"
          />
        </>
      );
    }
    return (
      ''
    );
  };

  return (
    <div className='table-container'>
      <table>
        <thead>
          <tr>
            {columns?.map((column, columnIndex) => (
              <th key={column?.dataKey}>
                 <div className='table-matrix-row'>
                      <TextInput
                        value={column?.label ?? ''}
                        onChange={(e) => handleOnColumnChange(e, column?.dataKey)}
                        placeholder={columnIndex === 0 ? 'Row Column Header' : `Column ${columnIndex}`}
                        style={columnIndex === 0 ? { minWidth: '150px' } : {}}
                        inputProps = {{maxLength:100}}
                        helperText={errors[column?.dataKey] || ""} 
                        error={errors[column?.dataKey]}
                        />
                        {columnIndex !== 0 && <div role="presentation" className='row-cross-icon' onClick={() => handleDeleteColumn(columnIndex, column?.dataKey)}>
                          <Iconify
                              icon="eva:close-outline"
                              cursor="pointer"
                              sx={{ width: 20, height: 20 }}
                              />
                        </div>}
                    </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>

          <tr>
            {columns?.map((column, columnIndex) => (columnIndex === 0 ? (
              <th key={column?.dataKey} style={{ textAlign: 'left' }}>
              {' '}
              </th>
              
            ) : (
              <th key={column?.dataKey}>
                {enableScore ? <div>
                  <TextInput
                    type='number'
                    value={column?.score ?? ''}
                    onChange={(e) => handleScore(e, column?.dataKey)} 
                    style={{ minWidth: '50px' }}
                    InputProps ={{startAdornment:(
                      <Label style={{padding: '20px', marginRight: '10px', marginLeft: '-14px'}}>
                        Score
                      </Label>
                    )}}
                  />
                </div> :<div className={column?.type === 'select' ? 'select-cell' : 'cell'}>
                  <Select
                    name={column?.dataKey}
                    onChange={handleInputType}
                    data={InputTypeOptions}
                    defaultValue={column?.type}
                    valueAccessor="value"
                    labelAccessor="label"
                    fullWidth
                  />
                  {column?.type === 'select' && (
                    <div role="presentation" onClick={handleDropDown}>
                      <DropDownModal
                        columnId={column?.dataKey}
                        onSubmitOption={handleOnSelectOption}
                        defaultOptions={column?.options}
                      />
                    </div>
                  )}
                </div>
                }
              </th>
            )))}
          </tr>

          {rows?.map((item, rowIndex) => {
            const key = Object.keys(item)[0];
            const row = Object.values(item)[0];
            return (
              <tr key={key}>
                {columns?.map((cell, columnIndex) => (columnIndex === 0 ? (
                  <td key={cell?.dataKey}>
                    <div className='table-matrix-row'>
                      <TextInput
                        value={row?.[cell?.dataKey]?.label}
                        onChange={(e) => handleCellChange(e, key, cell?.dataKey, rowIndex)}
                        placeholder={`Row ${rowIndex + 1}`}
                        inputProps = {{maxLength:100}}
                        helperText={errors[`${rowIndex}${key}${cell?.dataKey}`] || ""} 
                        error={errors[`${rowIndex}${key}${cell?.dataKey}`]}
                        />
                        <div role="presentation" className='row-cross-icon' onClick={() => handleDeleteRow(rowIndex)}>
                        <Iconify
                            icon="eva:close-outline"
                            cursor="pointer"
                            sx={{ width: 20, height: 20 }}
                            />
                      </div>
                    </div>
                  </td>
                ) : (
                  <td key={cell?.dataKey}>
                    {getComponent(cell, row, key, rowIndex)}
                  </td>
                )))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="button-container">
        <ActionButton className="add" onClick={handleAddRow}>Add Row</ActionButton>
        <ActionButton className="add" onClick={() => handleAddColumn('add')}>Add Column</ActionButton>
      </div>
    </div>
  );
};

export default EditableMatrix;
