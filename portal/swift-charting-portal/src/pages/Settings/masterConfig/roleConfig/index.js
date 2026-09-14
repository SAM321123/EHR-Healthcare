import React, { useCallback, useState, useMemo, useEffect } from 'react';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import { ROLE_LIST, DELETE_ROLE_DATA } from 'src/store/types';
import { showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import ModalComponent from 'src/components/modal';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import AddRole from './addRole';
import TableTextRendrer from 'src/components/TableTextRendrer';

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
    render:({data})=><TableTextRendrer>{data?.description || 'N/A'}</TableTextRendrer>,
  },
];

const RoleConfig = () => {
  const [openModal , setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleData, setRoleData] = useState();

  const [
    roleList,
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
    listId: ROLE_LIST,
    url: API_URL.role,
    type: REQUEST_METHOD.get,
  });
  const [deleteResponse, , , callRoleDeleteAPI, clearData] = useCRUD({
    id: DELETE_ROLE_DATA,
    url: API_URL.role,
    type: REQUEST_METHOD.update,
  });

  const deleteOrder = useCallback(() => {
    if (roleData) {
      const { id } = roleData;
      callRoleDeleteAPI({ isDeleted: true, isActive: false }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callRoleDeleteAPI, roleData]);

  const dialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setDeleteModalOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: deleteOrder,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteOrder]
  );
  useEffect(() => {
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: 'Delete successfully',
        severity: 'success',
      });
      clearData(true);
      handleOnFetchDataList();
    }
  }, [handleOnFetchDataList, deleteResponse, clearData]);

  const closeOpenModal = useCallback(() => {
    setOpenModal(false);
    setDefaultData(null);
  }, []);

  const handleEditRoleData = useCallback((rowData) => {
    if (rowData) {
      setDefaultData(rowData);

      setOpenModal(true);
    }
  }, []);
  
  const deleteDialogBox = useCallback((data) => {
    setRoleData(data);
    setDeleteModalOpen((value) => !value);
  }, []);

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
      {
        type: 'fabButton',
        style: { ml: 2 },
        onClick: () => {setOpenModal(true)},
      },
    ],
  });

  const moreActions =  [
      {
        label: 'Edit',
        icon: 'edit',
        action: handleEditRoleData,
      },
      {
        label: 'Delete',
        icon: 'delete',
        action: deleteDialogBox,
      },
    ];

  return (
    <>
      <Container
         style={{
          backgroundColor: palette.background.paper,
          padding: 0,
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
          data={roleList?.results}
          totalCount={roleList?.totalResults}
          columns={columns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          actionButtons={moreActions}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          wrapperStyle={{
            backgroundColor: palette.common.white,
            boxShadow: 'none',
            border: `1px solid ${palette.grey[200]}`,
            borderRadius: '0 5px 5px',
          }}
        />
      </Container>
      {openModal && (
        <ModalComponent
          open={openModal}
          header={{
            title: defaultData ? 'Edit Role' :'Add Role',
            closeIconAction: closeOpenModal,
          }}
        >
          <AddRole
            modalCloseAction={closeOpenModal}
            refetchData={handleOnFetchDataList}
            defaultData={defaultData} 
            fromMain={true}
          />
        </ModalComponent>
      )}
      <AlertDialog 
        open={deleteModalOpen}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      />
    </>
  );
};
export default RoleConfig;
