import React, { useCallback, useState, useMemo, useEffect } from 'react';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import {LAB_TEST_LIST, DELETE_LAB_TEST_DATA } from 'src/store/types';
import { showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import ModalComponent from 'src/components/modal';
import AddLabTest from './addLabTest';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import TableTextRendrer from 'src/components/TableTextRendrer';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
  },
  {
    label: 'Cpt Code',
    type: 'text',
    dataKey: 'cptCode',
  },
  {
    label: 'Loinc Code',
    type: 'text',
    dataKey: 'loincCode',
  },
  {
    label: 'Description',
    dataKey: 'description',
    type: 'text',
    width: 200, // set a fixed width in pixels
    render: ({ data }) => (
      <TableTextRendrer
        style={{
          maxWidth: 200,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={data?.description || 'N/A'}
      >
        {data?.description || 'N/A'}
      </TableTextRendrer>
    ),
  },
];

const LabTestConfig = () => {
  const [openModal , setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [labTestData, setLabTestData] = useState();

  const [
    labTestList,
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
    listId: LAB_TEST_LIST,
    url: API_URL.laboratoryTest,
    type: REQUEST_METHOD.get,
  });
  const [deleteResponse, , , callLabTestDeleteAPI, clearData] = useCRUD({
    id: DELETE_LAB_TEST_DATA,
    url: API_URL.laboratoryTest,
    type: REQUEST_METHOD.update,
  });

  const deleteOrder = useCallback(() => {
    if (labTestData) {
      const { id } = labTestData;
      callLabTestDeleteAPI({ isDeleted: true, isActive: false }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callLabTestDeleteAPI, labTestData]);

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
    setLabTestData(data);
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
          data={labTestList?.results}
          totalCount={labTestList?.totalResults}
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
            title: defaultData ? 'Edit Lab Test' :'Add Lab Test',
            closeIconAction: closeOpenModal,
          }}
        >
          <AddLabTest 
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
export default LabTestConfig;
