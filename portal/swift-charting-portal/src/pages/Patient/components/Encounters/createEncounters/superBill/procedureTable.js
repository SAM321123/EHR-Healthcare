import React, { useMemo, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Table from 'src/components/Table';
import TextInput from 'src/components/TextInput';

const QtyInput = React.memo(({ index, form }) => {
  const value = useWatch({
    control: form.control,
    name: `selectedProcedureCodes[${index}].qty`,
    defaultValue: '',
  });

  const onChange = useCallback(
    (e, _value) => {
      form.setValue(`selectedProcedureCodes[${index}].qty`, _value, { shouldValidate: true });
    },
    [form, index]
  );

  return <TextInput value={value || ''} onChange={onChange} placeholder="Enter" />;
});

const ProcedureTable = ({ form }) => {
  const data = useWatch({
    control: form.control,
    name: 'selectedProcedureCodes',
    defaultValue: [],
  });

  const onDelete = useCallback(
    (row) => {
      const filteredData = form.getValues('selectedProcedureCodes').filter(item => item.id !== row.id);
      form.setValue('selectedProcedureCodes', filteredData, { shouldValidate: true });
    },
    [form]
  );

  const formColumns = useMemo(() => [
    {
      label: 'Index',
      type: 'text',
      dataKey: 'formData.name',
      render: ({ index }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>{index + 1}</span>
        </div>
      ),
    },
    {
      label: 'ICD-10/snomedCT',
      type: 'text',
      dataKey: 'name',
    },
    {
      label: 'Diagnosis Description',
      type: 'text',
      dataKey: 'description',
    },
    {
      label: 'Qty',
      type: 'text',
      render: ({ data, index }) => <QtyInput index={index} form={form} />,
    },
  ], [form]);

  const moreActions = [
    {
      label: 'Delete',
      icon: 'delete',
      action: onDelete,
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <Table
        data={data}
        totalCount={data.length}
        columns={formColumns}
        rowsPerPage={12}
        page={1}
        handlePageChange={() => { }}
        handleSort={() => { }}
        wrapperStyle={{ overflow: 'auto' }}
        timezone
        itemStyle={{ textTransform: 'capitalize' }}
        actionButtons={moreActions}
      />
    </div>
  );
};

export default ProcedureTable;
