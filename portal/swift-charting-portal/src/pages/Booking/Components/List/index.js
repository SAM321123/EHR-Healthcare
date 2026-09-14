/* eslint-disable no-param-reassign */
import React from 'react';
import Divider from '@mui/material/Divider';

import Table from 'src/components/Table';

import useQuery from 'src/hooks/useQuery';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import useCRUD from 'src/hooks/useCRUD';
import { responseModifierAppointments } from 'src/api/helper';
import FilterForm from './filterForm';
import columns from './columns';

const AppointmentList = () => {
  const [
    appointmentList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filtersData,
    handleFilters,
    sort,
    handleSort,
  ] = useQuery({
    listId: 'APPOINTMENT_LIST_DATA',
    url: API_URL.appointment,
    type: REQUEST_METHOD.get,
    queryParams: { listView: true },
    responseModifier: responseModifierAppointments,
    subscribeSocket:true,
  });
  const FilterLoading = useCRUD({
    id: 'APPOINTMENT_LIST_DATA',
    url: API_URL.appointment,
    type: REQUEST_METHOD.get,
  })[2];

  return (
    <>
      <FilterForm filtersData={filtersData} onFiltersChange={handleFilters} />
      <Divider sx={{ margin: '24px 0px' }} />
      <Table
        loading={loading || FilterLoading}
        data={appointmentList?.results || appointmentList}
        totalCount={appointmentList?.totalResults || appointmentList}
        columns={columns}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        sort={sort}
        handleSort={handleSort}
        wrapperStyle={{ overflow: 'auto' }}
        timezone
      />
    </>
  );
};

export default AppointmentList;
