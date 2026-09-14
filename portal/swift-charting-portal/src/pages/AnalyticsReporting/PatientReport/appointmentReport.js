import React, { useMemo } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { getFullName, staffNameFilterParser } from 'src/lib/utils';

const AppointmentReport = () => {

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
        listId: `patient-appointment-report`,
        url: `${API_URL.analyticsAndReporting}/get-appointment-report`,
        type: REQUEST_METHOD.get,
        subscribeSocket: true,
      });

    const data = response?.results;
    const columns = [
        {
            label: `Provider`,
            type: 'text',
            dataKey: 'id',
            sort: true,
            render: ({ data }) => (
                <>
                  <TableTextRendrer>
                    {getFullName(data)}
                  </TableTextRendrer>
                </>
            ),
        },
        {
            label: `No. of Appointments`,
            type: 'text',
            dataKey: 'id',
            sort: true,
            render: ({ data }) => ( 
                <TableTextRendrer>
                    {data?.staffAppointments?.length}
                </TableTextRendrer>
            )
        },
        {
            label: `No. of time patient wait`,
            type: 'text',
            dataKey: 'id',
            sort: true,
        },
        {
            label: `No Show Rate`,
            type: 'text',
            dataKey: 'id',
            sort: true,
            render: ({ data }) => {
              let noShowRate = 0;
              data?.staffAppointments?.map((appointment) =>{
                  if(appointment?.statusCode === 'appointment_missed'){
                      noShowRate = noShowRate + 1
                  }
              })
              return (
                  <TableTextRendrer>
                      {noShowRate}
                  </TableTextRendrer>
              )
            }
        },
    ]

    // const handleFilterChange = () => {
    //     console.log('handle filter chnage ')
    // }

      const FilterCollectionHeader = useMemo(
        () =>
          FilterComponents({
            rightComponents: [
                // {
                //     type: 'autocomplete',
                //     filterProps: {
                //         name: 'globalCategoryTypeCode',
                //         url: API_URL.globalTypeCategory,
                //         label: '',
                //         placeholder: 'Filter by Month',
                //         size: 'small',
                //         style: { maxWidth: '220px' },
                //         fetchInitial: true,
                //         filter: { isActive: true },
                //     },
                //     name: 'globalCategoryTypeCode',
                //     // parser: globalCategoryFilterParser,
                // },
                // {
                //     type: 'autocomplete',
                //     filterProps: {
                //         name: 'globalCategoryTypeCode',
                //         url: API_URL.globalTypeCategory,
                //         label: '',
                //         placeholder: 'Filter by Year',
                //         size: 'small',
                //         style: { maxWidth: '220px' },
                //         fetchInitial: true,
                //         filter: { isActive: true },
                //     },
                //     name: 'globalCategoryTypeCode',
                //     // parser: globalCategoryFilterParser,
                // },
                {
                    type: 'autocomplete',
                    filterProps: {
                      name: 'id',
                      url: API_URL.staff,
                      label: '',
                      labelAccessor:['title.name','firstName','middleName', 'lastName'],
                      placeholder: 'Filter by Provider',
                      size: 'small',
                      style: { maxWidth: '220px' },
                      fetchInitial: true,
                      filter: { isActive: true },
                    },
                    name: 'id',
                    parser: staffNameFilterParser,
                },
            ],
          }),
        []
      );
    
    return (
        <>
            <h4>Appointment Scheduling And Wait Times Report</h4>
            <Table
              headerComponent={
                <div>
                  <FilterCollectionHeader
                    onFilterChange={handleFilters}
                    filters={filters} 
                  />
                </div>
              }
              data={data}
              // totalCount={response?.totalResults}
              columns={columns}
              pagination
              // rowsPerPage={rowsPerPage}
              // page={page}
              // handlePageChange={handlePageChange}
              // loading={loading}
              // sort={sort}
              // handleSort={handleSort}
              wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
              timezone
            />
        </>
    )
}

export default AppointmentReport;