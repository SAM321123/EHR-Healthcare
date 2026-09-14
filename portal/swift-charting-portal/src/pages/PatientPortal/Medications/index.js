/* eslint-disable no-unused-vars */
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { API_URL, BASE_URL, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useAuthUser from 'src/hooks/useAuthUser';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { dateFormats, faxType } from 'src/lib/constants';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { downloadPdf, getFullName, showSnackbar, triggerEvents } from 'src/lib/utils';
import { MEDICATION_DATA, MEDICATION_LIST } from 'src/store/types';
import { encrypt } from 'src/lib/encryption';


const medicationColumns = [
  {
    label: 'Medication',
    maxWidth: '6rem',
    type: 'text',
    render: ({ data }) => {
      const title = data?.items
        ?.map((item) => `${item?.genericDrug} (${item?.brandNameDrug})`)
        .join(', ');
      return (
        <TableTextRendrer
          title={title}
          style={{maxWidth:'20rem'}}
        >
          {title}
        </TableTextRendrer>
      );
    },
  },
  {
    label: 'Prescriber',
    type: 'number',
    render: ({data}) => <TableTextRendrer style={{maxWidth:'15rem'}}>{getFullName(data?.prescriber)}</TableTextRendrer>
  },
  {
    label: 'Created on',
    type: 'date',
    dataKey: 'createdAt',
    format: dateFormats.MMMDDYYYYHHMMSS,
    sort: true,
    maxWidth: '6rem',
  },
];
const MedicationList = ({applyContainer=true, handleMedicationView = ()=> {}}={}) => {
  
    const [user] = useAuthUser();
    const patientId = user?.id;
    const navigate = useNavigate();

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
    listId: `${MEDICATION_LIST}-${patientId}`,
    url: API_URL.medication,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });
  

  useEffect(() => {
    if(!isEmpty(response?.results)){
      handleMedicationView(true);
    } else{
      if(response){
        handleMedicationView(false);
      }
    }
  }, [response])

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

  const handleViewMedication = useCallback(
    (rowData)=> {
      navigate(
        generatePath(UI_ROUTES.patientViewMedication, {
          // ...params,
          medicationId: encrypt(String(rowData?.id)),
        })
      );
    }
  )

  const moreActions = [
    {
      label: 'View',
      icon: 'view',
      action:handleViewMedication,
    },
    {
      label: 'Download',
      icon: 'download',
      action: (row) => {
        if (row?.id)
          downloadPdf(
            `/${API_URL.downloadPatientMedicationPDF}/${row?.id}`
          );
      },
    },
  ]
    
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
              <FilterCollectionHeader    
                onFilterChange={handleFilters}
                filters={filters} />
            </div>
          }
          data={response?.results || []}
          totalCount={response?.totalResults}
          columns={medicationColumns}
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
      </Container>
    </>
  );
};

export default MedicationList;