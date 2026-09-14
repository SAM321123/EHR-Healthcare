/* eslint-disable no-unused-vars */
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import ModalComponent from 'src/components/modal';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import TableDropDown from 'src/wiredComponent/DropDown';
import { DELETE_TREATMENT_PLAN_DATA, TREATMENT_PLAN } from 'src/store/types';
import { TreatmentPlanProvider } from './treatmentPlanContext';
import { getFullName } from 'src/lib/utils';

import { cloneDeep } from 'lodash';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import palette from 'src/theme/palette';
import PatientInfo from '../patientInfo';
import { decrypt } from 'src/lib/encryption';
import SelectTreatmentPlanTemplate from './selectTreatmentPlanTemplate';
import useAuthUser from 'src/hooks/useAuthUser';
import { getModulePermisions } from 'src/utils/genricMethods';

const treatmentPlanColumn = [
  {
    label: 'Problem',
    type: 'text',
    dataKey: 'problem',
    render: ({ data }) => {
      const problems = data?.diag
        ?.map((problem) => problem?.ICDId?.name)
        .join(', ');
      return (
        <div>
          <TableTextRendrer>{problems || 'N/A'}</TableTextRendrer>
        </div>
      );
    },
  },
  {
    label: 'Created Date',
    type: 'date',
    dataKey: 'createdAt',
    sort: true,
    format: dateFormats.MMDDYYYY,
  },
  {
    label: 'Start Date',
    type: 'date',
    dataKey: 'startDate',
    sort: true,
    format: dateFormats.MMDDYYYY,
  },
  {
    label: 'Created By',
    dataKey: 'createdBy',
    type: 'text',
    render: ({ data }) => (
      <div>
        <TableTextRendrer>{getFullName(data.createdBy)}</TableTextRendrer>
      </div>
    ),
  },
  {
    label: 'Reviewed By',
    dataKey: 'reviewedBy',
    type: 'text',
    render: ({ data }) => (
      <div>
        <TableTextRendrer>{getFullName(data.reviewedBy)}</TableTextRendrer>
      </div>
    ),
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
          api={`${API_URL.treatmentPlan}/${data.id}`}
          code="treatment_plan_status"
          dataKey="statusCode"
          eventId={`${TREATMENT_PLAN}-${data.patientId}`}
        />
      </>
    ),
  },
];
const TreatmentPlanLists = () => {
  const params = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalopen, setDeleteModalOpen] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [deleteData, setDeleteData] = useState();

  let { patientId } = params || {};
  patientId = decrypt(patientId);

  const [userInfo, , , , , , userData] = useAuthUser();
  const { isCreate, isDelete, isUpdate, isRead, isPrint, isShare } = getModulePermisions({ moduleName: MODULE.treatmentPlan,userData }) || {}

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
    listId: `${TREATMENT_PLAN}-${patientId}`,
    url: API_URL.treatmentPlan,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });

  const [deleteResponse, , , callDeleteAPI, clearData] = useCRUD({
    id: DELETE_TREATMENT_PLAN_DATA,
    url: API_URL.treatmentPlan,
    type: REQUEST_METHOD.update,
  });

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

  const deleteRecord = useCallback(() => {
    if (deleteData) {
      const { id } = deleteData;
      callDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callDeleteAPI, deleteData]);

  const deleteDialogBox = useCallback((data) => {
    setDeleteData(data);
    setDeleteModalOpen((value) => !value);
  }, []);

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
        action: deleteRecord,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteRecord]
  );

  const handleEditTreatmentPlan = useCallback((rowData) => {
    if (rowData) {
      const clonedRowData = cloneDeep(rowData);
      delete clonedRowData.fileId;
      setDefaultData(clonedRowData);
      setModalOpen(true);
    }
  }, []);

  const showTreatmentModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeTreatmentModal = useCallback(() => {
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
              placeholder: 'Search by status',
            },
            name: 'searchText',
          },
        ],
        rightComponents: [
          isCreate && {
            type: 'fabButton',
            style: { ml: 2, minWidth: '38px' },
            actionLabel: 'ADD TREATMENT PLAN',
            onClick: showTreatmentModal,
          },
        ],
      }),
    []
  );

  const moreActions = [
    isUpdate && {
      label: 'Edit',
      icon: 'edit',
      action: handleEditTreatmentPlan,
    },
    isDelete && {
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
    },
  ];

  return (
    <>
      <Container
        style={{ display: 'flex', flexDirection: 'column' }}
        loading={loading}
      >
        <Table
          headerComponent={
            <div>
              <PatientInfo wrapperStyle={{ marginBottom: 39 }} />
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            </div>
          }
          data={response?.results}
          totalCount={response?.totalResults}
          columns={treatmentPlanColumn}
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
          open={deleteModalopen}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
      </Container>
      {modalOpen && (
        <ModalComponent
          modalStyle={{ width: '100%' }}
          open={modalOpen}
          header={{
            title: isEmpty(defaultData)
              ? 'Add Treatment Plan'
              : 'Edit Treatment Plan',
            closeIconAction: closeTreatmentModal,
          }}
        >
          <TreatmentPlanProvider>
            <SelectTreatmentPlanTemplate
              modalCloseAction={closeTreatmentModal}
              refetchData={handleOnFetchDataList}
              defaultData={defaultData}
            />
          </TreatmentPlanProvider>
        </ModalComponent>
      )}
    </>
  );
};

export default TreatmentPlanLists;
