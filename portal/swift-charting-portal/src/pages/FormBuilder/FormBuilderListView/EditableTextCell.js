import { useState, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { showSnackbar, triggerEvents } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';

const EditableTextCell = ({ data, fieldKey, listId }) => {
  const [value, setValue] = useState(data?.[fieldKey] ?? '');

  const [, , saving, updateForm] = useCRUD({
    id: `form-inline-edit-${data?.id}-${fieldKey}`,
    url: `${API_URL.saveForm}/${data?.id}`,
    type: REQUEST_METHOD.update,
  });

  const handleBlur = useCallback(() => {
    const original = data?.[fieldKey] ?? '';
    if (value === original) return;
    updateForm({ [fieldKey]: value });
    showSnackbar({ message: successMessage.update, severity: 'success' });
    if (listId) triggerEvents(`REFRESH-TABLE-${listId}`);
  }, [value, data, fieldKey, updateForm, listId]);

  return (
    <TextField
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={saving}
      size="small"
      variant="outlined"
      fullWidth
      onClick={(e) => e.stopPropagation()}
      sx={{
        '& .MuiOutlinedInput-root': {
          fontSize: 13,
          borderRadius: '6px',
          backgroundColor: '#fff',
          '& fieldset': { borderColor: '#E8E8E8' },
          '&:hover fieldset': { borderColor: '#C4CDD5' },
          '&.Mui-focused fieldset': { borderColor: '#337AB7' },
        },
        '& .MuiInputBase-input': {
          padding: '6px 10px',
        },
      }}
    />
  );
};

export default EditableTextCell;
