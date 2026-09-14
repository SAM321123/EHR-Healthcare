/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { API_URL, BASE_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { dateFormats, faxType } from 'src/lib/constants';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { downloadPdf, getFullName, showSnackbar } from 'src/lib/utils';
import palette from 'src/theme/palette';
import useCRUD from 'src/hooks/useCRUD';
import { ENCOUNTERS_LIST, ENCOUNTER_DATA } from 'src/store/types';
import Events from 'src/lib/events';
import { isEmpty } from 'lodash';
import { decrypt, encrypt } from 'src/lib/encryption';
import useReduxState from 'src/hooks/useReduxState';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';
import ModalComponent from 'src/components/modal';
import EncounterNoteForm from 'src/pages/EncounterNote/encounterNoteForm';


const EncountersColumns = [
  {
    label: 'Patient',
    type: 'text',
    dataKey: 'patientId',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => <TableTextRendrer>{getFullName(data.patient || {})}</TableTextRendrer>
  },
  {
    label: 'Type',
    maxWidth: '6rem',
    type: 'text',
    render: ({ data }) => <TableTextRendrer>{data?.encounterType?.name}</TableTextRendrer>
  },
  {
    label: 'Update By',
    dataKey: 'updatedById',
    type: 'text',
    render: ({ data }) => <TableTextRendrer>{data?.updatedById ? getFullName(data.updatedBy) : getFullName(data.createdBy)}</TableTextRendrer>
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


const EncountersList = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [encounterData, setEncounterData] = useState();

  const [open, setOpen] = useState();
  const [noteModalType, setNoteModalType] = useState(null);


  const [userInfo, , , , , , userData] = useAuthUser();

  let { patientId } = params || {};
  patientId = decrypt(patientId);

  const handleEncountersModalVisibility = useCallback(() => {
    navigate(generatePath(UI_ROUTES.addPatientEncounters, {
      ...params,
    }))
  }, [navigate, params]);

  const { isCreate, isDelete, isUpdate, isRead, isPrint } = getModulePermisions({ moduleName: MODULE.patientEncounters, userData }) || {}

  const [deleteResponse, , , callEncounterDeleteAPI, clearData] = useCRUD({
    id: `${ENCOUNTER_DATA}-delete`,
    url: API_URL.patientEncounter,
    type: REQUEST_METHOD.update,
  });

  //   const showMedicalModal = useCallback(() => {
  //     navigate(
  //       generatePath(UI_ROUTES.addPatientMedication, {
  //         ...params,
  //       }))
  //   }, []);

  //   const closeMedicationModal = useCallback(() => {
  //     setModalOpen(false);
  //     setDefaultData(null);
  //   }, []);

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
    listId: `${ENCOUNTERS_LIST}-${patientId}`,
    url: API_URL.patientEncounter,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
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
          encounterId: encrypt(String(rowData?.id)),
        })
      );
    }, [navigate, params])

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

  const closeEncounterNote = useCallback(() => {
    setNoteModalType(null);
    setEncounterData(null);
  }, []);

  const isEncounterSigned = useCallback(
    (rowData) => !rowData?.atDraft && Boolean(rowData?.signature?.trim()),
    []
  );

  const moreActions = useCallback(
    (rowData) => {
      const actions = [];
      if (!rowData.atDraft && isRead) {
        actions.push({
          label: 'View',
          icon: 'view',
          action: handleEditEncounter,
        });
      } else {
        isUpdate && actions.push({
          label: 'Edit',
          icon: 'edit',
          action: handleEditEncounter,
        });
      }

      isPrint && actions.push({
        label: 'Print',
        icon: 'print',
        action: (row) => {
          if (row?.id)
            downloadPdf(
              `/${API_URL.downloadPatientEncounterPDF}/${row?.id}`
            );
        },
      });

      isDelete && actions.push({
        label: 'Delete',
        icon: 'delete',
        action: deleteDialogBox,
      });
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
    [deleteDialogBox, handleEncounterAddendum, handleEncounterNote, handleEditEncounter, isCreate, isEncounterSigned, isDelete, isPrint, isRead, isUpdate]
  );

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
            actionLabel: 'CREATE ENCOUNTERS',
            onClick: handleEncountersModalVisibility,
          },
        ],
      }),
    [handleEncountersModalVisibility, isCreate]
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
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
    }
  }, [clearData, deleteResponse, handleOnFetchDataList, patientId]);

  return (
    <>
      <Container
        style={{ display: 'flex', flexDirection: 'column' }}
        loading={loading}
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
      </Container>
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
    </>
  );
};

export default EncountersList;
