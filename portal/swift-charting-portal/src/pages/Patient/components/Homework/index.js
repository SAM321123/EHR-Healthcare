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
import {
  convertWithTimezone,
  dateFormatter,
  getFullName,
  showSnackbar,
} from 'src/lib/utils';
import { HOMEWORK_DATA, HOMEWORK_LIST } from 'src/store/types';
import palette from 'src/theme/palette';
import TableDropDown from 'src/wiredComponent/DropDown';
import PatientInfo from '../patientInfo';
import HomeworkForm from './homeworkForm';
import Events from 'src/lib/events';
import { decrypt } from 'src/lib/encryption';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';
import { getHomeworkEditData } from './homeworkHelper';

const homeworkColumn = [
  {
    label: 'Title',
    type: 'text',
    dataKey: 'title',
    sort: true,
    maxWidth: '10rem',
  },
 
  {
    label: 'Diagnosis',
    type: 'text',
    maxWidth: '10rem',
    render:({data})=>{
      return <TableTextRendrer style={{maxWidth:'15rem'}}>{`${data?.diagnosisIcd?.name}${data?.diagnosisIcd?.description?` (${data?.diagnosisIcd?.description})`:''}`}</TableTextRendrer>
    }
  },
  {
      label: 'Status',
      dataKey: 'statusCode',
      type: 'text',
      sort: true,
      render: ({ data }) => (
        <>
          <TableDropDown
            data={data.status || {}}
            id={data.id}
            api={`${API_URL.homework}/${data.id}`}
            code="homework_status"
            dataKey="statusCode"
            eventId={`${HOMEWORK_LIST}-${data.patientId}`}
          />
        </>
      ),
    },
  {
    label: 'Start Date',
    dataKey: 'startDate',
    sort: true,
    render: ({ data }) => (
      <TableTextRendrer>
        {dateFormatter(data.startDate, dateFormats.MMDDYYYY)}
      </TableTextRendrer>
    ),
  },
  {
    label: 'End Date',
    dataKey: 'endDate',
    sort: true,
    render: ({ data }) => (
      <TableTextRendrer>
      {dateFormatter(data.endDate, dateFormats.MMDDYYYY)}
    </TableTextRendrer>
    ),
  },
];
const HomeworkList = ({
  showPatientInfo = true,
  applyContainer = true,
} = {}) => {
  const params = useParams();
  const [defaultData, setDefaultData] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [homeworkData, setHomeworkData] = useState();

  let { patientId } = params || {};
  patientId = decrypt(patientId);

  const [userInfo, , , , , , userData] = useAuthUser();

  const { isCreate, isDelete, isUpdate, isRead } =
    getModulePermisions({ moduleName: MODULE.homework, userData }) || {};

  const [deleteResponse, , , callHomeworkDeleteAPI, clearData] = useCRUD({
    id: `${HOMEWORK_DATA}-delete`,
    url: API_URL.homework,
    type: REQUEST_METHOD.update,
  });

  const handleEditHomework = useCallback((rowData) => {
    if (rowData) {
      const editData=getHomeworkEditData(rowData)
      setDefaultData(editData);
      setModalOpen(true);
    }
  }, []);

  const showHomeworkModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeHomeworkModal = useCallback(() => {
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
            actionLabel: 'ADD NEW HOMEWORK',
            onClick: showHomeworkModal,
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
    listId: `${HOMEWORK_LIST}-${patientId}`,
    url: API_URL.homework,
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

  const deleteDialogBox = useCallback((data) => {
    setHomeworkData(data);
    setOpen((value) => !value);
  }, []);

  const deletePatient = useCallback(() => {
    if (homeworkData) {
      const { id } = homeworkData;
      callHomeworkDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callHomeworkDeleteAPI, homeworkData]);

  const moreActions = [
    isUpdate && {
      label: 'Edit',
      icon: 'edit',
      action: handleEditHomework,
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
  const refetchData = () => {
    handleOnFetchDataList();
    Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
  };
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
          columns={homeworkColumn}
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
            title: isEmpty(defaultData) ? 'Add Homework' : 'Edit Homework',
            closeIconAction: closeHomeworkModal,
          }}
        >
          <HomeworkForm
            modalCloseAction={closeHomeworkModal}
            refetchData={refetchData}
            defaultData={defaultData}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default HomeworkList;
