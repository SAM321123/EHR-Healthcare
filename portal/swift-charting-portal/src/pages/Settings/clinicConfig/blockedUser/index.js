/* eslint-disable no-unused-vars */
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { BLOCKED_USER_COLUMN } from 'src/lib/tableConstants';
import {  roleFilterParser, showSnackbar } from 'src/lib/utils';
import { BLOCKED_USER_LIST } from 'src/store/types';
import palette from 'src/theme/palette';
import {  responseModifierRolesFoBlockedUser } from 'src/api/helper';

const columns = [...BLOCKED_USER_COLUMN];

const BlockedUser = () => {
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [staffData, setStaffData] = useState();
  const [
    updateResponse,
    ,
    updateStaffLoading,
    callUpdateAPI,
    clearData,
  ] = useCRUD({
    id: `${BLOCKED_USER_LIST}-unblock`,
    url: API_URL.blockedUser,
    type: REQUEST_METHOD.update,
  });

  const [
    response,
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
    listId: BLOCKED_USER_LIST,
    url: API_URL.blockedUser,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,

  });
  

  const unblockDialogBox = useCallback((data) => {
    setStaffData(data);
    setUnblockModalOpen((value) => !value);
  }, []);

  const updateUser = useCallback(() => {
    if (staffData) {
      const { id } = staffData;
      callUpdateAPI({ isBlocked: false }, `/${id}`);
    }
    setUnblockModalOpen((pre) => !pre);
  }, [callUpdateAPI, staffData]);

  useEffect(() => {
    if (!isEmpty(updateResponse)) {
      showSnackbar({
        message: 'Unblock successfully',
        severity: 'success',
      });
      clearData();
      handleOnFetchDataList();
    }
  }, [handleOnFetchDataList, updateResponse, clearData]);

  const dialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setUnblockModalOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: updateUser,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [updateUser]
  );

  const FilterCollectionHeader = useMemo(()=>FilterComponents({
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
        type: 'wiredSelect',
        filterProps: {
          name: 'roleCodeFilter',
          url: API_URL.role,
          label: '',
          labelAccessor: 'name',
          // valueAccessor: 'code',
          placeholder: 'Filter by Role',
          size: 'small',
          style: { maxWidth: '220px' },
          cache: false,
          clearData: true,
          isAllOptionNeeded:true,
          defaultValue:"ALL",
          responseModifier: responseModifierRolesFoBlockedUser

        },
        name: 'role',
        parser: roleFilterParser,
      },
    ],
  }),[]);

  const moreActions = [
    {
      label: 'Unblock',
      icon: 'unblock',
      action: unblockDialogBox,
    },
  ];

  console.log('response', response)
  return (
    <Container
      style={{ display: 'flex', flexDirection: 'column' }}
      loading={loading}
    >
      <Table
        headerComponent={
          <FilterCollectionHeader
            onFilterChange={handleFilters}
            filters={filters}
          />
        }
        data={response?.results}
        totalCount={response?.totalResults}
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
      <AlertDialog
        open={unblockModalOpen}
        content="Are you sure you want to unblock?"
        actions={dialogActions}
      />
    </Container>
  );
};

export default BlockedUser;
