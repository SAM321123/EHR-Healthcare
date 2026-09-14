import React, { useCallback, useState, useMemo, useEffect } from 'react';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import {MASTER_DATA,DELETE_MASTER_DATA } from 'src/store/types';
import { globalCategoryFilterParser, showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import ModalComponent from 'src/components/modal';
import AddGlobalData from './addGlobalData';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import { Typography } from '@mui/material';
import TableTextRendrer from 'src/components/TableTextRendrer';


const columns = [
    {
      label: 'Name',
      type: 'text',
      dataKey: 'name',
      maxWidth: '10rem',
      sort: true,
    },
    {
      label: 'Description',
      dataKey: 'description',
      type: 'text',
      maxWidth: '10rem',
      render: ({data}) => <TableTextRendrer style={{ maxWidth: '15rem' }}>{data?.description || 'N/A'}</TableTextRendrer>
    },
    {
      label: 'Global Category Type',
      type: 'text',
      dataKey: 'globalCategoryType',
      maxWidth: '10rem',
      render: ({data}) => <TableTextRendrer>{data?.globalCategoryType?.name || 'N/A'}</TableTextRendrer>
    },
    {
      label: 'Sort Order',
      dataKey: 'sortOrder',
      type: 'number',
      maxWidth: '10rem',
      render: ({data}) => <Typography>{data?.sortOrder}</Typography>
    },
  ];

const GlobalTypes = () => {
  const [openModal , setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [masterData, setMasterData] = useState();

  const [
    mastersList,
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
    listId: MASTER_DATA,
    url: API_URL.getAllMasters,
    type: REQUEST_METHOD.get,
  });
  const [deleteResponse, , , callMasterDataDeleteAPI, clearData] = useCRUD({
    id: DELETE_MASTER_DATA,
    url: API_URL.updateMasters,
    type: REQUEST_METHOD.update,
  });

  const deleteOrder = useCallback(() => {
    if (masterData) {
      const { id } = masterData;
      callMasterDataDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callMasterDataDeleteAPI, masterData]);

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
  const handleEditMasterData = useCallback((rowData) => {
    if (rowData) {
      setDefaultData(rowData);
      setOpenModal(true);
    }
  }, []);
  const deleteDialogBox = useCallback((data) => {
    setMasterData(data);
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
        type: 'autocomplete',
        filterProps: {
          name: 'globalCategoryTypeCode',
          url: API_URL.globalTypeCategory,
          label: '',
          placeholder: 'Filter by Category',
          size: 'small',
          style: { maxWidth: '220px' },
          fetchInitial: true,
          filter: { isActive: true },
        },
        name: 'globalCategoryTypeCode',
        parser: globalCategoryFilterParser,
      },
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
        action: handleEditMasterData,
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
          data={mastersList?.results}
          totalCount={mastersList?.totalResults}
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
            title: defaultData ? 'Edit Master Data' :'Add Master Data',
            closeIconAction: closeOpenModal,
          }}
        >
          <AddGlobalData 
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
export default GlobalTypes;