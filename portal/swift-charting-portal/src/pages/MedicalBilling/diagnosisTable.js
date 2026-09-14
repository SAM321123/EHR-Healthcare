import React from 'react';
import Table from 'src/components/Table';

const EncounterDiagnosisTable = ({ diagnosisData }) => {
  const columns = [
    {
      label: 'Code',
      type: 'text',
      dataKey: 'name',
      maxWidth: '10rem',
    },
    {
      label: 'Description',
      type: 'text',
      dataKey: 'description',
      maxWidth: '10rem',

    },
  ];
  return (
    <Table
      headerComponent={
        <div
          style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}
        >
          Diagnosis
        </div>
      }
      data={diagnosisData || []}
      columns={columns}
      wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
      isScroll={true}
    />
  );
};
export default EncounterDiagnosisTable;
