import { useState, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { showSnackbar, triggerEvents } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';

// Editable cell for fields that live on the formCategory (global-type) record
const EditableCategoryCell = ({ data, fieldKey, listId }) => {
  const categoryId = data?.formCategory?.id;
  const [value, setValue] = useState(data?.formCategory?.[fieldKey] ?? '');

  const [, , saving, updateCategory] = useCRUD({
    id: `category-inline-edit-${categoryId}-${fieldKey}`,
    url: `${API_URL.updateMasters}`,
    type: REQUEST_METHOD.update,
  });

  const handleBlur = useCallback(() => {
    const original = data?.formCategory?.[fieldKey] ?? '';
    if (value === original || !categoryId) return;
    updateCategory({ [fieldKey]: value }, `/${categoryId}`);
    showSnackbar({ message: successMessage.update, severity: 'success' });
    if (listId) triggerEvents(`REFRESH-TABLE-${listId}`);
  }, [value, data, fieldKey, updateCategory, listId, categoryId]);

  return (
    <TextField
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={saving || !categoryId}
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

export default EditableCategoryCell;
