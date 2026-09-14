/* eslint-disable no-unused-vars */
import isEmpty from 'lodash/isEmpty';
import { useCallback, useMemo, } from 'react';
import {  useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useQuery from 'src/hooks/useQuery';
import { EPRESCREBE_MEDICATION_LIST } from 'src/store/types';

import { decrypt } from 'src/lib/encryption';
import TableTextRendrer from 'src/components/TableTextRendrer';
import {  statusFilterParser } from 'src/lib/utils';


const eRxPrescriptionColumns = [
  {
    label: 'Id',
    maxWidth: '6rem',
    dataKey: 'prescribingID',
    type: 'text',
    render: ({ data }) => {
      if (!data?.prescribingID) return <TableTextRendrer>-</TableTextRendrer>;
      return (
        <TableTextRendrer>
          {data?.prescribingID}
        </TableTextRendrer>
      );
    }
  },
  {
    label: `Prescriber's NPI`,
    maxWidth: '6rem',
    dataKey: 'providerNpi',
    type: 'text',
    render: ({ data }) => {
      if (!data?.providerNpi) return <TableTextRendrer>-</TableTextRendrer>;
      return (
        <TableTextRendrer>
          {data?.providerNpi}
        </TableTextRendrer>
      );
    }
  },
  {
    label: 'Created On',
    type: 'text',
    dataKey: 'createdOn',
  },
  {
    label: 'Drug Name',
    type: 'text',
    dataKey: 'drugName',
  },
  {
    label:'Instruction',
    type: 'text',
    dataKey: 'dosageInstruction',
  },
  {
    label: 'Days',
    type: 'text',
    dataKey: 'days',
    render: ({ data }) => {
      if (!data?.days) return <TableTextRendrer>-</TableTextRendrer>;
      return (
        <TableTextRendrer>
          {data?.days}
        </TableTextRendrer>
      );
    }
  },
  {
    label: 'Quantity',
    type: 'text',
    dataKey: 'quantity',
    render: ({ data }) => {
      if (!data?.quantity) return <TableTextRendrer>-</TableTextRendrer>;
      return (
        <TableTextRendrer>
          {data?.quantity}
        </TableTextRendrer>
      );
    }
  },
  {
    label: 'Dosage Form',
    type: 'text',
    dataKey: 'dosageForm',
    render: ({ data }) => {
      if (!data?.dosageForm) return <TableTextRendrer>-</TableTextRendrer>;
      return (
        <TableTextRendrer>
          {data?.dosageForm}
        </TableTextRendrer>
      );
    }
  },
  {
    label: 'Unit',
    type: 'text',
    dataKey: 'unit',
    render: ({ data }) => {
      if (!data?.unit) return <TableTextRendrer>-</TableTextRendrer>;
      return (
        <TableTextRendrer>
          {data?.unit}
        </TableTextRendrer>
      );
    }
  },
  {
    label:'Refill',
    type: 'text',
    dataKey: 'refill',
    render: ({ data }) => {
      if (!data?.refill) return <TableTextRendrer>-</TableTextRendrer>;
      return (
        <TableTextRendrer>
          {data?.refill}
        </TableTextRendrer>
      );
    }
  },
  {
    label:'Mark Complete Status',
    type: 'text',
    dataKey: 'markCompleteStatus',
    render: ({ data }) => {
      if (!data?.markCompleteStatus) return <TableTextRendrer>-</TableTextRendrer>;
    
      const [markCompleteStatus, additionalInfo] = data.markCompleteStatus.split(';');
      return (
        <TableTextRendrer>
          {`${markCompleteStatus}${additionalInfo ? ` (${additionalInfo.trim()})` : ''}`}
        </TableTextRendrer>
      );
    }
    
  },
  {
    label:'Status',
    type: 'text',
    dataKey: 'status',
  },
];
const ERxPrescriptionList = ({applyContainer=true}) => {
  const params = useParams();

  let { patientId } = params || {};
  patientId =decrypt(patientId);

 
 

  const sendToMdToolbox = useCallback(() => {
    const url = 'https://test2.mdtoolboxrx.net/rxtest/ui/login.aspx';      // Redirect to the MD Toolbox URL
      window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

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
    listId: `${EPRESCREBE_MEDICATION_LIST}-${patientId}`,
    url: `${API_URL.mdToolboxSync}/${patientId}/e-prescription`,
    type: REQUEST_METHOD.get,
  });


  
  


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
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'statusCodeFilter',
              url: `${API_URL.getMasters}/erx_status`,
              label: '',
              labelAccessor: 'name',
              // valueAccessor: 'code',
              placeholder: 'Filter by Status',
              size: 'small',
              style: { maxWidth: '220px' },
              cache: false,
              clearData: true,
              isAllOptionNeeded:true,
              defaultValue:"ALL",    
            },
            name: 'status',
            parser: statusFilterParser,
          },
          {
            type: 'fabButton',
            style: { ml: 1, minWidth: '38px' },
            actionLabel: 'E-Rx',
            onClick: sendToMdToolbox,
          },
        ],

      }),
    []
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
              <FilterCollectionHeader    onFilterChange={handleFilters}
                filters={filters} />
            </div>
          }
          data={response || []}
          totalCount={response?.totalResults}
          columns={eRxPrescriptionColumns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
          timezone
        />
    </Container>
    </>
  );
};

export default ERxPrescriptionList;