import React, { useCallback, useEffect, useMemo, useState } from 'react';

import PageHeader from 'src/components/PageHeader';
import Table from 'src/components/Table';
import Container from 'src/components/Container';
import useQuery from 'src/hooks/useQuery';
import {
  DELETE_STAFF_LOCATION_DATA,
  STAFF_LOCATION_DATA,
} from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import palette from 'src/theme/palette';
import AddLocation from './addLocation';
import { useParams } from 'react-router-dom';
import { decrypt } from 'src/lib/encryption';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { getAddress, preferredSchedule } from 'src/lib/constants';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import { showSnackbar } from 'src/lib/utils';
import IsPrimarySwitch from './isPrimarySwitch';
import useAuthUser from 'src/hooks/useAuthUser';
import TableStaticDropDown from 'src/wiredComponent/StaticDropDown';

const Location = () => {
  const params = useParams();
  const [user, , ,] = useAuthUser();
  const practitionerId = user?.id;
  let { staffId } = params || {};
  if (staffId) {
    staffId = decrypt(staffId);
  } else {
    staffId = practitionerId;
  }
  const [isAddLocation, setIsAddLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [
    data,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    ,
    ,
    sort,
    handleSort,
    fetchLocations,
  ] = useQuery({
    listId: STAFF_LOCATION_DATA,
    url: API_URL.staffLocation,
    type: REQUEST_METHOD.get,
    queryParams: { staffId },
  });
  const [deleteResponse, , deleteStaffLoading, callStaffDeleteAPI, clearData] =
    useCRUD({
      id: DELETE_STAFF_LOCATION_DATA,
      url: API_URL.staffLocation,
      type: REQUEST_METHOD.update,
    });
  const columns = [
    {
      label: 'Location Name',
      type: 'text',
      dataKey: 'location.name',
      maxWidth: '7rem',
    },
    {
      label: 'Address',
      type: 'text',
      dataKey: 'address.description',
      maxWidth: '8rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ fontWeight: 600 }}>
          {getAddress(data?.location) || 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Preferred Schedule',
      dataKey: 'preferredScheduleCode',
      type: 'text',
      render: ({ data }) => (
        <>
          <TableStaticDropDown
            data={data.preferredScheduleCode || {}}
            id={data.id}
            api={`${API_URL.staffLocation}/${data.id}`}
            dataKey='preferredScheduleCode'
            array={preferredSchedule}
            eventId={STAFF_LOCATION_DATA}
          />
        </>
      ),
    },
    {
      label: 'Primary Location',
      type: 'boolean',
      dataKey: 'isPrimaryLocation',
      isEditable: false,
      render: ({ data }) => (
        <IsPrimarySwitch
          rowData={data}
          api={API_URL.setStaffPrimaryLocation}
          staffId={staffId}
          fetchLocations={fetchLocations}
        />
      ),
    },
  ];

  const deleteDialogBox = useCallback((data) => {
    setSelectedLocation(data);
    setDeleteModalOpen((value) => !value);
  }, []);

  const deleteLocation = useCallback(() => {
    if (selectedLocation) {
      const { id } = selectedLocation;
      callStaffDeleteAPI({ isDeleted: true }, `/${id}`);
      setSelectedLocation(null);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callStaffDeleteAPI, selectedLocation]);

  useEffect(() => {
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: 'Delete successfully',
        severity: 'success',
      });
      clearData();
      fetchLocations();
    }
  }, [fetchLocations, deleteResponse, clearData]);

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
        action: deleteLocation,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteLocation]
  );

  const moreActions = useMemo(
    () => [
      {
        label: 'Edit',
        icon: 'edit',
        action: (data) => {
          setSelectedLocation(data);
          setIsAddLocation(true);
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        action: deleteDialogBox,
      },
    ],
    []
  );

  const onCancelLocationUpdate = useCallback(() => {
    setIsAddLocation(false);
    setSelectedLocation(null);
  }, []);

  return (
    <Container
      loading={loading}
      style={{
        backgroundColor: palette.background.paper,
        padding: 16,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
    >
      {!isAddLocation ? (
        <>
          <PageHeader
            title="Manage Staff Hours & Locations"
            rightContent={[
              {
                type: 'fabButtonSave',
                style: { ml: 2 },
                onClick: () => setIsAddLocation(true),
              },
            ]}
          />

          <Table
            data={data?.results}
            totalCount={data?.totalResults}
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
        </>
      ) : (
        <AddLocation
          onCancel={onCancelLocationUpdate}
          selectedLocation={selectedLocation}
          fetchLocations={fetchLocations}
          staffId={staffId}
        />
      )}
    </Container>
  );
};

export default Location;
