import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import PageHeader from 'src/components/PageHeader';
import useQuery from 'src/hooks/useQuery';
import { showSnackbar } from 'src/lib/utils';
import { GET_MEDICINE_DATA } from 'src/store/types';
import palette from 'src/theme/palette';
import { successMessage } from 'src/lib/constants';
import Switch from 'src/wiredComponent/Switch';
import FilterComponents from 'src/components/FilterComponents';
import Table from '../../../components/Table';
import MedicineForm from './MedicineForm';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
  },
  // {
  //   type: 'text',
  //   label: 'Generic Name',
  //   dataKey: 'genericName',
  // },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    render: ({ data }) => <Switch rowData={data} api={API_URL.medicine} />,
  },
];

const Medicine = () => {
  const [isAddMedicine, setIsAddMedicine] = useState(false);
  const [defaultData, setDefaultData] = useState({});
  const [open, setOpen] = useState(false);
  const [deletedData, setDeleteData] = useState({});
  const form = useForm({ mode: 'onChange' });
  const { reset } = form;

  const [deleteMedicineData, , , callMedicineAPI, clearData] = useCRUD({
    id: `${GET_MEDICINE_DATA}-delete`,
    url: API_URL.medicine,
    type: REQUEST_METHOD.update,
  });

  const [
    medicineList,
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
    listId: GET_MEDICINE_DATA,
    url: API_URL.medicine,
    type: REQUEST_METHOD.get,
  });

  const editMedicine = useCallback((data) => {
    if (data) {
      setIsAddMedicine(true);
      setDefaultData(data);
    }
  }, []);

  const deleteTemplate = useCallback((data) => {
    setDeleteData(data);
    setOpen((value) => !value);
  }, []);

  const moreActions = [
    {
      label: 'Edit',
      icon: 'edit',
      action: editMedicine,
    },
    {
      label: 'Delete',
      icon: 'delete',
      action: deleteTemplate,
    },
  ];

  const handleDelete = useCallback(() => {
    const { id } = deletedData;
    callMedicineAPI({ isDeleted: true }, `/${id}`);
    setOpen((pre) => !pre);
  }, [callMedicineAPI, deletedData]);

  const dialogActions = useMemo(() => {
    const actionFields = [
      {
        title: 'Cancel',
        action: () => setOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: handleDelete,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ];
    return actionFields;
  }, [handleDelete]);

  const handleForm = () => {
    reset();
    setIsAddMedicine(true);
  };

  useEffect(() => {
    if (deleteMedicineData) {
      showSnackbar({
        message: successMessage.delete,
        severity: 'success',
      });
      clearData();
      handleOnFetchDataList();
    }
  }, [clearData, deleteMedicineData, handleOnFetchDataList]);

  const FilterCollectionHeader = FilterComponents({
    rightComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search by Name',
        },
        name: 'searchText',
      },
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
      {!isAddMedicine ? (
        <>
          <PageHeader
            title="Medications"
            rightContent={[
              {
                render: (
                  <FilterCollectionHeader
                    onFilterChange={handleFilters}
                    filters={filters}
                  />
                ),
              },
            ]}
          />
          <Table
            data={medicineList?.results}
            totalCount={medicineList?.totalResults}
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
          <AlertDialog
            open={open}
            content="Are you sure you want to delete?"
            actions={dialogActions}
          />
        </>
      ) : (
        <MedicineForm
          form={form}
          refetchDataList={handleOnFetchDataList}
          defaultData={defaultData}
          setIsAddMedicine={setIsAddMedicine}
          setDefaultData={setDefaultData}
        />
      )}
    </Container>
  );
};

export default Medicine;
