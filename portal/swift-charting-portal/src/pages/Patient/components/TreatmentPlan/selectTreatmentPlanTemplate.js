import { CardContent } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { API_URL } from 'src/api/constants';
import WiredAutoComplete from 'src/wiredComponent/AutoComplete';
import TreatmentPlanForm from './treatmentPlanForm';
import { useTreatmentPlan } from './treatmentPlanContext';

const SelectTreatmentPlanTemplate = ({
  modalCloseAction,
  refetchData,
  defaultData,
}) => {
  const { activeStep } = useTreatmentPlan();
  const [selectedtemplate, setSelectedTemplate] = useState(null);
  const handleChangeTemplate = useCallback((data) => {
    if (data && typeof data === 'object') {
      const templateData = {
        ...data,
        templateName: null,
        templateDescription: null,
        id: null,
        templateId: data.id
      };
      setSelectedTemplate(templateData);
    }
  }, []);

  return (
    <CardContent
      sx={{ paddingTop: '0px', marginTop: '38px', paddingBottom: '0px' }}
    >
      {activeStep === 0 && !defaultData && (
        <WiredAutoComplete
          name="templateName"
          label="Select template"
          url={API_URL.treatmentPlanTemplate}
          params={{ isActive: true, limit: 300 }}
          size="small"
          onChange={handleChangeTemplate}
          labelAccessor="templateName"
          valueAccessor="id"
          showDescription={true}
          descriptionAccessor="templateDescription"
          cache={false}
          placeholder="Search by template name"
          freeSolo
        />
      )}

      <TreatmentPlanForm
        modalCloseAction={modalCloseAction}
        refetchData={refetchData}
        defaultData={selectedtemplate ? selectedtemplate : defaultData}
      />
    </CardContent>
  );
};

export default SelectTreatmentPlanTemplate;
