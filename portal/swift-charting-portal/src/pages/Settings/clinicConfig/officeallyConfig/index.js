import React, { useCallback, useState, useMemo, useEffect } from 'react';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import { GET_OFFICE_ALLY_CONFIG, DELETE_OFFICE_ALLY_CONFIG } from 'src/store/types';
import { showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import ModalComponent from 'src/components/modal';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import OfficeallyConfigForm from './officeallyConfigForm';


const columns = [
  {
    label: 'Practice ID',
    type: 'text',
    dataKey: 'practiceId',
  },
  {
    label: 'App Name',
    type: 'text',
    dataKey: 'appName',
  },
  {
    label: 'Office Ally Key',
    type: 'text',
    dataKey: 'officeallyKey',
  },
  
];

const OfficeallyConfig = () => {
  const [openModal , setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [officeallyConfigData, setOfficeallyConfigData] = useState();

  const [
    officeallyConfigList,
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
    listId: GET_OFFICE_ALLY_CONFIG,
    url: API_URL.officeAllyConfig,
    type: REQUEST_METHOD.get,
  }); 

  const [deleteResponse, , , callDeleteAPI, clearData] = useCRUD({
    id: DELETE_OFFICE_ALLY_CONFIG,
    url: API_URL.officeAllyConfig,
    type: REQUEST_METHOD.update,
  });

  const deleteConfig = useCallback(() => {
    if (officeallyConfigData) {
      const { id } = officeallyConfigData;
      callDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callDeleteAPI, officeallyConfigData]);

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
        action: deleteConfig,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteConfig]
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
    setOfficeallyConfigData(data);
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
    rightComponents: 
    officeallyConfigList?.results?.length < 1
      ? [
          {
            type: 'fabButton',
            style: { ml: 2 },
            onClick: () => { setOpenModal(true); },
          },
        ]
      : [],
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
          data={officeallyConfigList?.results}
          totalCount={officeallyConfigList?.totalResults}
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
            title: defaultData ? 'Edit Office Ally Config' :'Add Office Ally Config',
            closeIconAction: closeOpenModal,
          }}
        >
          <OfficeallyConfigForm
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
export default OfficeallyConfig;
