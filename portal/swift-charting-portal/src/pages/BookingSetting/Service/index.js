import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import isEmpty from 'lodash/isEmpty';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Box from 'src/components/Box';
import Container from 'src/components/Container';
import PageHeader from 'src/components/PageHeader';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import {
  copyWidgetLink,
  getUpdatedFieldsValue,
  showSnackbar,
} from 'src/lib/utils';
import { SERVICE } from 'src/store/types';
import palette from 'src/theme/palette';
import Switch from 'src/wiredComponent/Switch';
import AlertDialog from 'src/components/AlertDialog';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { successMessage } from 'src/lib/constants';
import BookingWidget from 'src/pages/BookingWidget';
import Table from '../../../components/Table';
import ModalComponent from '../../../components/modal';
import BasicInfo from './BasicInfo';
import ServiceForm from './ServiceForm';
import ServiceOverride from './ServiceOverride';
import ServiceCancellation from './serviceCancellation';

const columns = [
  {
    label: 'Service Name',
    type: 'text',
    dataKey: 'name',
  },
  {
    label: 'Description',
    type: 'text',
    dataKey: 'description',
  },
  {
    label: 'Duration',
    type: 'text',
    dataKey: 'sessionDuration',
  },
  {
    label: 'Price',
    type: 'text',
    dataKey: 'price',
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    render: ({ data }) => <Switch rowData={data} api={API_URL.services} />,
  },
];

const Service = () => {
  const [createService, setCreateService] = useState(false);
  const [defaultData, setDefaultData] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [serviceData, setServiceData] = useState({});

  const steps = useMemo(() => {
    const list = ['Basic Info', 'Form', 'Overrides', 'Cancellation', 'Widget'];
    return !isEmpty(defaultData) ? list : list.slice(0, list.length - 1);
  }, [defaultData]);

  const form = useForm({ mode: 'onChange' });

  const { handleSubmit, reset } = form;

  const [
    services,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    sort,
    handleSort,
    ,
    ,
    handleOnFetchDataList,
  ] = useQuery({
    id: SERVICE,
    url: API_URL.services,
    type: REQUEST_METHOD.get,
  });

  const [
    updateServiceData,
    ,
    updateServiceLoading,
    callUpdateServiceAPI,
    updateServiceClearData,
  ] = useCRUD({
    id: `${SERVICE}-update`,
    url: API_URL.services,
    type: REQUEST_METHOD.update,
  });

  const [
    deleteServiceData,
    ,
    deleteServiceLoading,
    callDeleteServiceAPI,
    deleteServiceClearData,
  ] = useCRUD({
    id: `${SERVICE}-delete`,
    url: API_URL.services,
    type: REQUEST_METHOD.update,
  });

  const [
    addServiceData,
    ,
    addServiceLoading,
    callAddServiceAPI,
    addServiceClearData,
  ] = useCRUD({
    id: `${SERVICE}-add`,
    url: API_URL.services,
    type: REQUEST_METHOD.post,
  });

  const getStepContent = useCallback(
    (step) => {
      switch (step) {
        case 0:
          return (
            <BasicInfo
              form={form}
              isTitle="Basic Info"
              defaultData={defaultData}
            />
          );
        case 1:
          return (
            <ServiceForm form={form} isTitle="Form" defaultData={defaultData} />
          );
        case 2:
          return (
            <ServiceOverride
              form={form}
              isTitle="Overrides"
              defaultData={defaultData}
            />
          );
        case 3:
          return (
            <ServiceCancellation
              form={form}
              isTitle="Cancellation"
              defaultData={defaultData}
            />
          );
        case 4:
          return (
            <BookingWidget
              serviceId={!isEmpty(defaultData) ? defaultData?.id : ''}
            />
          );
        default:
          return null;
      }
    },
    [defaultData, form]
  );

  const deleteDialogBox = useCallback((data) => {
    setServiceData(data);
    setOpen((value) => !value);
  }, []);

  const deleteService = useCallback(() => {
    if (serviceData) {
      const { id } = serviceData;
      callDeleteServiceAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callDeleteServiceAPI, serviceData]);

  const dialogActions = useMemo(() => {
    const actionFields = [
      {
        title: 'Cancel',
        action: () => setOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: deleteService,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ];
    return actionFields;
  }, [deleteService]);

  const editService = useCallback((data) => {
    if (data) {
      const { serviceStartDate, serviceEndDate } = data || {};
      const locationsData = data?.locations?.map(
        ({ practitioner, location, price, schedule }) => {
          const id = practitioner?.id;
          return { location, price, schedule, practitioner: id };
        }
      );
      const startDate = serviceStartDate ? dayjs(serviceStartDate) : null;
      const endDate = serviceEndDate ? dayjs(serviceEndDate) : null;

      setDefaultData({
        ...data,
        serviceStartDate: startDate,
        serviceEndDate: endDate,
        locations: locationsData,
      });
      setCreateService(true);
    }
  }, []);

  const handleCopy = useCallback((data) => {
    const url = `${window.location.origin}/${UI_ROUTES.bookings}?practiceId=${
      data?.practice
    }${data?.id ? `&serviceId=${data?.id}` : ``}`;
    copyWidgetLink(url);
  }, []);

  const moreActions = [
    {
      label: 'Edit',
      action: editService,
    },
    {
      label: 'Copy Widget Link',
      action: handleCopy,
    },
    {
      label: 'Delete',
      action: deleteDialogBox,
    },
  ];

  const handleCreateServiceModal = () => {
    setCreateService((prev) => !prev);
    setActiveStep(0);
    reset();
    setDefaultData({});
  };

  const handleBack = (val) => {
    if (isEmpty(defaultData)) {
      setActiveStep((prevActiveStep) => (prevActiveStep > 0 ? val : 0));
    } else {
      setActiveStep(val);
    }
  };

  const handleStepSubmit = useCallback(
    async (data) => {
      const id = defaultData?.id;

      if (isEmpty(defaultData)) {
        if (activeStep !== 3) {
          setActiveStep((prev) => prev + 1);
        } else {
          callAddServiceAPI({
            data,
          });
        }
      } else {
        const updatedFields = getUpdatedFieldsValue(data, defaultData);
        if (isEmpty(updatedFields?.educationContent)) {
          delete updatedFields?.educationContent;
        }

        if (activeStep !== steps.length - 1) {
          setActiveStep((prev) => prev + 1);
        } else if (!isEmpty(updatedFields)) {
          callUpdateServiceAPI(updatedFields, `/${id}`);
        } else if (isEmpty(updatedFields)) {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [activeStep, callAddServiceAPI]
  );

  useEffect(() => {
    if (addServiceData) {
      showSnackbar({
        message: 'Service added successfully',
        severity: 'success',
      });
      addServiceClearData();
      setCreateService(false);
      handleOnFetchDataList();
      setActiveStep(0);
    }
    if (updateServiceData) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      updateServiceClearData();
      handleOnFetchDataList();
      handleCreateServiceModal();
    }
  }, [
    addServiceClearData,
    addServiceData,
    addServiceLoading,
    updateServiceClearData,
    updateServiceData,
  ]);

  useEffect(() => {
    if (deleteServiceData) {
      showSnackbar({
        message: 'Delete successfully',
        severity: 'success',
      });
      deleteServiceClearData();
      handleOnFetchDataList();
    }
  }, [deleteServiceClearData, deleteServiceData]);

  return (
    <Container
      loading={loading}
      style={{
        backgroundColor: palette.background.paper,
        padding: 16,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
    >
      <>
        <PageHeader
          isBreadCrumbVisible
          title="Manage Your Services"
          rightContent={[
            {
              type: 'fabButtonSave',
              style: { ml: 2 },
              onClick: handleCreateServiceModal,
            },
          ]}
        />
        <Table
          data={services?.results}
          totalCount={services?.totalResults}
          columns={columns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={
            loading ||
            updateServiceLoading ||
            addServiceLoading ||
            deleteServiceLoading
          }
          sort={sort}
          handleSort={handleSort}
          moreActions={moreActions}
          wrapperStyle={{
            backgroundColor: palette.common.white,
            boxShadow: 'none',
            border: `1px solid ${palette.grey[200]}`,
            borderRadius: '0 5px 5px',
            overflowX: 'hidden',
          }}
        />
        {createService && (
          <ModalComponent
            open={createService}
            header={{
              title: !isEmpty(defaultData) ? 'Edit Service' : 'Add Service',
              closeIconAction: handleCreateServiceModal,
              isCloseIcon: false,
            }}
            isDivider={false}
          >
            <Stepper
              activeStep={isEmpty(defaultData) ? activeStep : steps.length}
              alternativeLabel
              sx={{ mt: '24px' }}
            >
              {steps?.map?.((label, index) => (
                <Step
                  key={label}
                  sx={{
                    '& .MuiStepLabel-root .Mui-completed': {
                      color: 'success.main',
                    },
                    '& .MuiStepLabel-root .Mui-active': {
                      color: 'primary.main',
                    },
                  }}
                >
                  <StepButton onClick={() => handleBack(index)} color="inherit">
                    {label}
                  </StepButton>
                </Step>
              ))}
            </Stepper>

            <Box>
              {getStepContent(activeStep)}
              <Box sx={{ m: 'auto', width: '50%' }}>
                <Stack direction="row" gap="12px" sx={{ m: 2 }}>
                  <CustomButton
                    variant="secondary"
                    onClick={handleCreateServiceModal}
                    label="Cancel"
                  />
                  <LoadingButton
                    onClick={handleSubmit(handleStepSubmit)}
                    loading={addServiceLoading}
                    label={
                      activeStep === steps.length - 1 ? 'Submit' : 'Proceed'
                    }
                  />
                </Stack>
              </Box>
            </Box>
          </ModalComponent>
        )}
        <AlertDialog
          open={open}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
      </>
    </Container>
  );
};

export default Service;
