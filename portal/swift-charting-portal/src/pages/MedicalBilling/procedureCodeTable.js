import React from 'react';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';

const ProcedureCodeTable = ({ procedureCodeData }) => {
  const columns = [
    {
      label: 'Name',
      type: 'text',
      dataKey: 'name',
      maxWidth: '10rem',
    },
    {
      label: 'CPT Code',
      type: 'text',
      dataKey: 'cptCode',
      maxWidth: '10rem',
    },
    {
      label: 'Description',
      type: 'text',
      dataKey: 'description',
      maxWidth: '10rem',
    },
    {
      label: 'Qualifiers',
      type: 'text',
      dataKey: 'addOnFields',
      maxWidth: '10rem',
      render: ({ data }) => {
        const modifiers = `${data?.addOnFields?.modifier1}${data?.addOnFields?.modifier2}${data?.addOnFields?.modifier3}${data?.addOnFields?.modifier4}`;
        return (
          <TableTextRendrer
            style={{ maxWidth: '8rem', color: `${data?.status?.colorCode}` }}
          >
            {modifiers || 'N/A'}
          </TableTextRendrer>
        );
      },
    },
    {
      label: 'Quantity',
      type: 'text',
      dataKey: 'addOnFields',
      maxWidth: '10rem',
      render: ({ data }) => {
        const quantity = data?.addOnFields?.qty;
        return (
          <TableTextRendrer
            style={{ maxWidth: '8rem', color: `${data?.status?.colorCode}` }}
          >
            {quantity || 'N/A'}
          </TableTextRendrer>
        );
      },
    },
    {
      label: 'Total',
      type: 'text',
      dataKey: 'addOnFields',
      maxWidth: '10rem',
      render: ({ data }) => {
        const total = data?.addOnFields?.total;
        return (
          <TableTextRendrer
            style={{ maxWidth: '8rem', color: `${data?.status?.colorCode}` }}
          >
            {total || 'N/A'}
          </TableTextRendrer>
        );
      },
    },
  ];
  return (
    <Table
      headerComponent={
        <div
          style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}
        >
          Procedure Codes
        </div>
      }
      data={procedureCodeData || []}
      columns={columns}
      wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
      isScroll={true}
    />
  );
};
export default ProcedureCodeTable;
