import React, { useCallback, useMemo, useState } from 'react';

import PageHeader from 'src/components/PageHeader';
import Table from 'src/components/Table';
import Container from 'src/components/Container';
import useQuery from 'src/hooks/useQuery';
import SwitchLabel from 'src/wiredComponent/Switch';
import { PRACTICE_LOCATION_DATA } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import palette from 'src/theme/palette';
import AddLocation from './addLocation';

const columns = [
  {
    label: 'Location Name',
    type: 'text',
    dataKey: 'name',
    maxWidth: '7rem',
  },
  {
    label: 'Address',
    type: 'text',
    dataKey: 'address.description',
    maxWidth: '8rem',
  },
  {
    label: 'Status',
    type: 'boolean',
    dataKey: 'isActive',
    isEditable: false,
    render: ({ data }) => (
      <SwitchLabel rowData={data} api={API_URL.practiceLocation} />
    ),
  },
];

const Location = () => {
  const [isAddLocation, setIsAddLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const moreActions = useMemo(
    () => [
      {
        label: 'Edit',
        icon: 'edit',
        action: (data) => {
          setSelectedLocation(data.id);
          setIsAddLocation(true);
        },
      },
    ],
    []
  );

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
    listId: PRACTICE_LOCATION_DATA,
    url: API_URL.practiceLocation,
    type: REQUEST_METHOD.get,
  });

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
            title="Manage Your Hours & Locations"
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
        </>
      ) : (
        <AddLocation
          onCancel={onCancelLocationUpdate}
          selectedLocation={selectedLocation}
          fetchLocations={fetchLocations}
        />
      )}
    </Container>
  );
};

export default Location;
