/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterComponents from 'src/components/FilterComponents';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import {
  claimStatusFilterParser,
  getFullName,
  practitionerFilterParser,
} from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { dateFormats } from 'src/lib/constants';

import TableTextRendrer from 'src/components/TableTextRendrer';
import { GET_PATIENT_ENCOUNTER_CLAIM } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import useQuery from 'src/hooks/useQuery';
import ModalComponent from 'src/components/modal';
import ViewClaim from './viewClaim';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import ResubmitClaim from './resubmitClaim';

import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';
import CheckClaimStatusData from './checkClaimStatus';

const Claims = () => {
  const [viewModal, setViewModal] = useState(false);
  const [checkStatusModal, setCheckStatusModal] = useState(false);
  const [viewClaimData, setViewClaimData] = useState(null);
  const [encounterBillingData, setEncounterBillingData] = useState(null);
  const [reSubmitClaimModal, setReSubmitClaimModal] = useState(false);
  
  const [checkStatusData, setCheckStatusData] = useState(null);

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
    listId: `${GET_PATIENT_ENCOUNTER_CLAIM}`,
    url: `${API_URL.claims}`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search patient',
            },
            name: 'searchText',
          },
        ],
        rightComponents: [
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'claimStatusFilter',
              url: `${API_URL.getMasters}/general_claim_status`,
              label: 'Claim Status',
              labelAccessor: ['name'],
              params: { isActive: true, limit: 300 },
              valueAccessor: 'code',
              placeholder: 'Filter by Claim Status',
              size: 'small',
              style: { maxWidth: '220px' },
              cache: false,
              clearData: true,
              isAllOptionNeeded: true,
              defaultValue: 'ALL',
            },
            name: 'claimStatus',
            parser: claimStatusFilterParser,
          },
        ],
      }),
    []
  );

  const moreActions = useCallback((rowData) => {
    const actions = [
      {
        label: 'Check Claim Status',
        icon: 'send',
        action: checkClaimStatus,
      },{
        label: 'View',
        icon: 'view',
        action: handleView,
      },
    ];
    return actions;
  }, []);

  const handleView = (rowData) => {
    setViewClaimData(rowData);
    setViewModal(true);
  };
  const handleReSumbitClaim = useCallback((rowData) => {
    setEncounterBillingData(rowData);
    setReSubmitClaimModal(true);
  }, []);
  const checkClaimStatus = (rowData) => {
    setCheckStatusData(rowData)
    setCheckStatusModal(true);
  }
  const handleCloseViewModal = () => {
    setViewClaimData(null);
    setViewModal(false);
  };
  const handleReSumbitClaimModal = () => {
    setEncounterBillingData(null);
    setReSubmitClaimModal(false);
  };
  const handleCloseCheckStatusModal = useCallback(() => {
    setCheckStatusData(null);
    setCheckStatusModal(false);
  }, []);
  const columns = [
    {
      label: 'Patient',
      type: 'text',
      dataKey: 'patientId',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {getFullName(data.patient || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Claim Id',
      type: 'text',
      dataKey: 'claimId',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.claimId || 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Encounter Id',
      type: 'text',
      dataKey: 'encounterId',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.encounterId ? `EN${data?.encounterId}`: 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'File Id',
      type: 'text',
      dataKey: 'fileId',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.fileId || 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Transaction Date',
      type: 'date',
      dataKey: 'createdAt',
      maxWidth: '10rem',
      sort: true,
      format: dateFormats.MMMDDYYYYHHMMSS,
    },
    {
      label: 'Claim Status',
      type: 'text',
      dataKey: 'claimStatus',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer
          style={{ maxWidth: '8rem', color: `${data?.status?.colorCode}` }}
        >
          {data?.status?.name || 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Re-Submit Claim',
      type: 'text',
      dataKey: 'claimStatus',
      maxWidth: '10rem',
      render: ({ data }) => {
        return (
          <LoadingButton
            disabled={
              data?.claimStatus === 'claim_status_pending' ||
              data?.claimStatus === 'claim_status_accepted'
            }
            onClick={() => handleReSumbitClaim(data)}
            label={'Re-Submit'}
            sx={{ height: 30 }}
          />
        );
      },
    },
    {
      label: 'Acknowledgement Status',
      type: 'text',
      dataKey: 'acknowledgmentStatus',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.acknowledgmentStatus || 'N/A'}
        </TableTextRendrer>
      ),
    },
  ];

  return (
    <>
      <Container
        loading={loading}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Table
          headerComponent={
            <div>
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            </div>
          }
          data={response?.results || []}
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
          actionButtons={(rowData) => moreActions(rowData)}
        />
        {viewModal && (
          <ModalComponent
            open
            header={{
              title: `View Claim Details`,
              closeIconAction: handleCloseViewModal,
            }}
            modalStyle={{ width: '100%' }}
          >
            <ViewClaim viewClaimData={viewClaimData} />
          </ModalComponent>
        )}

       {checkStatusModal && (
          <ModalComponent
            open
            header={{
              title: `Check Claim Status`,
              closeIconAction: handleCloseCheckStatusModal,
            }}
            // modalStyle={{ width: '80%' }}
          >
           <CheckClaimStatusData
            checkModalCloseAction={handleCloseCheckStatusModal}
            refetchData={handleOnFetchDataList}
            // patientId={patientId}
            defaultData={checkStatusData} 
            fromMain={true}
          />          </ModalComponent>
        )}

{reSubmitClaimModal && (
          <ModalComponent
            open
            header={{
              title: `Re Submit Claim`,
              closeIconAction: handleReSumbitClaimModal,
            }}
            modalStyle={{ width: '100%' }}
          >
          <ResubmitClaim onClose={handleReSumbitClaimModal} encounterType={encounterBillingData?.encounterBilling?.billingType} patientId={encounterBillingData?.patientId} encounterId={encounterBillingData?.encounterId}patientEncounterBillingData={encounterBillingData?.encounterBilling} refetchData={handleOnFetchDataList} />
          </ModalComponent>
)}
      </Container>
    </>
  );
};

export default Claims;
