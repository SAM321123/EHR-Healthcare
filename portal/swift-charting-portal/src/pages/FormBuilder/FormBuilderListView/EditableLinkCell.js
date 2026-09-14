import { useState, useCallback } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import WiredSelect from 'src/wiredComponent/Select';
import { showSnackbar, triggerEvents } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';

// Mirrors the consent form parser from configurationForm.js
const consentFormsParser = (data) => {
  if (data) {
    return data?.results?.filter(
      (item) => item?.formType?.code === 'FT_CONSENT_FORMS'
    );
  }
  return [];
};

const EditableLinkCell = ({ data, formType, listId }) => {
  const isQuestionnaire = formType === 'FT_QUESTIONNAIRES';
  const isEncounter = formType === 'FT_ENCOUNTER_TEMPLATES';

  // Default value: array of IDs from existing linked data
  const getDefaultValue = () => {
    if (isQuestionnaire) {
      return data?.linkedConsentForms?.map((f) => f.id) || [];
    }
    if (isEncounter) {
      return data?.encounterTypes?.map((f) => f.id) || [];
    }
    return [];
  };

  const [value, setValue] = useState(getDefaultValue());

  const [, , saving, updateForm] = useCRUD({
    id: `form-inline-link-${data?.id}`,
    url: `${API_URL.saveForm}/${data?.id}`,
    type: REQUEST_METHOD.update,
  });

  const handleChange = useCallback(
    (newVal) => {
      const ids = Array.isArray(newVal) ? newVal : [newVal];
      setValue(ids);
      const payload = isQuestionnaire
        ? { linkedConsentForms: ids }
        : { encounterTypeCode: ids };
      updateForm(payload);
      showSnackbar({ message: successMessage.update, severity: 'success' });
      if (listId) triggerEvents(`REFRESH-TABLE-${listId}`);
    },
    [updateForm, isQuestionnaire, listId]
  );

  if (isQuestionnaire) {
    return (
      <WiredSelect
        url={API_URL.getFormList}
        params={{ limit: 300, isActive: true, formType: 'FT_CONSENT_FORMS' }}
        responseModifier={consentFormsParser}
        labelAccessor="name"
        valueAccessor="id"
        multiple
        cache={false}
        defaultValue={value}
        onChange={(val) => handleChange(val)}
        disabled={saving}
        onClick={(e) => e.stopPropagation()}
        sx={{ minWidth: 160, fontSize: 13 }}
        size="small"
      />
    );
  }

  if (isEncounter) {
    return (
      <WiredSelect
        url={`${API_URL.getMasters}/encounter_types_code`}
        params={{ limit: 100 }}
        labelAccessor="name"
        valueAccessor="id"
        multiple
        cache={false}
        defaultValue={value}
        onChange={(val) => handleChange(val)}
        disabled={saving}
        onClick={(e) => e.stopPropagation()}
        sx={{ minWidth: 160, fontSize: 13 }}
        size="small"
      />
    );
  }

  return <span style={{ color: '#999', fontSize: 13 }}>—</span>;
};

export default EditableLinkCell;
