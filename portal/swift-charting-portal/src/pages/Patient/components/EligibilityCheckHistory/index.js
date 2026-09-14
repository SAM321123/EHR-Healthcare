/* eslint-disable no-unused-vars */
import { join } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import PatientInfo from '../patientInfo';
import { decrypt } from 'src/lib/encryption';
import Modal from 'src/components/modal';
import ViewInvoice from '../Invoice/ViewInvoice';
import CheckEligibilityData from '../CheckEligibility/checkEligibilityData';
import ViewHistoryResultData from './historyResult';

const eligibilityCheckHistoryColumns = [
  {
    label: 'Payer',
    type: 'text',
    dataKey: 'insurance.eligibilityCheckPayerData.payerName',
    maxWidth: '6rem',
    render: ({ data }) => (
      <TableTextRendrer>
        {data?.insurance?.eligibilityCheckPayerData?.payerName?.length > 15 
          ? `${data.insurance.eligibilityCheckPayerData.payerName.slice(0, 15)}...` 
          : data?.insurance?.eligibilityCheckPayerData?.payerName} 
        ({data?.insurance?.eligibilityCheckPayerData?.payerId})
      </TableTextRendrer>)},
  {
    label: 'Provider Name',
    type: 'text',
    dataKey: 'provider.lastName',
    maxWidth: '4rem',
    render:({data})=><TableTextRendrer>{data?.provider?.lastName} {data?.provider?.firstName}</TableTextRendrer>

  },
  {
    label: 'Transaction Date',
    dataKey: 'createdAt',
    type: 'date',
    sort: true,
    format: dateFormats.MMMDDYYYYHHMMSS,
  },
  {
    label: 'EDI 270 Request',
    type: 'text',
    dataKey: 'ediRequest',
    maxWidth: '10rem',
    sort: false,
  },
  {
    label: 'EDI 271 Response',
    type: 'text',
    dataKey: 'ediResponse',
    maxWidth: '10rem',
    sort: false,
  }, {
    label: 'Status',
    type: 'text',
    dataKey: 'statusCode',
    maxWidth: '10rem',
    sort: false,
  },
];


const EligibilityCheckHistory = ({showPatientInfo= true,applyContainer=true}={}) => {
  const params = useParams();
  const [selectedResult, setSelectedResult] = useState(null);

  let { patientId } = params || {};
  patientId =decrypt(patientId);
  const [isViewResultModalVisible, setIsViewResultModalVisible] =  useState(false);

 

    const viewToggleModal = useCallback(() => {
  
      setIsViewResultModalVisible(!isViewResultModalVisible);
    }, [isViewResultModalVisible]);

    const handleViewResult = useCallback(
      (rowData) => {
       setSelectedResult(rowData);
       viewToggleModal();
      }, [viewToggleModal]);

  const moreActions = useCallback(
    (rowData) => {
      const actions = [];
        actions.push({
          label: 'View',
          icon: 'view',
          action: handleViewResult,
        });
  
      return actions;
    },
    [handleViewResult]
  );
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
      }),
    []
  );

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
    listId: `paitnet-eligibility-check-${patientId}`,
    url: `${API_URL.eligibilityCheckHistory}/${patientId}`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });


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
              {showPatientInfo && (
                <PatientInfo wrapperStyle={{ marginBottom: 39 }} />
              )}
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            </div>
          }
          data={response?.results}
          totalCount={response?.totalResults}
          columns={eligibilityCheckHistoryColumns}
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
        {isViewResultModalVisible && (
        <Modal
          open={isViewResultModalVisible}
          onClose={viewToggleModal}
          header={{
            title: 'View Result',
          }}
          isNotScrollable
        >
         <ViewHistoryResultData
            modalCloseAction={viewToggleModal}
            defaultData={selectedResult?.ediResponse} 
            fromMain={true}
          />
        </Modal>
      )}
      </Container>
    </>
  );
};

export default EligibilityCheckHistory;