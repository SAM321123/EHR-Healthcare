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
import { THIRD_PARTY_SETTING } from 'src/store/types';
import palette from 'src/theme/palette';
import { successMessage, thirdPartySettingStatus } from 'src/lib/constants';
import Modal from 'src/components/modal';
import PageContent from 'src/components/PageContent';
import FilterComponents from 'src/components/FilterComponents';
import Table from '../../../components/Table';
import ThirdPartySettingForm from './ThirdPartySettingForm';

const ThirdPartySettings = () => {
  const [defaultData, setDefaultData] = useState({});
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [deletedData, setDeleteData] = useState({});
  const form = useForm({ mode: 'onChange' });
  const { reset } = form;

  const columns = [
    {
      label: 'Type',
      type: 'text',
      dataKey: 'type',
      maxWidth: '2rem',
    },
    {
      label: 'Status',
      type: 'text',
      dataKey: 'status',
    },
  ];

  const [deleteMessageResponse, , , callDeleteApi, clearData] = useCRUD({
    id: `${THIRD_PARTY_SETTING}-delete`,
    url: API_URL.thirdPartySetting,
    type: REQUEST_METHOD.delete,
  });

  const [
    thirdPartySettingList,
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
    listId: THIRD_PARTY_SETTING,
    url: API_URL.thirdPartySetting,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const editThirdPartySetting = useCallback((data) => {
    if (data) {
      setOpenForm(true);
      setDefaultData(data);
    }
  }, []);

  const deleteThirdPartySetting = useCallback((data) => {
    setDeleteData(data);
    setOpen((value) => !value);
  }, []);

  const moreActions = (row) => {
    let actions = [
      {
        label: 'Delete',
        icon: 'delete',
        action: deleteThirdPartySetting,
      },
    ];
    if (row?.status !== thirdPartySettingStatus.VERIFIED) {
      actions = [
        {
          label: 'Edit',
          icon: 'edit',
          action: editThirdPartySetting,
        },
        ...actions,
      ];
    }
    return actions;
  };

  const handleDelete = useCallback(() => {
    const { id } = deletedData;
    callDeleteApi({}, `/${id}`);
    setOpen((pre) => !pre);
  }, [callDeleteApi, deletedData]);

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
  }, [reset, defaultData]);

  useEffect(() => {
    if (deleteMessageResponse) {
      showSnackbar({
        message: successMessage.delete,
        severity: 'success',
      });
      clearData(true);
      handleOnFetchDataList();
    }
  }, [clearData, deleteMessageResponse]);

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
          title="Third Party Settings"
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
          data={thirdPartySettingList?.results}
          totalCount={thirdPartySettingList?.totalResults}
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
              ? 'Add Third Party Setting'
              : 'Edit Third Party Setting',
          }}
          onClose={toggleModal}
          isNotScrollable
          isSmall
        >
          <ThirdPartySettingForm
            form={form}
            modalCloseAction={toggleModal}
            defaultData={defaultData}
          />
        </Modal>
      ) : null}
    </Container>
  );
};

export default ThirdPartySettings;
