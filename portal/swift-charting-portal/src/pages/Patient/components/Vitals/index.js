/* eslint-disable no-unused-vars */
import { cloneDeep } from 'lodash';
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
import { convertWithTimezone, showSnackbar } from 'src/lib/utils';
import {
  VITALS_DATA,
  VITALS_LIST
} from 'src/store/types';
import palette from 'src/theme/palette';
import ShowPatientActivityLog from '../Home/TopCard';
import PatientInfo from '../patientInfo';
import AllergiesForm from './vitalForm';
import { decrypt } from 'src/lib/encryption';
import EncounterColumn from '../EncounterColumn/encounterColumn';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';

const vitalsColumns = [
  {
    label: 'Blood Pressure (Systolic)',
    type: 'text',
    dataKey: 'bloodPressure',
    sort: true,
    maxWidth: '4rem',
    render: ({ data }) => (
      <TableTextRendrer>
        {data.bloodPressure ? `${data.bloodPressure} mm/Hg` : 'N/A'}
      </TableTextRendrer>
    )  },
  {
    label: 'Blood Pressure (Diastolic)',
    type: 'text',
    dataKey: 'bloodPressure',
    sort: true,
    maxWidth: '4rem',
    render: ({ data }) => (
      <TableTextRendrer>
        {data.diastolic ? `${data.diastolic} mm/Hg` : 'N/A'}
      </TableTextRendrer>
    )
  },
  {
    label: 'Respiratory Rate',
    type: 'text',
    dataKey: 'respiratoryRate',
    sort: true,
    maxWidth: '6rem',
    render: ({ data }) => (
      <TableTextRendrer>
        {data.respiratoryRate ? `${data.respiratoryRate} rpm` : 'N/A'}
      </TableTextRendrer>
    )
  },
  {
    label: 'Temperature',
    type: 'text',
    dataKey: 'tempreature',
    sort: true,
    maxWidth: '5rem',
    render: ({ data }) => (
      <TableTextRendrer>
        {data.tempreature ? `${data.tempreature} °F` : 'N/A'}
      </TableTextRendrer>
    )
  },
  {
    label: 'Height',
    type: 'text',
    dataKey: 'ft',
    sort: true,
    maxWidth: '3rem',
    render: ({ data }) => {
      if (data.ft) {
        let heightInFeet = `${data.ft} ft${data.in ? ` ${data.in} in` : ''}`;
        return <TableTextRendrer>{heightInFeet}</TableTextRendrer>;
      }
      return <TableTextRendrer>N/A</TableTextRendrer>;
    },
  },
  {
    label: 'Weight',
    type: 'text',
    dataKey: 'lsb',
    sort: true,
    maxWidth: '3rem',
    render: ({ data }) => {
      if (data.lsb) {
        return (
          <TableTextRendrer>
            {`${data.lsb} lsb${data.oz ? ` ${data.oz} oz` : ''}`}
          </TableTextRendrer>
        );
      }
      return <TableTextRendrer>N/A</TableTextRendrer>;
    }
  },
  {
    label: 'BMI',
    type: 'text',
    dataKey: 'bmi',
    sort: true,
    maxWidth: '2rem',
    render: ({ data }) => (
      <TableTextRendrer>{data.bmi !== null && data.bmi !== undefined ? data.bmi : 'N/A'}</TableTextRendrer>
    )
  },
  {
    label: 'Recorded',
    dataKey: 'recordDateTime',
    type: 'date',
    sort: true,
    maxWidth: '8rem',
    format: dateFormats.MMDDYYYYhhmmA,
  },
];

const VitalsList = ({showPatientInfo= true,applyContainer=true}={}) => {
  const params = useParams();
  const [defaultData, setDefaultData] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteData, setDeleteData] = useState();

  let { patientId } = params || {};
  patientId =decrypt(patientId);

  const [userInfo, , , , , , userData] = useAuthUser();

  const { isCreate, isDelete, isUpdate, isRead } = getModulePermisions({ moduleName: MODULE.vitals, userData }) || {}

  const [deleteResponse, , , callDeleteAPI, clearData] = useCRUD({
    id: `${VITALS_DATA}-delete`,
    url: API_URL.vitals,
    type: REQUEST_METHOD.update,
  });

  const handleEditVitals = useCallback((rowData) => {
    if (rowData) {
      const clonedRowData = cloneDeep(rowData);
      const recordDateTime = convertWithTimezone(clonedRowData.recordDateTime,{requiredPlain:true});
      const recordTime = recordDateTime.format(dateFormats.hhmmA);
      clonedRowData.recordDateTime = recordDateTime
      const recordTimeArray = recordTime.split(' ');
      const hour = recordTimeArray[0].split(':')[0];
      const minute = recordTimeArray[0].split(':')[1];
      const meridien = recordTimeArray[1];
      clonedRowData.hour = hour;
      clonedRowData.minute = minute;
      clonedRowData.meridien = meridien;

      setDefaultData(clonedRowData);
      setModalOpen(true);
    }
  }, []);

  const showVitalsModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeVitalsModal = useCallback(() => {
    setModalOpen(false);
    setDefaultData(null);
  }, []);

  const deleteDialogBox = useCallback((data) => {
    setDeleteData(data);
    setOpen((value) => !value);
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
            actionLabel: 'ADD VITALS',
            onClick: showVitalsModal,
          },
        ],
      }),
    []
  );

  const moreActions = [
    isUpdate && {
      label: 'Edit',
      icon: 'edit',
      action: handleEditVitals,
    },
    isDelete && {
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
    },
  ];

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
    listId: `${VITALS_LIST}-${patientId}`,
    url: API_URL.vitals,
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
      clearData(true);
      handleOnFetchDataList();
    }
  }, [handleOnFetchDataList, deleteResponse, clearData]);

  const deleteRecord = useCallback(() => {
    if (deleteData) {
      const { id } = deleteData;
      callDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callDeleteAPI, deleteData]);

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
        action: deleteRecord,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteRecord]
  );
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
          columns={vitalsColumns}
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
          footer={
            <div style={{ marginTop: 30 }}>
              <ShowPatientActivityLog patientId={patientId} />
            </div>
          }
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
            title: isEmpty(defaultData)
              ? 'New Vital Signs'
              : 'Edit Vital Signs',
            closeIconAction: closeVitalsModal,
          }}
          boxStyle = {{ width: '900px' }}
        >
          <AllergiesForm
            modalCloseAction={closeVitalsModal}
            refetchData={handleOnFetchDataList}
            defaultData={defaultData}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default VitalsList;
