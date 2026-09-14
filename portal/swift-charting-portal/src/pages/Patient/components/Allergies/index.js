/* eslint-disable no-unused-vars */
import { join } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import ModalComponent from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import Events from 'src/lib/events';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { convertWithTimezone, showSnackbar } from 'src/lib/utils';
import { ALLERGIES_LIST, ALLERGY_DATA } from 'src/store/types';
import palette from 'src/theme/palette';
import PatientInfo from '../patientInfo';
import AllergiesForm from './allergiesForm';
import { allergiesFormGroups } from './formGroup';
import { decrypt } from 'src/lib/encryption';
import EncounterColumn from '../EncounterColumn/encounterColumn';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';

const allergiesColumns = [
  {
    label: 'Allergent',
    type: 'text',
    dataKey: 'allergy',
    sort: true,
    maxWidth: '10rem',
    
  },
  {
    label: 'Severity',
    type: 'text',
    dataKey: 'severitiesCode',
    sort: true,
    maxWidth: '10rem',
    render:({data})=><TableTextRendrer>{data?.severities?.name || 'N/A'}</TableTextRendrer>,

  },
  {
    label: 'Reaction',
    type: 'text',
    dataKey: 'reaction.name',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>
        {join(
          data?.reactions?.map((item) => item.name),
          ','
        )}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Date Onset',
    dataKey: 'dateOfOnSet',
    type: 'date',
    sort: true,
    format: dateFormats.MMDDYYYY,
  },
];

const AllergiesList = ({showPatientInfo= true,applyContainer=true}={}) => {
  const params = useParams();
  const [defaultData, setDefaultData] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [allergyData, setAllergyData] = useState();

  let { patientId } = params || {};
  patientId =decrypt(patientId);

  const [userInfo, , , , , , userData] = useAuthUser();


  const { isCreate, isDelete, isUpdate, isRead } = 
    getModulePermisions({ moduleName: MODULE.allergies, userData }) || {}

  const [deleteResponse, , , callAllergyDeleteAPI, clearData] = useCRUD({
    id: `${ALLERGY_DATA}-delete`,
    url: API_URL.allergies,
    type: REQUEST_METHOD.update,
  });

  const handleEditAllergies = useCallback((rowData) => {
    if (rowData) {
      const clonedRowData = {};
      allergiesFormGroups.forEach((item) => {
        clonedRowData[item.name] = rowData[item.name];
      });
      clonedRowData.reactionCode = rowData.reactions;
      clonedRowData.id = rowData.id;
      if(clonedRowData.dateOfOnSet){
        clonedRowData.dateOfOnSet = convertWithTimezone(clonedRowData.dateOfOnSet,{requiredPlain:true})
      }
      setDefaultData(clonedRowData);
      setModalOpen(true);
    }
  }, []);

  const showAllegriesModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeAllegriesModal = useCallback(() => {
    setModalOpen(false);
    setDefaultData(null);
  }, []);

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
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
            style: { ml: 2, minWidth: '38px' },
            actionLabel: 'ADD ALLERGIES',
            onClick: showAllegriesModal,
          },
        ],
      }),
    []
  );

  const deleteAllergy = useCallback(() => {
    if (allergyData) {
      const { id } = allergyData;
      callAllergyDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callAllergyDeleteAPI, allergyData]);
  const deleteDialogBox = useCallback((data) => {
    setAllergyData(data);
    setOpen((value) => !value);
  }, []);

  // const moreActions = [
  //   {
  //     label: 'Edit',
  //     icon: 'edit',
  //     action: handleEditAllergies,
  //   },
  //   {
  //     label: 'Delete',
  //     icon: 'delete',
  //     action: deleteDialogBox,
  //   },
  // ];
  const moreActions = [
    isUpdate &&{
      label: 'Edit',
      icon: 'edit',
      action: handleEditAllergies,
    },
    isDelete &&{
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
    },
  ].filter(Boolean);
  
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
        action: deleteAllergy,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteAllergy]
  );

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
    listId: `${ALLERGIES_LIST}-${patientId}`,
    url: API_URL.allergies,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });

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

  return (
    <>
      <Container
        style={{ display: 'flex', flexDirection: 'column' }}
        loading={loading}
        applyContainer={applyContainer}
      >
        <Table
          headerComponent={
            <div>
              {showPatientInfo && (
                <PatientInfo wrapperStyle={{ marginBottom: 39 }} />
              )}
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            </div>
          }
          data={response?.results}
          totalCount={response?.totalResults}
          columns={allergiesColumns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
          timezone
          actionButtons={moreActions}
        />
        <AlertDialog
          open={open}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
      </Container>
      {modalOpen && (
        <ModalComponent
          open={modalOpen}
          header={{
            title: isEmpty(defaultData) ? 'Add Allergies' : 'Edit Allergies',
            closeIconAction: closeAllegriesModal,
          }}
        >
          <AllergiesForm
            modalCloseAction={closeAllegriesModal}
            refetchData={handleOnFetchDataList}
            defaultData={defaultData}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default AllergiesList;
