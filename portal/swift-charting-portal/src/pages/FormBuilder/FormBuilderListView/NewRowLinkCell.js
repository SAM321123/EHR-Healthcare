import WiredSelect from 'src/wiredComponent/Select';
import { API_URL } from 'src/api/constants';

const consentFormsParser = (data) => {
  if (!data) return [];
  return (data?.results || []).filter(
    (item) => item?.formType?.code === 'FT_CONSENT_FORMS'
  );
};

const NewRowLinkCell = ({ formType, value, onChange }) => {
  const isQuestionnaire = formType === 'FT_QUESTIONNAIRES';
  const isEncounter = formType === 'FT_ENCOUNTER_TEMPLATES';

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
        defaultValue={value || []}
        onChange={(val) =>
          onChange('linkedConsentForms', Array.isArray(val) ? val : [val])
        }
        onClick={(e) => e.stopPropagation()}
        placeholder="Select"
        size="small"
        sx={{ minWidth: 160, fontSize: 13 }}
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
        defaultValue={value || []}
        onChange={(val) =>
          onChange('encounterTypeCode', Array.isArray(val) ? val : [val])
        }
        onClick={(e) => e.stopPropagation()}
        placeholder="Select"
        size="small"
        sx={{ minWidth: 160, fontSize: 13 }}
      />
    );
  }

  return <span style={{ color: '#999', fontSize: 13 }}>—</span>;
};

export default NewRowLinkCell;
