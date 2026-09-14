import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Route,
  Routes,
  generatePath,
  useNavigate,
  useParams,
} from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import isEmpty from 'lodash/isEmpty';

import usePatientDetail from 'src/hooks/usePatientDetail';
import useCRUD from 'src/hooks/useCRUD';

import { UI_ROUTES } from 'src/lib/routeConstants';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import PageContent from 'src/components/PageContent';
import useQuery from 'src/hooks/useQuery';
import Table from 'src/components/Table';
import { dateFormats, roleTypes, successMessage } from 'src/lib/constants';
import { getUserRole, patientFilterParser, showSnackbar } from 'src/lib/utils';
import CustomButton from 'src/components/CustomButton';
import FilterComponents from 'src/components/FilterComponents';
import EPrescriptionForm from './EPrescriptionForm';

const EPrescriptionList = () => {
  const params = useParams();
  const [patientData] = usePatientDetail({ patientId: params?.id });
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();
  const userRole = getUserRole();

  const queryParams = isEmpty(patientData)
    ? {
        isApproved: false,
      }
    : {
        patient: patientData?.id,
      };

  const [
    patientPharmacyOrderList,
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
    listId: isEmpty(patientData)
      ? 'PATIENT_PRESCRIPTION_MED_LIST_DATA_CLINIC_LIST'
      : `PATIENT_PRESCRIPTION_MED_LIST_DATA-${patientData?.id}`,
    url: API_URL.patientPrescription,
    type: REQUEST_METHOD.get,
    queryParams: {
      ...queryParams,
    },
  });

  const [response, , , callAPI, clearData] = useCRUD({
    id: `PATIENT_PRESCRIPTION_MED_LIST_DATA_IS_APPROVE`,
    url: API_URL.patientPrescription,
    type: REQUEST_METHOD.update,
  });

  const handlePrescriptionButton = useCallback(
    (data) => {
      if (data?.patient) {
        if (!isEmpty(patientData)) {
          navigate(
            generatePath(UI_ROUTES.patientPrescriptionForm, {
              ...params,
              patientPrescriptionId: data?.id,
              subTabName: 'edit',
            })
          );
        } else {
          navigate(
            generatePath(UI_ROUTES.patientPrescriptionForm, {
              ...params,
              id: data?.patient?.id,
              tabName: 'Med-Instructions',
              patientPrescriptionId: data?.id,
              subTabName: 'edit',
            })
          );
        }
      } else {
        navigate(
          generatePath(UI_ROUTES.createPatientPrescriptionForm, {
            ...params,
            subTabName: 'create',
          })
        );
      }
    },
    [navigate, params, patientData]
  );

  const FilterCollectionHeader = FilterComponents({
    leftComponents: [
      {
        type: 'text',
        label: 'Med-Instructions',
        style: {
          fontSize: '20px',
        },
      },
    ],
    rightComponents: [
      !isEmpty(patientData)
        ? {
            type: 'fabButton',
            style: { ml: 2, minWidth: '38px' },
            onClick: handlePrescriptionButton,
          }
        : {
            type: 'autocomplete',
            filterProps: {
              name: 'medInstructionPatientFilter',
              url: API_URL.getPatients,
              label: '',
              placeholder: 'Filter by Patient',
              size: 'small',
              style: { maxWidth: '220px' },
              labelAccessor: 'name',
            },
            name: 'patient',
            parser: patientFilterParser,
          },
    ],
  });

  const handleApproveButton = useCallback(
    (data) => {
      if (!data?.isApproved) {
        callAPI({ isApproved: true }, `/${data?.id}`);
      }
    },
    [callAPI]
  );

  const columns = useMemo(
    () => [
      {
        label: 'Medication',
        maxWidth: '6rem',
        type: 'text',
        render: ({ data }) => {
          const title = data?.items
            ?.map((item) => item?.medicine?.name)
            .join(', ');
          return (
            <Tooltip
              onClick={() => handlePrescriptionButton(data)}
              title={title}
            >
              {title}
            </Tooltip>
          );
        },
      },
      {
        label: 'Created on',
        type: 'date',
        dataKey: 'createdAt',
        format: dateFormats.MMMDDYYYYHHMMSS,
        sort: true,
        maxWidth: '6rem',
      },
      {
        render: ({ data }) =>
          !data?.isApproved && userRole === roleTypes.practitioner ? (
            <CustomButton
              className="page_header_button"
              variant="outlined"
              label="Approve"
              onClick={() => {
                handleApproveButton(data);
              }}
              style={{
                borderRadius: '10px',
                fontSize: '12px',
              }}
            />
          ) : null,
      },
    ],
    [handleApproveButton, userRole]
  );

  const editMedicine = useCallback(
    (data) => {
      if (data) {
        handlePrescriptionButton(data);
      }
    },
    [handlePrescriptionButton]
  );

  const moreActions = !isEmpty(patientData)
    ? [
        {
          label: 'Edit',
          icon: 'edit',
          action: editMedicine,
        },
      ]
    : null;

  useEffect(() => {
    if (reload) {
      handleOnFetchDataList();
      setReload(false);
    }
  }, [reload, handleOnFetchDataList]);

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      handleOnFetchDataList();
      clearData();
    }
  }, [response]);

  useEffect(() => {
    if (isEmpty(patientData)) {
      columns.unshift({
        label: 'Patient Name',
        maxWidth: '6rem',
        type: 'text',
        dataKey: 'patient.name',
      });
    }
  }, [patientData, columns]);

  return (
    <Table
      headerComponent={
        <FilterCollectionHeader
          onFilterChange={handleFilters}
          filters={filters}
        />
      }
      loading={loading}
      data={patientPharmacyOrderList?.results}
      totalCount={patientPharmacyOrderList?.totalResults}
      columns={columns}
      pagination
      rowsPerPage={rowsPerPage}
      page={page}
      handlePageChange={handlePageChange}
      sort={sort}
      handleSort={handleSort}
      wrapperStyle={{ overflow: 'auto' }}
      itemStyle={{ textTransform: 'capitalize' }}
      timezone
      actionButtons={moreActions}
      onRowClick={isEmpty(patientData) ? handlePrescriptionButton : null}
    />
  );
};

const EPrescription = () => (
  <PageContent style={{ overflow: 'auto' }}>
    <Routes>
      <Route path="/" element={<EPrescriptionList />} />
      <Route path="/new" element={<EPrescriptionForm />} />
      <Route path=":patientPrescriptionId" element={<EPrescriptionForm />} />
    </Routes>
  </PageContent>
);

export default EPrescription;
