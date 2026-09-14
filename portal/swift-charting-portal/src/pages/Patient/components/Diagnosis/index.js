/* eslint-disable no-unused-vars */
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
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { convertWithTimezone, dateFormatter, getFullName, showSnackbar } from 'src/lib/utils';
import { DIAGNOSIS_DATA, DIAGNOSIS_LIST } from 'src/store/types';
import palette from 'src/theme/palette';
import TableDropDown from 'src/wiredComponent/DropDown';
import PatientInfo from '../patientInfo';
import DignosisForm from './diagnosisForm';
import { diagnosisFormGroups } from './formGroup';
import Events from 'src/lib/events';
import { decrypt } from 'src/lib/encryption';
import EncounterColumn from '../EncounterColumn/encounterColumn';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';

const diagnosisColumns = [
  {
    label: 'Diagnosis',
    type: 'text',
    dataKey: 'problem.name',
    maxWidth: '10rem',
  },
  {
    label: 'Diagnosis Description',
    type: 'text',
    dataKey: 'problem.description',
    maxWidth: '10rem',
  },
  {
    label: 'ICD10',
    type: 'text',
    dataKey: 'ICD.name',
    maxWidth: '10rem',
    render:({data})=>{
      return <TableTextRendrer style={{maxWidth:'15rem'}}>{`${data?.ICD?.name}${data?.ICD?.description?` (${data?.ICD?.description})`:''}`}</TableTextRendrer>
    }
  },
  {
    label: 'Type',
    dataKey: 'typeCode',
    type: 'text',
    sort: true,
    render: ({ data }) => (
      <TableTextRendrer>{data?.type?.name || 'N/A'} </TableTextRendrer>
    ),
  },
  {
    label: 'Comments',
    dataKey: 'comments',
    type: 'text',
    sort: true,
    maxWidth: '10rem',
    render:({data})=>{
      return <TableTextRendrer >{data?.comments || 'N/A'}</TableTextRendrer>
    }
  },
  {
    label: 'Last Edited',
    dataKey: 'updatedAt',
    sort: true,
    render: ({ data }) => (
      <div>
        <TableTextRendrer>
          {dateFormatter(data.updatedAt, dateFormats.MMDDYYYYhhmmA)}
        </TableTextRendrer>
        <TableTextRendrer>
          {getFullName(data.updatedBy || data.createdBy)}
        </TableTextRendrer>
      </div>
    ),
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'text',
    sort: true,
    render: ({ data }) => (
      <>
        <TableDropDown
          data={data.status || {}}
          id={data.id}
          api={`${API_URL.diagnosis}/${data.id}`}
          code="diagnosis_status"
          dataKey="statusCode"
        />
      </>
    ),
  },
];
const DiagnosisList = ({showPatientInfo= true,applyContainer=true}={}) => {
  const params = useParams();
  const [defaultData, setDefaultData] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState();

  let { patientId } = params || {};
  patientId =decrypt(patientId);

  const [userInfo, , , , , , userData] = useAuthUser();

  const { isCreate, isDelete, isUpdate, isRead } = getModulePermisions({ moduleName: MODULE.diagnosis, userData }) || {}

  const [deleteResponse, , , callDiagnosisDeleteAPI, clearData] = useCRUD({
    id: `${DIAGNOSIS_DATA}-delete`,
    url: API_URL.diagnosis,
    type: REQUEST_METHOD.update,
  });

  const handleEditDiagnosis = useCallback((rowData) => {
    if (rowData) {
      const clonedRowData = {};
      diagnosisFormGroups.forEach((item) => {
        if (item?.name) {
          clonedRowData[item?.name] = rowData[item?.name];
        }
      });
      clonedRowData.startDate = convertWithTimezone(clonedRowData.startDate,{requiredPlain:true});
      if(clonedRowData.endDate){
      clonedRowData.endDate = convertWithTimezone(clonedRowData.endDate,{requiredPlain:true});
      }
      clonedRowData.problemId = rowData.problem;
      clonedRowData.ICDId = rowData.ICD;
      clonedRowData.id = rowData.id;
      setDefaultData(clonedRowData);
      setModalOpen(true);
    }
  }, []);

  const showDiagnosisModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeDiagnosisModal = useCallback(() => {
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
            actionLabel: 'ADD NEW DIAGNOSIS',
            onClick: showDiagnosisModal,
          },
        ],
      }),
    []
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
    listId: `${DIAGNOSIS_LIST}-${patientId}`,
    url: API_URL.diagnosis,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId},
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

  const deleteDialogBox = useCallback((data) => {
    setDiagnosisData(data);
    setOpen((value) => !value);
  }, []);

  const deletePatient = useCallback(() => {
    if (diagnosisData) {
      const { id } = diagnosisData;
      callDiagnosisDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callDiagnosisDeleteAPI, diagnosisData]);

  const moreActions = [
    isUpdate && {
      label: 'Edit',
      icon: 'edit',
      action: handleEditDiagnosis,
    },
    isDelete && {
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
    },
  ];

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
const refetchData = ()=>{
  handleOnFetchDataList();
  Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`)
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
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            </div>
          }
          data={response?.results}
          totalCount={response?.totalResults}
          columns={diagnosisColumns}
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
            title: isEmpty(defaultData) ? 'Add Diagnosis' : 'Edit Diagnosis',
            closeIconAction: closeDiagnosisModal,
          }}
        >
          <DignosisForm
            modalCloseAction={closeDiagnosisModal}
            refetchData={refetchData}
            defaultData={defaultData}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default DiagnosisList;
