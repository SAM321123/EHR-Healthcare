import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { showSnackbar } from 'src/lib/utils';
import { GET_FAX_CONTACT_DATA } from 'src/store/types';
import palette from 'src/theme/palette';
import ModalComponent from '../../components/modal';
import FaxContactForm from './FaxContactForm';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { getAddress } from 'src/lib/constants';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';
const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
  },
  {
    label: 'Fax Contact Number',
    type: 'text',
    dataKey: 'faxNo',
    render:({data})=>(
      <TableTextRendrer>
        {data?.faxNo || 'N/A'}
      </TableTextRendrer>
    )
  },
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
    render: ({ data }) => (
    <TableTextRendrer>
      {data?.email || 'N/A'}
    </TableTextRendrer>
    )
  },
  {
    label: 'Address',
    type: 'text',
    dataKey: 'address',
    render: ({ data }) => (
          <TableTextRendrer style={{ fontWeight: 600 }}>
            {getAddress(data) || 'N/A'}
          </TableTextRendrer>
      )
    },
];

const FaxContact = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [faxContactData, setFaxContactData] = useState();
  const [defaultData, setDefaultData] = useState();

  const [userInfo, , , , , , userData] = useAuthUser();

  const { isCreate, isDelete, isUpdate, isRead, isShare } = getModulePermisions({ moduleName: MODULE.faxContact, userData }) || {};

  const [
    faxList,
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
    listId: GET_FAX_CONTACT_DATA,
    url: API_URL.faxContact,
    type: REQUEST_METHOD.get,
  });

  const [
    deleteResponse,
    ,
    deleteFaxContactLoading,
    callFaxContactAPI,
    clearData,
  ] = useCRUD({
    id: `${GET_FAX_CONTACT_DATA}-delete`,
    url: API_URL.faxContact,
    type: REQUEST_METHOD.update,
  });

  const handleModal = useCallback(() => {
    setModalOpen((prev) => !prev);
    setDefaultData();
  }, []);

  const deleteDialogBox = useCallback((data) => {
    setFaxContactData(data);
    setOpen((value) => !value);
  }, []);

  const deleteFaxContact = useCallback(() => {
    if (faxContactData) {
      const { id } = faxContactData;
      callFaxContactAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callFaxContactAPI, faxContactData]);

  const editFaxContact = useCallback((data) => {
    if (data) {
      setDefaultData(data);
      setModalOpen(true);
    }
  }, []);

  const moreActions = [
    isUpdate && {
      label: 'Edit',
      icon: 'edit',
      action: editFaxContact,
    },
    isDelete && {
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
    },
  ];

  const dialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: deleteFaxContact,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteFaxContact]
  );

  useEffect(() => {
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: 'Delete successfully',
        severity: 'success',
      });
      clearData();
      handleOnFetchDataList();
    }
  }, [handleOnFetchDataList, deleteResponse, clearData]);

  const FilterCollectionHeader = FilterComponents({
    leftComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search',
        },
        name: 'searchText',
      },
    ],
    rightComponents: [
      isCreate && {
        type: 'fabButton',
        style: { ml: 2 },
        onClick: () => handleModal(),
      },
    ],
  });

  return (
    <Container
      style={{
        backgroundColor: palette.background.paper,
        padding: 16,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
      loading={loading}
    >
      <Table
        headerComponent={
          <FilterCollectionHeader
            onFilterChange={handleFilters}
            filters={filters}
          />
        }
        data={faxList?.results}
        totalCount={faxList?.totalResults}
        columns={columns}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        loading={loading || deleteFaxContactLoading}
        sort={sort}
        handleSort={handleSort}
        actionButtons={moreActions}
        wrapperStyle={{
          backgroundColor: palette.common.white,
          boxShadow: 'none',
          border: `1px solid ${palette.grey[200]}`,
          borderRadius: '0 5px 5px',
          overflowX: 'hidden',
        }}
      />
      {modalOpen && (
        <ModalComponent
          open={modalOpen}
          header={{
            title: isEmpty(defaultData)
              ? 'Add Fax Contact'
              : 'Edit Fax Contact',
            closeIconAction: handleModal,
          }}
        >
          <FaxContactForm
            modalCloseAction={handleModal}
            refetchData={handleOnFetchDataList}
            defaultData={defaultData}
          />
        </ModalComponent>
      )}
      <AlertDialog
        open={open}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      />
    </Container>
  );
};

export default FaxContact;
