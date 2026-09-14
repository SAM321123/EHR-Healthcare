import React, { useCallback, useState, useMemo, useEffect } from 'react';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import { PROCEDURE_CODE_LIST, DELETE_PROCEDURE_CODE_DATA } from 'src/store/types';
import { showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import ModalComponent from 'src/components/modal';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import AddBillingCode from './addBillingCode';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { billingCodesFormGroups } from './formFIelds';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
  },
  {
    label: 'CPT Code',
    type: 'text',
    dataKey: 'cptCode',
  },
  {
    label: 'Description',
    type: 'text',
    dataKey: 'description',
  },
  {
    label: 'Qty',
    type: 'text',
    dataKey: 'qty',
  },
  {
    label: 'Modifiers',
    type: 'text',
    dataKey: 'qty',
    render:({data})=><TableTextRendrer>{`${data.modifier1}, ${data.modifier2}, ${data.modifier3}, ${data.modifier4}`}</TableTextRendrer>
  },
  {
    label: 'Price',
    type: 'text',
    dataKey: 'price',
  },
  {
    label: 'Total',
    type: 'text',
    dataKey: 'total',
  },
];

const BillingCodes = () => {
  const [openModal , setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testingLabData, setTestingLabData] = useState();

  const [
    testingLabList,
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
    listId: PROCEDURE_CODE_LIST,
    url: API_URL.procedureCode,
    type: REQUEST_METHOD.get,
  });
  const [deleteResponse, , , callTestingLabDeleteAPI, clearData] = useCRUD({
    id: DELETE_PROCEDURE_CODE_DATA,
    url: API_URL.procedureCode,
    type: REQUEST_METHOD.update,
  });

  const deleteOrder = useCallback(() => {
    if (testingLabData) {
      const { id } = testingLabData;
      callTestingLabDeleteAPI({ isDeleted: true, isActive: false }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callTestingLabDeleteAPI, testingLabData]);

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
        const data = {};
        billingCodesFormGroups.forEach(item=>{
            if(item.fields){
                item.fields.forEach(_item=>{
                    data[_item.name] = rowData[_item.name]
                })
            }else{
            data[item.name] = rowData[item.name];
            }
        })
        data.id= rowData.id;
      data.useForBillingCode =
        typeof rowData.useForBillingCode === 'boolean'
          ? rowData.useForBillingCode
          : !!rowData.cptCode;
      setDefaultData(data);

      setOpenModal(true);
    }
  }, []);
  const deleteDialogBox = useCallback((data) => {
    setTestingLabData(data);
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
          data={testingLabList?.results}
          totalCount={testingLabList?.totalResults}
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
            title: defaultData
              ? 'Edit Billing Code/ Service Type'
              : 'Add Billing Code/ Service Type',
            closeIconAction: closeOpenModal,
          }}
        >
          <AddBillingCode 
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
export default BillingCodes;
