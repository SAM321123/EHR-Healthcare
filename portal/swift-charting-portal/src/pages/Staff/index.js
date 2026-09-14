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
import { STAFF_COLUMNS } from 'src/lib/tableConstants';
import { patientFilterParser, roleFilterParser, showSnackbar } from 'src/lib/utils';
import { STAFF_DATA, STAFF_LIST } from 'src/store/types';
import palette from 'src/theme/palette';
import SwitchLabel from 'src/wiredComponent/Switch';
import TwoFaSwitchLabel from 'src/wiredComponent/TwoFaSwitch'
import AddStaff from './addStaff';
import ModalComponent from 'src/components/modal';
import { formFields } from './formFields';
import { roleTypes } from 'src/lib/constants';
import { responseModifierRoles } from 'src/api/helper';
import { Button } from '@mui/material';

const columns = [...STAFF_COLUMNS];

const StaffList = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffData, setStaffData] = useState();
  const [
    deleteResponse,
    ,
    deleteStaffLoading,
    callStaffDeleteAPI,
    clearData,
  ] = useCRUD({
    id: `${STAFF_DATA}-delete`,
    url: API_URL.staff,
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
    listId: STAFF_LIST,
    url: API_URL.staff,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,

  });
  
  const onSwitchToggle = useCallback(() => {}, [columns, response]);
  useMemo(() => {
    columns.forEach((item) => {
      const temp = item;
      console.log("🚀 ~ StaffList ~ temp:", temp)
      if (temp.dataKey === 'isActive') {
        temp.render = ({ data }) => (
          <SwitchLabel rowData={data} api={API_URL.staff} />
        );
        temp.handleChange = onSwitchToggle;
      }
      if (temp.dataKey === 'twoFaEnable') {
        temp.render = ({ data }) => (
          <TwoFaSwitchLabel rowData={data} api={API_URL.staff} />
        );
        temp.handleChange = onSwitchToggle;
      }
      return temp;
    });
  }, [columns]);
  const handleEditStaff = useCallback(
    (rowData) => {
      navigate(
        generatePath(UI_ROUTES.editStaff, {
          ...params,
          staffId: encrypt(String(rowData?.id)),
        })
      );
 
    },[]);
  const handleStaffModalVisibility = useCallback(() => {
    navigate(UI_ROUTES.addStaff);
  }, []);

  const deleteDialogBox = useCallback((data) => {
    setStaffData(data);
    setDeleteModalOpen((value) => !value);
  }, []);

  const deleteStaff = useCallback(() => {
    if (staffData) {
      const { id } = staffData;
      callStaffDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callStaffDeleteAPI, staffData]);

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
        action: deleteStaff,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteStaff]
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
    
      {
        type: 'wiredSelect',
        filterProps: {
          name: 'roleCodeFilter',
          url: API_URL.role,
          label: '',
          labelAccessor: 'name',
          // valueAccessor: 'code',
          placeholder: 'Filter by Role',
          size: 'small',
          style: { maxWidth: '220px' },
          cache: false,
          clearData: true,
          isAllOptionNeeded:true,
          defaultValue:"ALL",
          responseModifier: responseModifierRoles

        },
        name: 'role',
        parser: roleFilterParser,
      },
      {
        type: 'fabButton',
        style: { ml: 2, minWidth: '38px' },
        actionLabel:`ADD STAFF`,
        onClick: handleStaffModalVisibility,
      },
    ],
  }),[]);
  console.log('filters',filters);
  const moreActions = [
    {
      label: 'Edit',
      icon: 'edit',
      action:handleEditStaff,
    },
    {
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
    },
  ];

  console.log('response', response)
  return (
    <Container
      style={{ display: 'flex', flexDirection: 'column' }}
      loading={loading}
    >
      <Table
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
        actionButtons={moreActions}
        loading={loading}
        sort={sort}
        handleSort={handleSort}
        wrapperStyle={{
          backgroundColor: palette.common.white,
          boxShadow: 'none',
          border: `1px solid ${palette.grey[200]}`,
          borderRadius: '0 5px 5px',
        }}
      />
      <AlertDialog
        open={deleteModalOpen}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      />
    </Container>
  );
};

export default StaffList;
