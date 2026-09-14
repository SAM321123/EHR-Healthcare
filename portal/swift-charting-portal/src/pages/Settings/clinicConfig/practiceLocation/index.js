import React, { useCallback, useState, useMemo, useEffect } from 'react';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import { PRACTICE_LOCATION_DATA, DELETE_PRACTICE_LOCATION } from 'src/store/types';
import { showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import ModalComponent from 'src/components/modal';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import AddPracticeLocation from './addPracticeLocation';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { getAddress } from 'src/lib/constants';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
  },
  {
    label: 'Address',
    type: 'text',
    dataKey: 'address',
    render:({data})=><TableTextRendrer>{getAddress(data)}</TableTextRendrer>
  },
  {
    label: 'Fax Contact',
    type: 'text',
    dataKey: 'faxNo',
    render:({data})=><TableTextRendrer>{data?.faxNo || 'N/A'}</TableTextRendrer>
  },
  {
    label: 'Mobile Contact',
    type: 'text',
    dataKey: 'phoneNo',
    render:({data})=><TableTextRendrer>{data?.phoneNo || 'N/A'}</TableTextRendrer>
  },
  {
    label: 'Contact Person',
    type: 'text',
    dataKey: 'phoneNo',
    render:({data})=><TableTextRendrer>{data?.contactPersonNo || 'N/A'}</TableTextRendrer>
  },
];

const PracticeLocation = () => {
  const [openModal , setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [practiceLocationData, setPracticeLocationData] = useState();

  const [
    practiceLocations,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    fetchLocations,
  ] = useQuery({
    listId: PRACTICE_LOCATION_DATA,
    url: API_URL.practiceLocation,
    type: REQUEST_METHOD.get,
  }); 

  const [deleteResponse, , , callPracticeLocationDeleteAPI, clearData] = useCRUD({
    id: DELETE_PRACTICE_LOCATION,
    url: API_URL.practiceLocation,
    type: REQUEST_METHOD.update,
  });

  const deleteOrder = useCallback(() => {
    if (practiceLocationData) {
      const { id } = practiceLocationData;
      callPracticeLocationDeleteAPI({ isDeleted: true, isActive: false }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callPracticeLocationDeleteAPI, practiceLocationData]);

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
      fetchLocations();
    }
  }, [fetchLocations, deleteResponse, clearData]);

  const closeOpenModal = useCallback(() => {
    setOpenModal(false);
    setDefaultData(null);
  }, []);

  const handleEditPracticeLocation = useCallback((rowData) => {
    setDefaultData(rowData);
    setOpenModal(true);
  }, []);

  const deleteDialogBox = useCallback((data) => {
    setPracticeLocationData(data);
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
        action: handleEditPracticeLocation,
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
          data={practiceLocations?.results}
          totalCount={practiceLocations?.totalResults}
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
            title: defaultData ? 'Edit Practice Location' :'Add Practice Location',
            closeIconAction: closeOpenModal,
          }}
        >
          <AddPracticeLocation
            modalCloseAction={closeOpenModal}
            refetchData={fetchLocations}
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
export default PracticeLocation;
