import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import Tooltip from '@mui/material/Tooltip';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import useQuery from 'src/hooks/useQuery';
import { GET_MEDICINE_TEMPLATE } from 'src/store/types';
import palette from 'src/theme/palette';
import FilterComponents from 'src/components/FilterComponents';
import Table from '../../../components/Table';
import MedicineTemplateForm from './MedicineTemplateForm';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'medicine.name',
  },
  {
    type: 'text',
    label: 'Template',
    render: ({ data }) => {
      const title = data?.items?.map((item) => item?.label).join(', ');
      return <Tooltip title={title}>{title}</Tooltip>;
    },
  },
];

const MedicineTemplate = () => {
  const [isAddMedicineTemplate, setIsAddMedicineTemplate] = useState(false);
  const [defaultData, setDefaultData] = useState({});
  const form = useForm({ mode: 'onChange' });
  const { reset } = form;

  const [
    medicineTemplateList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
  ] = useQuery({
    listId: GET_MEDICINE_TEMPLATE,
    url: API_URL.patientPrescriptionTemplate,
    type: REQUEST_METHOD.get,
  });

  const editMedicineTemplate = useCallback((data) => {
    if (data) {
      setIsAddMedicineTemplate(true);
      setDefaultData(data);
    }
  }, []);

  const moreActions = [
    {
      label: 'Edit',
      icon: 'edit',
      action: editMedicineTemplate,
    },
  ];

  const handleForm = () => {
    reset();
    setIsAddMedicineTemplate(true);
  };

  const FilterCollectionHeader = FilterComponents({
    leftComponents: [
      {
        type: 'text',
        label: 'Medication Templates',
        style: {
          fontSize: '20px',
        },
      },
    ],
    rightComponents: [
      {
        type: 'fabButton',
        style: { ml: 2 },
        onClick: handleForm,
      },
    ],
  });

  return (
    <Container
      loading={loading}
      style={{
        backgroundColor: palette.background.paper,
        padding: 16,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
    >
      {!isAddMedicineTemplate ? (
        <Table
          headerComponent={
            <FilterCollectionHeader
              onFilterChange={handleFilters}
              filters={filters}
            />
          }
          data={medicineTemplateList?.results}
          totalCount={medicineTemplateList?.totalResults}
          columns={columns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          actionButtons={moreActions}
        />
      ) : (
        <MedicineTemplateForm
          form={form}
          refetchDataList={handleOnFetchDataList}
          defaultData={defaultData}
          setIsAddMedicineTemplate={setIsAddMedicineTemplate}
          setDefaultData={setDefaultData}
        />
      )}
    </Container>
  );
};

export default MedicineTemplate;
