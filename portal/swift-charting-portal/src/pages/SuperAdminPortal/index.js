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
import { Permissions } from 'src/utils/permissions';
import useAuthUser from 'src/hooks/useAuthUser';
import { getModulePermisions } from 'src/utils/genricMethods';
import { MODULE } from 'src/api/constants';

const columns = [
    {
      label: 'ID',
      type: 'text',
      dataKey: 'id',
      sort: true,
      maxWidth: '10rem',
    },
    {
      label: 'Practice Name',
      type: 'text',
      dataKey: 'practiceName',
      sort: true,
      maxWidth: '10rem',
    },
  ];

const PracticeList = () => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [practiceData, setPracticeData] = useState();
  
//   const [
//     deleteResponse,
//     ,
//     deletePatientLoading,
//     callPatientDeleteAPI,
//     clearData,
//   ] = useCRUD({
//     id: `${PATIENT_DATA}-delete`,
//     url: API_URL.patient,
//     type: REQUEST_METHOD.update,
//   });

//   const [
//     response,
//     loading,
//     page,
//     rowsPerPage,
//     handlePageChange,
//     filters,
//     handleFilters,
//     sort,
//     handleSort,
//     handleOnFetchDataList,
//   ] = useQuery({
//     listId: PATIENT_LIST,
//     url: API_URL.patient,
//     type: REQUEST_METHOD.get,
//     subscribeSocket: true,
//   });

//   const handleEditPatient = useCallback(
//     (rowData) => {
//       navigate(
//         generatePath(UI_ROUTES.editPatient, {
//           ...params,
//           patientId: encrypt(String(rowData?.id)),
//         })
//       );
//     },
//     [navigate, params]
//   );

//   const handleViewPatient = useCallback(
//     (rowData) => {
//       navigate(
//         generatePath(UI_ROUTES.patientSummary, {
//           ...params,
//           patientId: encrypt(String(rowData?.id)),
//         })
//       );
//     },
//     [navigate, params]
//   );

//   const handlePatientModalVisbility = useCallback(() => {
//     navigate(UI_ROUTES.addPatient);
//   }, []);


//   const deleteDialogBox = useCallback((data) => {
//     setPatientData(data);
//     setOpen((value) => !value);
//   }, []);

//   const deleteFaxContact = useCallback(() => {
//     if (patientData) {
//       const { id } = patientData;
//       callPatientDeleteAPI({ isDeleted: true }, `/${id}`);
//     }
//     setOpen((pre) => !pre);
//   }, [callPatientDeleteAPI, patientData]);

//   useEffect(() => {
//     if (!isEmpty(deleteResponse)) {
//       showSnackbar({
//         message: 'Delete successfully',
//         severity: 'success',
//       });
//       clearData();
//       handleOnFetchDataList();
//     }
//   }, [handleOnFetchDataList, deleteResponse, clearData]);

//   const dialogActions = useMemo(
//     () => [
//       {
//         title: 'Cancel',
//         action: () => setOpen((current) => !current),
//         actionStyle: { color: palette.common.black, padding: '8px' },
//         variant: 'secondary',
//       },
//       {
//         title: 'Confirm',
//         action: deleteFaxContact,
//         actionStyle: { color: palette.primary.main, padding: '8px' },
//         variant: 'secondary',
//       },
//     ],
//     [deleteFaxContact]
//   );

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

  const moreActions = [
    {
      label: 'Edit',
      icon: 'edit',
      action:handleEditPatient,
    },
    {
      label: 'View',
      icon: 'view',
      action:handleViewPatient,
    },
    {
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
    }
  ];
  
  return (
    <Container
      style={{ display: 'flex', flexDirection: 'column' }}
      loading={loading}
    >
      <Table
        // onRowClick={onRowClick}
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
      />
      <AlertDialog
        open={open}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      />
    </Container>
  );
};

export default PracticeList;
