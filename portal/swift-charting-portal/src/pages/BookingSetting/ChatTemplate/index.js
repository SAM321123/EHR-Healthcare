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
import { GET_CHAT_TEMPLATE } from 'src/store/types';
import palette from 'src/theme/palette';
import { successMessage } from 'src/lib/constants';
import Modal from 'src/components/modal';
import PageContent from 'src/components/PageContent';
import FilterComponents from 'src/components/FilterComponents';
import Table from '../../../components/Table';
import ChatTemplateForm from './ChatTemplateForm';

const columns = [
  {
    label: 'Tag',
    type: 'text',
    dataKey: 'tag',
    maxWidth: '2rem',
  },
  {
    label: 'Template',
    type: 'text',
    dataKey: 'template',
  },
];

const ChatTemplate = () => {
  const [defaultData, setDefaultData] = useState({});
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [deletedData, setDeleteData] = useState({});
  const form = useForm({ mode: 'onChange' });
  const { reset } = form;

  const [deleteMessageResponse, , , callMessageApi, clearData] = useCRUD({
    id: `${GET_CHAT_TEMPLATE}-delete`,
    url: API_URL.chatTemplate,
    type: REQUEST_METHOD.delete,
  });

  const [
    templateList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    ,
    ,
    handleOnFetchDataList,
  ] = useQuery({
    listId: GET_CHAT_TEMPLATE,
    url: API_URL.chatTemplate,
    type: REQUEST_METHOD.get,
  });

  const editMedicine = useCallback((data) => {
    if (data) {
      setOpenForm(true);
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
    const { id, template } = deletedData;
    callMessageApi({ template }, `/${id}`);
    setOpen((pre) => !pre);
  }, [callMessageApi, deletedData]);

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

  const handleForm = useCallback(() => {
    reset();
    setDefaultData({});
    setOpenForm(true);
  }, [reset]);

  useEffect(() => {
    if (deleteMessageResponse) {
      showSnackbar({
        message: successMessage.delete,
        severity: 'success',
      });
      clearData();
      handleOnFetchDataList();
    }
  }, [clearData, deleteMessageResponse, handleOnFetchDataList]);

  const FilterCollectionHeader = FilterComponents({
    rightComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search',
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

  const toggleModal = useCallback(() => {
    setOpenForm(false);
  }, []);

  return (
    <Container
      loading={loading}
      style={{
        backgroundColor: palette.background.paper,
        padding: 16,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
    >
      <PageContent>
        <PageHeader
          title="Chat Templates"
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
          data={templateList?.results}
          totalCount={templateList?.totalResults}
          columns={columns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          actionButtons={moreActions}
        />
        <AlertDialog
          open={open}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
      </PageContent>
      {openForm ? (
        <Modal
          open={openForm}
          header={{
            title: isEmpty(defaultData)
              ? 'Add Chat Template'
              : 'Edit Chat Template',
          }}
          onClose={toggleModal}
          isNotScrollable
          isSmall
        >
          <ChatTemplateForm
            form={form}
            modalCloseAction={toggleModal}
            defaultData={defaultData}
            handleOnFetchDataList={handleOnFetchDataList}
          />
        </Modal>
      ) : null}
    </Container>
  );
};

export default ChatTemplate;
