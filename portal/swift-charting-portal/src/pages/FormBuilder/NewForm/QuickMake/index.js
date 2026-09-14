/* eslint-disable import/no-cycle */
import React, { useCallback, useMemo, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';

import Container from 'src/components/Container';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import { inputLength, requiredField } from 'src/lib/constants';
import { generateUniqueId } from 'src/lib/utils';
import { INPUT_TYPE_OPTIONS } from '../Builder/components/AddField';
import './quickmake.scss';

// Field types available in Quick Make
const QUICK_MAKE_FIELD_TYPES = INPUT_TYPE_OPTIONS.filter((o) =>
  ['text', 'radio', 'multiSelect', 'number', 'checkBox', 'textArea'].includes(o.value)
);

// Field types that support comma-separated options
const OPTION_TYPES_SET = new Set(['radio', 'multiSelect']);

const isFieldRequired = (field) =>
  Boolean(field?.mandatory || field?.required?.value || field?.required === true);

// Extract a plain string label from any option format
const extractOptionLabel = (o) => {
  if (!o) return '';
  if (typeof o === 'string') return o;
  if (typeof o === 'object') {
    const label = o.label;
    const value = o.value;
    if (typeof label === 'string') return label;
    if (label && typeof label === 'object') return String(label.label || label.value || '');
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') return String(value.label || value.value || '');
  }
  return String(o);
};

// Convert options array to comma-separated display string
const optionsToString = (options) => {
  if (!Array.isArray(options) || options.length === 0) return '';
  return options.map(extractOptionLabel).filter(Boolean).join(', ');
};

// Parse comma-separated string to [{label, value}] objects
const parseOptionsString = (str) => {
  if (!str || !str.trim()) return [];
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ label: s, value: s }));
};

// Flatten formGroups into flat table rows with safe scalar values
const flattenFields = (formGroups) => {
  const result = [];
  (formGroups || []).forEach((section, sectionIndex) => {
    const pushField = (field, rowIndex, itemIndex) => {
      const optionsStr = OPTION_TYPES_SET.has(field?.inputType)
        ? optionsToString(Array.isArray(field?.options) ? field.options : [])
        : '';

      result.push({
        id: field?.id || generateUniqueId(),
        textLabel: String(field?.textLabel || field?.label || ''),
        inputType: String(field?.inputType || 'text'),
        mandatory: isFieldRequired(field),
        optionsStr,
        _sectionIndex: sectionIndex,
        _rowIndex: rowIndex,
        _itemIndex: itemIndex,
        _original: field,
      });
    };

    if (Array.isArray(section)) {
      section.forEach((field, itemIndex) => pushField(field, null, itemIndex));
    } else {
      (section?.fields || []).forEach((row, rowIndex) => {
        row.forEach((field, itemIndex) => pushField(field, rowIndex, itemIndex));
      });
    }
  });
  return result;
};

// ── Inline editable Field Name cell ──────────────────────────────────────────
const InlineTextCell = ({ row, onSave, placeholder = 'Enter Field Name' }) => {
  const [value, setValue] = useState(row.textLabel);

  const handleBlur = useCallback(() => {
    if (value === row.textLabel) return;
    onSave(row, { textLabel: value.trim() });
  }, [value, row, onSave]);

  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
      variant="outlined"
      fullWidth
      sx={cellInputSx}
    />
  );
};

// ── Inline Field Type dropdown ────────────────────────────────────────────────
const InlineTypeCell = ({ row, onSave }) => {
  const handleChange = useCallback(
    (e) => {
      onSave(row, { inputType: e.target.value, options: [] });
    },
    [row, onSave]
  );

  return (
    <Select
      size="small"
      value={row.inputType}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      sx={{ ...cellInputSx, minWidth: 130, fontSize: 13 }}
    >
      {QUICK_MAKE_FIELD_TYPES.map((opt) => (
        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
};

// ── Inline Options/Details cell ───────────────────────────────────────────────
const InlineOptionsCell = ({ row, onSave }) => {
  const [value, setValue] = useState(row.optionsStr);

  const handleBlur = useCallback(() => {
    if (value === row.optionsStr) return;
    onSave(row, { optionsStr: value });
  }, [value, row, onSave]);

  if (!OPTION_TYPES_SET.has(row.inputType)) {
    return <span style={{ color: palette.grey[400], fontSize: 12 }}>—</span>;
  }

  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      placeholder="a, b, c, d"
      variant="outlined"
      fullWidth
      sx={cellInputSx}
    />
  );
};

const QuickMake = ({
  formGroups,
  handleFormGroups,
  handleEditFormGroups,
  handleDeleteFormGroup,
  formType,
}) => {
  // Dynamic column label and placeholder based on form type
  const isQuestionnaire = formType === 'FT_QUESTIONNAIRES';
  const fieldNameLabel = isQuestionnaire ? 'Questions' : 'Field Name';
  const fieldNamePlaceholder = isQuestionnaire ? 'Enter Question' : 'Enter Field Name';
  const flatFields = useMemo(() => flattenFields(formGroups), [formGroups]);

  // ── Save inline cell change back via existing handleEditFormGroups ────────
  const handleInlineSave = useCallback(
    (row, changes) => {
      const field = row._original;

      // Resolve updated values
      const nextTextLabel =
        changes.textLabel !== undefined ? changes.textLabel : row.textLabel;
      const nextInputType =
        changes.inputType !== undefined ? changes.inputType : row.inputType;
      const nextMandatory =
        changes.mandatory !== undefined ? changes.mandatory : row.mandatory;

      // Handle options
      let nextOptions = field?.options;
      if (changes.options !== undefined) {
        // Direct array (from required toggle clearing options)
        nextOptions = changes.options;
      } else if (changes.optionsStr !== undefined) {
        // Parse comma-separated string
        nextOptions = parseOptionsString(changes.optionsStr);
      } else if (changes.inputType !== undefined && !OPTION_TYPES_SET.has(changes.inputType)) {
        // Field type changed to non-option type — clear options
        nextOptions = [];
      }

      let maxLength = {};
      if (nextInputType === 'text') maxLength = inputLength.commonTextLength;
      if (nextInputType === 'textArea') maxLength = inputLength.textArea;

      handleEditFormGroups({
        data: {
          ...field,
          textLabel: nextTextLabel,
          label: nextTextLabel,
          inputType: nextInputType,
          mandatory: nextMandatory,
          required: nextMandatory ? requiredField : false,
          colSpan: Number(field?.colSpan || 12),
          maxLength,
          options: nextOptions,
        },
        sectionIndex: row._sectionIndex,
        rowIndex: row._rowIndex,
        itemIndex: row._itemIndex,
      });
    },
    [handleEditFormGroups]
  );

  // ── Add a default empty row on first render if no fields exist ─
  const hasAutoAdded = React.useRef(false);
  React.useEffect(() => {
    if (!hasAutoAdded.current && flatFields.length === 0) {
      hasAutoAdded.current = true;
      handleAddRow();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add new row ──────────────────────────────────────────────
  const handleAddRow = useCallback(() => {
    const uniqueID = generateUniqueId();
    const newField = {
      id: uniqueID,
      name: uniqueID,
      inputType: 'text',
      textLabel: '',
      label: '',
      placeholder: '',
      colSpan: 12,
      mandatory: false,
      required: false,
    };
    if (formGroups?.length) {
      handleFormGroups({
        data: newField,
        sectionIndex: formGroups.length - 1,
        formGroupType: 'row',
      });
    } else {
      handleFormGroups({ data: newField });
    }
  }, [formGroups, handleFormGroups]);

  // ── Delete row ───────────────────────────────────────────────
  const handleDeleteRow = useCallback(
    (row) => {
      handleDeleteFormGroup({
        sectionIndex: row._sectionIndex,
        rowIndex: row._rowIndex,
        itemIndex: row._itemIndex,
      });
    },
    [handleDeleteFormGroup]
  );

  // ── Table columns — all inline editable ──────────────────────
  const columns = useMemo(
    () => [
      {
        label: '#',
        dataKey: '_rowNum',
        render: ({ index }) => (
          <span style={{ color: palette.grey[600], fontSize: 12 }}>
            {index + 1}
          </span>
        ),
      },
      {
        label: fieldNameLabel,
        dataKey: 'textLabel',
        render: ({ data }) => (
          <InlineTextCell row={data} onSave={handleInlineSave} placeholder={fieldNamePlaceholder} />
        ),
      },
      {
        label: 'Field Type',
        dataKey: 'inputType',
        render: ({ data }) => (
          <InlineTypeCell row={data} onSave={handleInlineSave} />
        ),
      },
      {
        label: 'Required',
        dataKey: 'mandatory',
        render: ({ data }) => (
          <Checkbox
            checked={data.mandatory}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleInlineSave(data, { mandatory: e.target.checked })}
            size="small"
            sx={{
              color: palette.grey[400],
              '&.Mui-checked': { color: palette.primary.main },
              padding: '2px',
            }}
          />
        ),
      },
      {
        label: 'Options / Details',
        dataKey: 'optionsStr',
        render: ({ data }) => (
          <InlineOptionsCell row={data} onSave={handleInlineSave} />
        ),
      },
    ],
    [handleInlineSave, fieldNameLabel, fieldNamePlaceholder]
  );

  // ── Action buttons ────────────────────────────────────────────
  const actionButtons = useCallback(
    (row) => [
      {
        label: 'Delete',
        icon: 'delete',
        action: () => handleDeleteRow(row),
      },
    ],
    [handleDeleteRow]
  );

  return (
    <div className="quick-make-container">
      {/* ── Table ─────────────────────────────────────────── */}
      <div className="quick-make-table-col" style={{ flex: 1 }}>
        <div className="quick-make-table-panel">
          <Container style={{ padding: 0 }}>
            <Table
              columns={columns}
              data={flatFields}
              actionButtons={actionButtons}
              wrapperStyle={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}
              emptyMessage="Loading..."
            />
          </Container>

          <div className="quick-make-table-footer">
            <button type="button" className="qm-add-row-link" onClick={handleAddRow}>
              <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Add New Row
            </button>
          </div>
        </div>
      </div>

      {/* ── Field Properties Panel (hidden from UI, code preserved) ── */}
      {/*
      <aside className="quick-make-props-col">
        <div className="quick-make-props-panel">
          <div className="quick-make-props-header">
            <span className="quick-make-props-title">Field Properties</span>
            <Iconify icon="eva:menu-2-fill" sx={{ width: 20, height: 20, color: palette.grey[600] }} />
          </div>
          ...Field Name, Field Type, Required, Options, Placeholder, Help Text, Update Field...
        </div>
      </aside>
      */}
    </div>
  );
};

// Shared inline cell input style
const cellInputSx = {
  '& .MuiOutlinedInput-root': {
    fontSize: '13px',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    '& fieldset': { borderColor: palette.grey[300] },
    '&:hover fieldset': { borderColor: palette.primary.main },
    '&.Mui-focused fieldset': { borderColor: palette.primary.main },
  },
};

// ─── Kept for future use: Field Properties panel sx helpers ──────────────────
// const inputSx = cellInputSx;
// const switchSx = {
//   '& .MuiSwitch-switchBase.Mui-checked': {
//     color: palette.primary.main,
//     '& + .MuiSwitch-track': { backgroundColor: palette.primary.main },
//   },
// };

export default QuickMake;
