/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterComponents from 'src/components/FilterComponents';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import { isEmpty } from 'lodash';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { getFullName, showSnackbar } from 'src/lib/utils';
import useQuery from 'src/hooks/useQuery';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import useAuthUser from 'src/hooks/useAuthUser';
import { LABS_RADIOLOGY_LIST, SEND_TO_LAB } from 'src/store/types';
import { dateFormats, successMessage } from 'src/lib/constants';
import TableTextRender from 'src/components/TableTextRendrer';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { RemoveRedEyeOutlined } from '@mui/icons-material';
import { encrypt } from 'src/lib/encryption';

const LabRadiologyList = ({handleLabRadiologyView = () => {}}) => {
  const navigate = useNavigate();
  const [user] = useAuthUser();
  const patientId = user?.id;
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
    listId: `${LABS_RADIOLOGY_LIST}-${patientId}`,
    url: API_URL.labsRadiology,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });

  const [hl7Response, , loadingSendToLab, callSendToLab, clearHl7Data] = useCRUD({
    id: SEND_TO_LAB,
    url: API_URL.hl7,
    type: REQUEST_METHOD.post,
  });

  useEffect(() => {
    if(!isEmpty(response?.results)){
      handleLabRadiologyView(true)
    } else{
      if(response){
        handleLabRadiologyView(false)
      }
    }
  }, [response])
  const LAB_RADIOLOGY_COLUMNS = [
    {
      label: 'Order Id',
      type: 'text',
      dataKey: 'id',
      maxWidth: '6rem',
      sort: true,
    },
    {
      label: 'Patient',
      type: 'text',
      dataKey: 'patientId',
      sort: true,
      render:({data})=><TableTextRender style={{maxWidth:'8rem'}}>{getFullName(data.patient || {})}</TableTextRender>
    },
  
    {
      label: 'Prescriber',
      type: 'text',
      dataKey: 'providerId',
      sort: true,
      maxWidth: '10rem',
      render:({data})=><TableTextRender style={{maxWidth:'8rem'}}>{getFullName(data.provider || {})}</TableTextRender>
  
    },
    {
      label: 'Order Date',
      type: 'date',
      dataKey: 'createdAt',
      maxWidth: '10rem',
      sort: true,
      format: dateFormats.MMMDDYYYYHHMMSS,
    },
    {
      label: 'Lab Test',
      type: 'text',
      dataKey: 'lab',
      maxWidth: '5rem',
      render:({data})=><TableTextRender style={{maxWidth:'12rem'}}>{data?.laboratoryTests?.map(item=>`${item.name} ( CPT: ${item.cptCode} LOINC: ${item.loincCode}) - ${item?.description}`)?.join(',')}</TableTextRender>
  
    },
    {
      label: 'Lab Request/Report',
      dataKey: 'labReport',
      render: ({data}) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          {data?.hl7Message && (
            <LoadingButton 
              size="small" 
              style={{padding: '4px', marginTop: 0, height: 'auto', fontSize: 'smaller', backgroundColor: 'red'}} 
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <p style={{ margin: 0 }}>HL7 Observation</p>
                  <RemoveRedEyeOutlined style={{ height: '20px' }} />
                </div>
              }
              loading={loading}
              icon="view"
              onClick={() => handleViewHl7Data(data)} 
            />  
          )}
          {data?.isLabResult && 
            <LoadingButton 
              size="small" 
              style={{padding: '4px', marginTop: 0, height: 'auto', fontSize: 'smaller', backgroundColor: 'green'}} 
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <p style={{ margin: 0 }}>Lab Report</p>
                  <RemoveRedEyeOutlined style={{ height: '20px' }} />
                </div>
              }
              loading={loading}
              onClick={() => handleViewResult(data)} 
            />}

        </div>
      )
    }
  ];


  const handleViewHl7Data = (data) => {
    const labRadiologyId = data?.id;
    console.log('lab id' , labRadiologyId);
    navigate(
      generatePath(UI_ROUTES.patientLabRadiologyRequestData, {
        labRadiologyId: encrypt(String(labRadiologyId)),
      })
    );
  }

  const handleViewResult = (data) => {
    const labRadiologyId = data?.id;
    navigate(
      generatePath(UI_ROUTES.patientLabRadiologyResultData, {
        labRadiologyId: encrypt(String(labRadiologyId)),
      })
    );
  }

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

  useEffect(() => {
    if (!isEmpty(hl7Response)) {
      showSnackbar({
        message: successMessage.sent,
        severity: 'success',
      });
      clearHl7Data();
      handleOnFetchDataList();
    }
  }, [hl7Response, clearHl7Data, handleOnFetchDataList]);


  const columns = useMemo(() => [...LAB_RADIOLOGY_COLUMNS]);

  return (
    <>
      <Container
        loading={loadingSendToLab || loading }
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
          data={response?.results}
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
        />
      </Container>
    </>
  );
};

export default LabRadiologyList;
