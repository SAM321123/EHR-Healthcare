/* eslint-disable no-unused-vars */
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { API_URL, BASE_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { dateFormats, faxType } from 'src/lib/constants';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { downloadPdf, getFullName, showSnackbar, triggerEvents } from 'src/lib/utils';
import { MEDICATION_DATA, MEDICATION_LIST } from 'src/store/types';
import palette from 'src/theme/palette';
import ShareAndFaxModal from '../ShareAndFaxModal';
import PatientInfo from '../patientInfo';
import { decrypt, encrypt } from 'src/lib/encryption';
import Events from 'src/lib/events';
import EncounterColumn from '../EncounterColumn/encounterColumn';
import ModalComponent from 'src/components/modal';
import MedicationFormNew from './medicationFormNew';
import PrintIcon from '@mui/icons-material/Print';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';

const medicationColumns = [
  {
    label: 'Medications',
    maxWidth: '6rem',
    type: 'text',
    render: ({ data }) => {
      const title = data?.items
        ?.map((item) => `${item?.genericDrug} (${item?.brandNameDrug})`)
        .join(', ');
      return (
        <TableTextRendrer
          title={title}
          style={{maxWidth:'20rem'}}
        >
          {title}
        </TableTextRendrer>
      );
    },
  },
  {
    label: 'Prescriber',
    type: 'number',
    render: ({data}) => <TableTextRendrer style={{maxWidth:'15rem'}}>{getFullName(data?.prescriber)}</TableTextRendrer>
  },
  {
    label: 'Created on',
    type: 'date',
    dataKey: 'createdAt',
    format: dateFormats.MMMDDYYYYHHMMSS,
    sort: true,
    maxWidth: '10rem',
  },
];
const MedicationList = ({showPatientInfo= true,applyContainer=true,asPopUp=false}={}) => {
  const params = useParams();
  const navigate = useNavigate();
  const [defaultData, setDefaultData] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [medicationData, setMedicationData] = useState();
  const [shareMedicationData, setShareMedicationData] = useState({});  

  const [userInfo, , , , , , userData] = useAuthUser();

  let { patientId } = params || {};
  patientId =decrypt(patientId);

  const { isCreate, isDelete, isUpdate, isRead, isPrint, isShare } = getModulePermisions({ moduleName: MODULE.medications,userData }) || {}
  
 
  const showMedicalModal = useCallback(() => {
    if(asPopUp){
      setDefaultData(null);
      setModalOpen(true);
    }else{
    Events.trigger(`PRESERVE_ENCOUNTER_FORM_DATA`);
    navigate(
      generatePath(UI_ROUTES.addPatientMedication, {
        ...params,
      }))
    }
  }, [asPopUp]);


  const showEMARModal = useCallback(() => {
    setDefaultData(null);
    // setModalOpen(true);
    navigate(
      generatePath(UI_ROUTES.patientEmarData, {
        ...params,
      }))
  }, []);

  const showAllSchedules = useCallback(() => {
    setDefaultData(null);
    // setModalOpen(true);
    navigate(
      generatePath(UI_ROUTES.patientMedicationSchedule, {
        ...params,
      }))
  }, []);


  const closeMedicationModal = useCallback(() => {
    setModalOpen(false);
    setDefaultData(null);
  }, []);

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
    listId: `${MEDICATION_LIST}-${patientId}`,
    url: API_URL.medication,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });


  const [
    deleteResponse,
    ,
    ,
    callMedicationDeleteAPI,
    clearData,
  ] = useCRUD({
    id: `${MEDICATION_DATA}-delete`,
    url: API_URL.medication,
    type: REQUEST_METHOD.update,
  });
  


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
          isCreate &&{
            type: 'fabButton',
            style: { ml: 1, minWidth: '38px' },
            actionLabel: 'ADD MEDICATION',
            onClick: showMedicalModal,
          },
          {
            type: 'button',
            style: { ml: 1, minWidth: '40px', display: !showPatientInfo && 'none' },
            actionLabel: 'eMAR',
            onClick: showEMARModal,
          },
          {
            type: 'button',
            style: { ml: 1, minWidth: '38px', display: !showPatientInfo && 'none' },
            actionLabel: 'All Schedules',
            onClick: showAllSchedules,
          },
        ],

      }),
    []
  );

  
  
  const handleEditMedication = useCallback(
    (rowData) => {
      if(asPopUp){
        setDefaultData(rowData.id);
        setModalOpen(true);
      }else{
      navigate(
        generatePath(UI_ROUTES.editPatientMedication, {
          ...params,
          medicationId: encrypt(String(rowData?.id)),
        })
      );
    }
    },
    [asPopUp]
  );
  const handleScheduleMedication = useCallback(
    (rowData) => {
      navigate(
        generatePath(UI_ROUTES.patientMedicationSchedule, {
          ...params,
          medicationId: encrypt(String(rowData?.id)),
        })
      );
    },
    []
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

  const deleteDialogBox = useCallback((data) => {
    setMedicationData(data);
    setOpen((value) => !value);
  }, []);

  const moreActions = [
    isUpdate &&{
      label: 'Edit',
      icon: 'edit',
      action:handleEditMedication,
    },
    isPrint && {
      label: 'Print',
      icon: 'print',
      action: (row) => {
        if (row?.id)
          downloadPdf( 
            `/${API_URL.downloadPatientMedicationPDF}/${row?.id}`
          );
      },
    },
    isShare && {
      label: 'Share',
      icon: 'share',
      action: (row) => {
        if (row?.id) setShareMedicationData(row);
      },
    },
    isDelete && {
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
    },
    {
      label: 'Schedule',
      icon: 'schedule',
      action: handleScheduleMedication,
    },
  ];


  const deletePatient = useCallback(() => {
    if (medicationData) {
      const { id } = medicationData;
      callMedicationDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callMedicationDeleteAPI, medicationData]);

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
        action: deletePatient,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deletePatient]
  );

  const closeShareAndFaxModal = ()=>{
    setShareMedicationData({});
  }

  const onRefershShareAndFaxModal =()=>{
    triggerEvents(`${MEDICATION_LIST}-${patientId}`);

  }

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
              <FilterCollectionHeader    onFilterChange={handleFilters}
                filters={filters} />
            </div>
          }
          data={response?.results || []}
          totalCount={response?.totalResults}
          columns={medicationColumns}
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
       {!isEmpty(shareMedicationData) && (
        <ShareAndFaxModal
          data={setShareMedicationData}
          onClose={closeShareAndFaxModal}
          url={`${API_URL.sharePatientMedication}/${shareMedicationData?.id}`}
          onRefersh={onRefershShareAndFaxModal}
          faxType={faxType.PATIENT_MEDICATION}
          title="Share Medication"
        />
      )}
      {modalOpen && (
        <ModalComponent
          open={modalOpen}
          header={{
            title: !defaultData ? 'Add Medication' : 'Edit Medication',
            closeIconAction: closeMedicationModal,
          }}
        >
          <MedicationFormNew
            customMedicationId={defaultData}
            onClose={closeMedicationModal}
            onRefersh={handleOnFetchDataList}
            asPopUp={asPopUp}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default MedicationList;