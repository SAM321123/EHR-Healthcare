/* eslint-disable no-unused-vars */
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { encrypt } from 'src/lib/encryption';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { PATIENT_COLUMNS } from 'src/lib/tableConstants';
import { getUserRole, showSnackbar } from 'src/lib/utils';
import { PATIENT_DATA, PATIENT_LIST } from 'src/store/types';
import palette from 'src/theme/palette';
import SwitchLabel from 'src/wiredComponent/Switch';
import TwoFaSwitchLabel from 'src/wiredComponent/TwoFaSwitch'
import { Permissions } from 'src/utils/permissions';
import useAuthUser from 'src/hooks/useAuthUser';
import { getModulePermisions } from 'src/utils/genricMethods';
import { MODULE } from 'src/api/constants';

const columns = [...PATIENT_COLUMNS];

const PatientList = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [patientData, setPatientData] = useState();

  const [userInfo, , , , , , userData] = useAuthUser();

  const userRole = getUserRole()
  
  const { isCreate, isDelete, isUpdate, isRead } = getModulePermisions({ moduleName: MODULE.patient, userData }) || {}
  const [
    deleteResponse,
    ,
    deletePatientLoading,
    callPatientDeleteAPI,
    clearData,
  ] = useCRUD({
    id: `${PATIENT_DATA}-delete`,
    url: API_URL.patient,
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
    listId: PATIENT_LIST,
    url: API_URL.patient,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });
  const handleEditPatient = useCallback(
    (rowData) => {
      navigate(
        generatePath(UI_ROUTES.editPatient, {
          ...params,
          patientId: encrypt(String(rowData?.id)),
        })
      );
    },
    [navigate, params]
  );

  const handleViewPatient = useCallback(
    (rowData) => {
      navigate(
        generatePath(UI_ROUTES.patientSummary, {
          ...params,
          patientId: encrypt(String(rowData?.id)),
        })
      );
    },
    [navigate, params]
  );

  const handlePatientModalVisbility = useCallback(() => {
    navigate(UI_ROUTES.addPatient);
  }, []);


  const deleteDialogBox = useCallback((data) => {
    setPatientData(data);
    setOpen((value) => !value);
  }, []);

  const deleteFaxContact = useCallback(() => {
    if (patientData) {
      const { id } = patientData;
      callPatientDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callPatientDeleteAPI, patientData]);

  useEffect(() => {
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: 'Delete successfully',
        severity: 'success',
      });
      clearData();
      
      if (response?.results?.length === 1 && page > 1) {
        handlePageChange(page - 1);
      } else {
        handleOnFetchDataList();
      }
    }
  }, [handleOnFetchDataList, deleteResponse, clearData]);

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
        action: deleteFaxContact,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteFaxContact]
  );

  const FilterCollectionHeader = useMemo(()=>FilterComponents({
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
      isCreate
      && {
        type: 'fabButton',
        style: { ml: 2, minWidth: '38px' },
        actionLabel:'ADD PATIENT',
        onClick: handlePatientModalVisbility,
      }
    ],
  }),[]);

  // const moreActions = [
  //   isUpdate
  //   && {
  //     label: 'Edit',
  //     icon: 'edit',
  //     action:handleEditPatient,
  //   },
  //   isRead
  //   &&{
  //     label: 'View',
  //     icon: 'view',
  //     action:handleViewPatient,
  //   },
  //   isDelete
  //   && {
  //     label: 'Delete',
  //     icon: 'delete',
  //     action: deleteDialogBox,
  //   }
  // ];

  const moreActions = [
    isUpdate && {
      label: 'Edit',
      icon: 'edit',
      action: handleEditPatient,
    },
    isRead && {
      label: 'View',
      icon: 'view',
      action: handleViewPatient,
    },
    isDelete && {
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
    },
  ].filter(Boolean); 


  const onSwitchToggle = useCallback(() => {}, [columns, response]);
  
  const onRowClick = useCallback(
    (rowData) => {
      navigate(
        generatePath(UI_ROUTES.patientSummary, {
          ...params,
          patientId: encrypt(String(rowData?.id)),
        })
      );
    },
    [navigate, params]
  );

  useMemo(() => {
    columns.forEach((item) => {
      const temp = item;
      if (temp.dataKey === 'isActive') {
        temp.render = ({ data }) => (
          <SwitchLabel rowData={data} api={API_URL.patient} />
        );
        temp.handleChange = onSwitchToggle;
      }
      if (temp.dataKey === 'twoFaEnable') {
        temp.render = ({ data }) => (
                  <div onClick={(e) => e.stopPropagation()}> {/* 🔹 Stop row click */}

          <TwoFaSwitchLabel rowData={data} api={API_URL.patient} />
          </div>
        );
        temp.handleChange = onSwitchToggle;
      }
      return temp;
    });
  }, [columns]);

  return (
    <Container
      style={{ display: 'flex', flexDirection: 'column' }}
      loading={loading}
    >
      <Table
        onRowClick={onRowClick}
        headerComponent={
          <FilterCollectionHeader
            onFilterChange={handleFilters}
            filters={filters}
          />
        }
        data={response?.results}
        totalCount={response?.totalResults}
        columns={columns}
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
        actionToHide='Delete'
        checkFieldToHide='encounters'
      />
      <AlertDialog
        open={open}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      />
    </Container>
  );
};

export default PatientList;
