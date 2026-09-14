import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import Table from 'src/components/Table';

const formColumns = [
  {
    label: 'Rank',
    type: 'text',
    dataKey: 'formData.name',
    render: ({ index }) => {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>{index + 1}</span>
        </div>
      );
    },
  },
  {
    label: 'Diagnosis Description',
    type: 'text',
    dataKey: 'description',
  },
  {
    label: 'ICD-10/snomedCT',
    type: 'text',
    dataKey: 'name',
  },
];

const DiagnosisTable = ({ form }) => {
  const [diagnosisData, setDiagnosisData] = useState([]);
  const { watch, getValues } = form;

  useEffect(() => {
    // Initial load of diagnosis data
    const initialDiagnosisIcds = getValues('encounterDiagnosis') ||[]
    const initialDiagnosisSnomedCT = getValues('encounterDiagnosisSnomeds') ||[]

    setDiagnosisData([...initialDiagnosisIcds,...initialDiagnosisSnomedCT]);

    const subscription = watch((value, { name }) => {
      if (['encounterDiagnosis','encounterDiagnosisSnomeds'].includes(name)) {
        const updatedDiagnosisIcds = getValues('encounterDiagnosis') ||[]
        const updatedDiagnosisSnomedCT = getValues('encounterDiagnosisSnomeds') ||[]
    
        setDiagnosisData([...updatedDiagnosisIcds,...updatedDiagnosisSnomedCT]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <Table
        data={diagnosisData}
        totalCount={diagnosisData.length}
        columns={formColumns}
        rowsPerPage={12}
        page={1}
        handlePageChange={() => {}}
        handleSort={() => {}}
        wrapperStyle={{ overflow: 'auto' }}
        timezone
        itemStyle={{ textTransform: 'capitalize' }}
      />
    </div>
  );
};

export default React.memo(DiagnosisTable);
