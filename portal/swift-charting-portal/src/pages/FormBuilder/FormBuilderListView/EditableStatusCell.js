import { useState, useCallback } from 'react';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import Box from '@mui/material/Box';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { showSnackbar, triggerEvents } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';
import palette from 'src/theme/palette';

const STATUS_OPTIONS = [
  {
    value: true,
    label: 'Active',
    color: palette.background.appleGreen,
    textColor: '#fff',
    dotColor: palette.background.appleGreen,
  },
  {
    value: false,
    label: 'Inactive',
    color: palette.background.mediumPurple,
    textColor: '#fff',
    dotColor: palette.background.mediumPurple,
  },
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

const EditableStatusCell = ({ data, listId }) => {
  const [value, setValue] = useState(data?.isActive === true);

  const [, , saving, updateForm] = useCRUD({
    id: `form-inline-status-${data?.id}`,
    url: `${API_URL.saveForm}/${data?.id}`,
    type: REQUEST_METHOD.update,
  });

  const handleChange = useCallback(
    (e) => {
      const newVal = e.target.value;
      setValue(newVal);
      updateForm({ isActive: newVal });
      showSnackbar({ message: successMessage.update, severity: 'success' });
      if (listId) triggerEvents(`REFRESH-TABLE-${listId}`);
    },
    [updateForm, listId]
  );

  const selectedOption =
    STATUS_OPTIONS.find((o) => o.value === value) || STATUS_OPTIONS[1];

  return (
    <MuiSelect
      value={value}
      onChange={handleChange}
      disabled={saving}
      size="small"
      variant="outlined"
      onClick={(e) => e.stopPropagation()}
      renderValue={() => <StatusBadge option={selectedOption} />}
      sx={{
        fontSize: 12,
        minWidth: 120,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8E8E8' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C4CDD5' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#337AB7',
        },
        '& .MuiSelect-select': { padding: '4px 8px' },
      }}
    >
      {STATUS_OPTIONS.map((opt) => (
        <MenuItem key={String(opt.value)} value={opt.value} sx={{ fontSize: 13 }}>
          <StatusBadge option={opt} />
        </MenuItem>
      ))}
    </MuiSelect>
  );
};

export default EditableStatusCell;
