import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import isEmpty from 'lodash/isEmpty';

import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import PageHeader from 'src/components/PageHeader';
import useQuery from 'src/hooks/useQuery';
import { showSnackbar } from 'src/lib/utils';
import { GET_EDUCATION_CONTENT } from 'src/store/types';
import palette from 'src/theme/palette';
import Switch from 'src/wiredComponent/Switch';
import { successMessage } from 'src/lib/constants';
import FilterComponents from 'src/components/FilterComponents';
import Table from '../../../components/Table';
import ModalComponent from '../../../components/modal';
import EducationForm from './EducationForm';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
  },
  {
    label: 'Description',
    type: 'text',
    dataKey: 'description',
    render: ({ data }) => (data?.description ? data.description : 'N/A'),
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    render: ({ data }) => (
      <Switch rowData={data} api={API_URL.educationContent} />
    ),
  },
];

const Education = () => {
  const [openModal, setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState({});
  const [open, setOpen] = useState(false);
  const [deletedData, setDeleteData] = useState({});
  const form = useForm({ mode: 'onChange' });

  const [deleteEducationData, , , callEducationAPI, clearData] = useCRUD({
    id: `${GET_EDUCATION_CONTENT}-delete`,
    url: API_URL.educationContent,
    type: REQUEST_METHOD.update,
  });

  const { reset } = form;

  const [
    educationContent,
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
    listId: GET_EDUCATION_CONTENT,
    url: API_URL.educationContent,
    type: REQUEST_METHOD.get,
  });

  const editService = useCallback((data) => {
    if (data) {
      setDefaultData(data);
      setOpenModal(true);
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
      action: editService,
    },
    {
      label: 'Delete',
      icon: 'delete',
      action: deleteTemplate,
    },
  ];

  const handleModal = useCallback(() => {
    setOpenModal((prev) => !prev);
    reset();
    setDefaultData({});
  }, [reset]);

  const handleDelete = useCallback(() => {
    const { id } = deletedData;
    callEducationAPI({ isDeleted: true }, `/${id}`);
    setOpen((pre) => !pre);
  }, [callEducationAPI, deletedData]);

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

  useEffect(() => {
    if (deleteEducationData) {
      showSnackbar({
        message: successMessage.delete,
        severity: 'success',
      });
      clearData();
      handleOnFetchDataList();
    }
  }, [clearData, deleteEducationData, handleOnFetchDataList]);

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
        onClick: () => handleModal(),
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
      <>
        <PageHeader
          title="Education Content"
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
          data={educationContent?.results}
          totalCount={educationContent?.totalResults}
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
        {openModal && (
          <ModalComponent
            open={openModal}
            header={{
              title: isEmpty(defaultData)
                ? 'Add Education Content'
                : 'Edit Education Content',
              closeIconAction: handleModal,
              isCloseIcon: false,
            }}
          >
            <EducationForm
              form={form}
              modalCloseAction={handleModal}
              refetchDataList={handleOnFetchDataList}
              defaultData={defaultData}
            />
          </ModalComponent>
        )}
        <AlertDialog
          open={open}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
      </>
    </Container>
  );
};

export default Education;
