/* eslint-disable no-unused-vars */
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import ModalComponent from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { encrypt } from 'src/lib/encryption';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { getFullName, showSnackbar } from 'src/lib/utils';
import { ENCOUNTERS_LIST, ENCOUNTER_DATA } from 'src/store/types';
import palette from 'src/theme/palette';
import SelectPatientForm from './selectPatientForm';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';
import EncounterNoteForm from '../EncounterNote/encounterNoteForm';

const EncountersColumns = [
  {
    label: 'Patient',
    type: 'text',
    dataKey: 'patientId',
    sort: true,
    maxWidth: '10rem',
    render:({data})=><TableTextRendrer>{getFullName(data.patient || {})}</TableTextRendrer>
  },
  {
    label: 'Type',
    maxWidth: '6rem',
    type: 'text',
    render:({data})=><TableTextRendrer>{data?.encounterType?.name}</TableTextRendrer>
  },
  {
    label: 'Update By',
    dataKey:'updatedById',
    type: 'text',
    render:({data})=><TableTextRendrer>{data?.updatedById ? getFullName(data.updatedBy):getFullName(data.createdBy)}</TableTextRendrer>
  },
  {
    label: 'Updated on',
    type: 'date',
    dataKey: 'updatedAt',
    format: dateFormats.MMMDDYYYYHHMMSS,
    sort: true,
    maxWidth: '10rem',
  },
];


const EncountersList = ({applyContainer=true, fromDashboard}) => {
  const params = useParams();
  const navigate = useNavigate();
  const [encounterData, setEncounterData] = useState();
  const [open, setOpen] = useState();
  const [showPatientModel, setShowPatientModel] = useState(false);
  const [noteModalType, setNoteModalType] = useState(null);

  const [userInfo, , , , , , userData] = useAuthUser();

  const { isCreate, isDelete, isUpdate, isRead } = getModulePermisions({ moduleName: MODULE.encounter, userData }) || {};

  const [deleteResponse, , , callEncounterDeleteAPI, clearData] = useCRUD({
    id: `${ENCOUNTER_DATA}-delete`,
    url: API_URL.patientEncounter,
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
    listId: `${ENCOUNTERS_LIST}`,
    url: API_URL.patientEncounter,
    type: REQUEST_METHOD.get,
    ...(fromDashboard ? {queryParams: {
      atDraft:true,
    }}:{}),
    subscribeSocket: true,
  });
  
  const deleteEncounters = useCallback(() => {
    if (encounterData) {
      const { id } = encounterData;
      callEncounterDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callEncounterDeleteAPI, encounterData]);
  const deleteDialogBox = useCallback((data) => {
    setEncounterData(data);
    setOpen((value) => !value);
  }, []);


const handleEditEncounter = useCallback(
  (rowData) => {
    navigate(
      generatePath(UI_ROUTES.editPatientEncounter, {
        ...params,
        patientId:encrypt(String(rowData.patientId)),
        encounterId: encrypt(String(rowData?.id)),
      })
    );
  }, [navigate, params])

  const handleEncountersModalVisibility = useCallback(() => {
    setShowPatientModel(true);
  }, []);
  const closePatientModel = useCallback(() => {
    setShowPatientModel(false);
  }, []);
  // const moreActions = [
  //   {
  //     label: 'Edit',
  //     icon: 'edit',
  //     action: handleEditEncounter,
  //     display: isDashboardView,
  //   },
  //   {
  //     label: 'Delete',
  //     icon: 'delete',
  //     action: deleteDialogBox,
  //     display: isDashboardView,
  //   },
  //   {
  //     label: 'View',
  //     icon: 'view',
  //     action: handleEditEncounter,
  //     display: isDashboardView ? isDashboardView : true,
  //   },
  // ].filter((component) => component.display === true);


  const handleEncounterNote = useCallback(
    (rowData) => {
      setEncounterData(rowData);
      setNoteModalType('note')
    }, [])

  const handleEncounterAddendum = useCallback(
    (rowData) => {
      setEncounterData(rowData);
      setNoteModalType('addendum')
    }, [])

  const isEncounterSigned = useCallback(
    (rowData) => !rowData?.atDraft && Boolean(rowData?.signature?.trim()),
    []
  );

  const moreActions = useCallback(
    (rowData) => {
      const actions = [];
      if (rowData?.atDraft) {
        isUpdate && actions.push({
          label: 'Edit',
          icon: 'edit',
          action: handleEditEncounter,
        });
      }
      if (!rowData?.atDraft) {
        actions.push({
          label: 'View',
          icon: 'view',
          action: handleEditEncounter,
        })
      }
      (isUpdate || isCreate) && actions.push({
        label: 'Note',
        icon: 'note',
        action: handleEncounterNote,
      });
      (isUpdate || isCreate) && isEncounterSigned(rowData) && actions.push({
        label: 'Addendum',
        icon: 'note',
        action: handleEncounterAddendum,
      });
      return actions;
    },
    [handleEditEncounter, handleEncounterAddendum, handleEncounterNote, isCreate, isEncounterSigned, isUpdate]
  );

const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search patient',
            },
            name: 'searchText',
          },
          
        ],
        rightComponents: [
          isCreate && {
            type: 'fabButton',
            style: { ml: 2, minWidth: '38px'},
            actionLabel: 'CREATE ENCOUNTERS',
            onClick: handleEncountersModalVisibility,
            display: !fromDashboard,
          },
        ].filter((component) => component.display === true),
      }),
    [fromDashboard, handleEncountersModalVisibility, isCreate]
  );

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
        action: deleteEncounters,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteEncounters]
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

    const closeEncounterNote = useCallback(() => {
      setNoteModalType(null);
      setEncounterData(null);
    }, []);
  console.log('applyContainer', applyContainer)
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
              <FilterCollectionHeader    
                onFilterChange={handleFilters}
                filters={filters} 
              />
            </div>
          }
          data={response?.results || []}
          totalCount={response?.totalResults}
          columns={EncountersColumns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
          timezone
          // actionButtons={moreActions}
          actionButtons={(rowData) => moreActions(rowData)}
        />
        <AlertDialog
          open={open}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
        {showPatientModel && <ModalComponent
          open={showPatientModel}
          header={{
            title: `Select Patient`,
            closeIconAction: closePatientModel,
          }}
          containerStyle={{ width: '40%' }}
        >
          <SelectPatientForm onClose={closePatientModel} />
        </ModalComponent>}
        <ModalComponent
          open={Boolean(noteModalType)}
          header={{
            title: noteModalType === 'addendum' ? 'Encounter Addendum' : 'Encounter Notes',
            closeIconAction: closeEncounterNote,
          }}
          modalStyle={{ width: '100%' }}

        >
          <EncounterNoteForm
            modalCloseAction={closeEncounterNote}
            refetchData={handleOnFetchDataList}
            encounterData={encounterData}
            noteType={noteModalType || 'note'}
          />
        </ModalComponent>
      </Container>
    </>
  );
};

export default EncountersList;
