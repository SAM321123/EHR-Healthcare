/* eslint-disable no-param-reassign */
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';

import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { ADD_CLINIC, CLINIC_TABLE } from 'src/store/types';
import ModalComponent from 'src/components/modal';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { CLINIC_COLUMNS } from 'src/lib/tableConstants';
import SwitchLabel from 'src/wiredComponent/Switch';
import { showSnackbar, triggerEvents } from 'src/lib/utils';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { successMessage } from 'src/lib/constants';
import { useForm } from 'react-hook-form';
import PageContent from 'src/components/PageContent';
import FilterComponents from '../../components/FilterComponents';
import Table from '../../components/Table';
import AddClinic from '../admin/AddClinic';
import AddStaff from '../admin/AddStaff';
// import AddDatabase from '../admin/AddDatabase';

const steps = ['Clinic Details', 'Admin Details'];
// const steps = ['Clinic Details', 'Admin Details', 'Database Details'];

const columns = [...CLINIC_COLUMNS];

const ClinicTable = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const form = useForm({ mode: 'onChange' });

  const { handleSubmit, reset } = form;

  const getStepContent = useCallback(
    (step) => {
      switch (step) {
        case 0:
          return <AddClinic form={form} showUploadLogo />;
        case 1:
          return <AddStaff form={form} isComingFromClinic />;
        // case 2: 
        //   return <AddDatabase form={form} />;

        default:
          return null;
      }
    },
    [form]
  );

  const handleModal = () => {
    setOpen((prev) => !prev);
    setActiveStep(0);
    reset();
  };

  const FilterCollectionHeader = FilterComponents({
    leftComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search by Name',
        },
        name: 'searchText',
      },
    ],
    rightComponents: [
      {
        type: 'fabButton',
        // style: { ml: 2 },
        onClick: () => handleModal(),
      },
    ],
  });

  const moreActions = [
    {
      label: 'Edit',
      icon: 'edit',
      action: (data) => {
        navigate(
          generatePath(UI_ROUTES.editClinicsDetails, {
            clinicId: data?.id,
            tabName: 'Overview',
          })
        );
      },
    },
  ];

  const [
    clinicList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    callDataListAPI,
  ] = useQuery({
    listId: CLINIC_TABLE,
    url: API_URL.adminPractices,
    type: REQUEST_METHOD.get,
  });

  const onSwitchToggle = useCallback(() => {}, [columns, clinicList]);

  useMemo(() => {
    columns.forEach((item) => {
      const temp = item;
      if (temp.dataKey === 'isActive') {
        temp.render = ({ data }) => (
          <SwitchLabel rowData={data} api={API_URL.adminPractices} />
        );
        temp.handleChange = onSwitchToggle;
      }
      return temp;
    });
  }, [columns]);

  const [clinicData, , clinicLoading, callAddClinicAPI, clearData] = useCRUD({
    id: ADD_CLINIC,
    url: API_URL.adminPractices,
  });

  const handleBack = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep > 0 ? prevActiveStep - 1 : 0
    );
  };

  const handleStepSubmit = useCallback(
    async (data) => {
      // if (activeStep !== 1) {
      if(activeStep !== steps.length-1 ){
        setActiveStep((prev) => prev + 1);
      } else {
        if (data?.logo?.id) {
          data.logo = data?.logo?.id;
        }
        callAddClinicAPI({
          data,
        });
      }
    },
    [activeStep, callAddClinicAPI]
  );

  useEffect(() => {
    if (clinicData) {
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      triggerEvents(`REFRESH-TABLE-${CLINIC_TABLE}`);
      clearData();
      setOpen(false);
    }
  }, [callDataListAPI, clearData, clinicData]);

  return (
    <PageContent loading={loading}>
      <Table
        headerComponent={
          <FilterCollectionHeader
            onFilterChange={handleFilters}
            filters={filters}
          />
        }
        data={clinicList?.results}
        totalCount={clinicList?.totalResults}
        columns={columns}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        actionButtons={moreActions}
        loading={loading}
        sort={sort}
        handleSort={handleSort}
      />
      {open && (
        <ModalComponent
          header={{
            title: 'Add Clinic',
            closeIconAction: handleModal,
            isCloseIcon: false,
          }}
          isDivider={false}
          open={open}
        >
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: '24px' }}>
            {steps?.map?.((label) => (
              <Step
                key={label}
                sx={{
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: 'success.main',
                  },
                  '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel':
                    {
                      color: 'success.main',
                    },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: 'primary.main',
                  },
                }}
              >
                <StepButton onClick={handleBack} color="inherit">
                  {label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          <Box>
            {getStepContent(activeStep)}
            <Box sx={{ m: 'auto', width: '50%' }}>
              <Stack direction="row" gap="12px" sx={{ m: 2 }}>
                {/* <CustomButton
                  onClick={handleModal}
                  label="Cancel"
                  variant="secondary"
                /> */}
                {activeStep === 0 ? (
                  <LoadingButton onClick={handleModal} label="Cancel" variant="secondary" />
                ) : (
                  <LoadingButton onClick={handleBack} label="Back" variant="secondary" />
                )}

                <LoadingButton
                  onClick={handleSubmit(handleStepSubmit)}
                  loading={clinicLoading}
                  label={activeStep === steps.length - 1 ? 'Submit' : 'Proceed'}
                />
              </Stack>
            </Box>
          </Box>
        </ModalComponent>
      )}
    </PageContent>
  );
};

export default ClinicTable;
