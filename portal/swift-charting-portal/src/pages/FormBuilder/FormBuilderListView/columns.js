import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import EditableTextCell from './EditableTextCell';
import EditableCategoryCell from './EditableCategoryCell';
import EditableStatusCell from './EditableStatusCell';
import EditableLinkCell from './EditableLinkCell';
import NewRowLinkCell from './NewRowLinkCell';
import palette from 'src/theme/palette';

const LINKED_FORM_TYPES = new Set(['FT_QUESTIONNAIRES', 'FT_ENCOUNTER_TEMPLATES']);

const getLinkColumnLabel = (type) => {
  if (type === 'FT_QUESTIONNAIRES') return 'Linked Consent Form';
  if (type === 'FT_ENCOUNTER_TEMPLATES') return 'Linked Encounter Types';
  return 'Linked';
};

// Shared text field style — blue border signals the row is unsaved
const newInputSx = {
  '& .MuiOutlinedInput-root': {
    fontSize: 13,
    borderRadius: '6px',
    backgroundColor: '#fff',
    '& fieldset': { borderColor: '#337AB7' },
    '&:hover fieldset': { borderColor: '#337AB7' },
    '&.Mui-focused fieldset': { borderColor: '#337AB7' },
  },
  '& .MuiInputBase-input': { padding: '6px 10px' },
};

const STATUS_OPTIONS = [
  { value: true, label: 'Active', dotColor: palette.background.appleGreen },
  { value: false, label: 'Inactive', dotColor: palette.background.mediumPurple },
];

const StatusBadge = ({ option }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      backgroundColor: `${option.dotColor}22`,
      color: option.dotColor,
      borderRadius: '20px',
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}
  >
    <Box
      sx={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: option.dotColor,
        flexShrink: 0,
      }}
    />
    {option.label}
  </Box>
);

const getFormBuilderListColumns = (type, listId, onNewRowChange) => {
  const cols = [
    {
      label: '#',
      type: 'index',
      dataKey: 'index',
      maxWidth: '2rem',
    },
    {
      label: 'Category Name',
      dataKey: 'formCategory.name',
      sort: true,
      maxWidth: '9rem',
      render: ({ data }) =>
        data?._isNew ? (
          <TextField
            value={data.categoryName || ''}
            onChange={(e) => onNewRowChange('categoryName', e.target.value)}
            size="small"
            variant="outlined"
            fullWidth
            placeholder="Category name"
            onClick={(e) => e.stopPropagation()}
            sx={newInputSx}
          />
        ) : (
          <EditableCategoryCell data={data} fieldKey="name" listId={listId} />
        ),
    },
    {
      label: 'Category Description',
      dataKey: 'formCategory.description',
      maxWidth: '11rem',
      render: ({ data }) =>
        data?._isNew ? (
          <TextField
            value={data.categoryDescription || ''}
            onChange={(e) =>
              onNewRowChange('categoryDescription', e.target.value)
            }
            size="small"
            variant="outlined"
            fullWidth
            placeholder="Description"
            onClick={(e) => e.stopPropagation()}
            sx={newInputSx}
          />
        ) : (
          <EditableCategoryCell
            data={data}
            fieldKey="description"
            listId={listId}
          />
        ),
    },
    {
      label: 'Form Name',
      dataKey: 'name',
      sort: true,
      maxWidth: '9rem',
      render: ({ data }) =>
        data?._isNew ? (
          <TextField
            value={data.name || ''}
            onChange={(e) => onNewRowChange('name', e.target.value)}
            size="small"
            variant="outlined"
            fullWidth
            placeholder="Form name"
            onClick={(e) => e.stopPropagation()}
            sx={newInputSx}
          />
        ) : (
          <EditableTextCell data={data} fieldKey="name" listId={listId} />
        ),
    },
  ];

  if (LINKED_FORM_TYPES.has(type)) {
    cols.push({
      label: getLinkColumnLabel(type),
      dataKey: 'linkedConsentForms',
      maxWidth: '11rem',
      render: ({ data }) =>
        data?._isNew ? (
          <NewRowLinkCell
            formType={type}
            value={
              type === 'FT_QUESTIONNAIRES'
                ? data.linkedConsentForms
                : data.encounterTypeCode
            }
            onChange={onNewRowChange}
          />
        ) : (
          <EditableLinkCell data={data} formType={type} listId={listId} />
        ),
    });
  }

  cols.push({
    label: 'Status',
    dataKey: 'isActive',
    maxWidth: '8rem',
    render: ({ data }) =>
      data?._isNew ? (
        <MuiSelect
          value={data.isActive ?? true}
          onChange={(e) => onNewRowChange('isActive', e.target.value)}
          size="small"
          variant="outlined"
          onClick={(e) => e.stopPropagation()}
          renderValue={(v) => {
            const opt =
              STATUS_OPTIONS.find((o) => o.value === v) || STATUS_OPTIONS[0];
            return <StatusBadge option={opt} />;
          }}
          sx={{
            fontSize: 12,
            minWidth: 120,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#337AB7' },
            '& .MuiSelect-select': { padding: '4px 8px' },
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem
              key={String(opt.value)}
              value={opt.value}
              sx={{ fontSize: 13 }}
            >
              <StatusBadge option={opt} />
            </MenuItem>
          ))}
        </MuiSelect>
      ) : (
        <EditableStatusCell data={data} listId={listId} />
      ),
  });

  return cols;
};

export default getFormBuilderListColumns;
