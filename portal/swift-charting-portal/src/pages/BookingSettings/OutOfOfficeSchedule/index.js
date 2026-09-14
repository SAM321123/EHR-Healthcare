import React, { useCallback, useEffect, useMemo, useState } from 'react';

import PageHeader from 'src/components/PageHeader';
import Table from 'src/components/Table';
import Container from 'src/components/Container';
import useQuery from 'src/hooks/useQuery';
import {
  DELETE_OOO_SCHEDULE_DATA,
  STAFF_OOO_SCHEDULE_DATA,
} from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import palette from 'src/theme/palette';
import { useParams } from 'react-router-dom';
import { decrypt } from 'src/lib/encryption';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { dateFormats, getAddress, preferredSchedule } from 'src/lib/constants';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import { showSnackbar } from 'src/lib/utils';
import useAuthUser from 'src/hooks/useAuthUser';
import TableStaticDropDown from 'src/wiredComponent/StaticDropDown';
import AddSchedule from './addSchedule';

const OutOfOfficeSchedule = () => {
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
    fetchData,
  ] = useQuery({
    listId: STAFF_OOO_SCHEDULE_DATA,
    url: API_URL.oofSchedule,
    type: REQUEST_METHOD.get,
    queryParams: { staffId },
  });
  const [deleteResponse, , deleteStaffLoading, callOooScheduleDeleteAPI, clearData] =
    useCRUD({
      id: DELETE_OOO_SCHEDULE_DATA,
      url: API_URL.oofSchedule,
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
      label: 'Start Date',
      type: 'date',
      dataKey: 'startDateTime',
      format: dateFormats.MMDDYYYYhhmmA,
      maxWidth: '7rem',
    }, {
      label: 'End Date',
      type: 'date',
      dataKey: 'endDateTime',
      format: dateFormats.MMDDYYYYhhmmA,
      maxWidth: '7rem',
    },
  ];

  const deleteDialogBox = useCallback((data) => {
    setSelectedLocation(data);
    setDeleteModalOpen((value) => !value);
  }, []);

  const deleteOooSchedule = useCallback(() => {
    if (selectedLocation) {
      const { id } = selectedLocation;
      callOooScheduleDeleteAPI({ isDeleted: true }, `/${id}`);
      setSelectedLocation(null);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callOooScheduleDeleteAPI, selectedLocation]);

  useEffect(() => {
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: 'Delete successfully',
        severity: 'success',
      });
      clearData();
      fetchData();
    }
  }, [fetchData, deleteResponse, clearData]);

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
        action: deleteOooSchedule,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteOooSchedule]
  );

  const moreActions = useMemo(
    () => [
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
            title="Out Of Office Schedule"
            rightContent={[
              {
                type: 'fabButtonSave',
                actionLabel: 'Add Schedule',
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
            timezone
          />
          <AlertDialog
            open={deleteModalOpen}
            content="Are you sure you want to delete?"
            actions={dialogActions}
          />
        </>
      ) : (
        <AddSchedule
          onCancel={onCancelLocationUpdate}
          selectedLocation={selectedLocation}
          fetchData={fetchData}
          staffId={staffId}
        />
      )}
    </Container>
  );
};

export default OutOfOfficeSchedule;
