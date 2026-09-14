import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  InputAdornment,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  dateFormats,
  inputLength,
  invoiceStatus,
  regDecimal,
  regTextArea,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import { isEmpty, upperCase } from 'src/lib/lodash';
import Container from 'src/components/Container';
import ModalHeader from 'src/components/modal/header';
import useCRUD from 'src/hooks/useCRUD';
import { CREATE_INVOICE, GET_INVOICE } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { showSnackbar, triggerEvents } from 'src/lib/utils';
import palette from 'src/theme/palette';
import CustomForm from 'src/components/form';
import { useForm } from 'react-hook-form';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomButton from 'src/components/CustomButton';
import Currency from 'src/components/Currency';
import Typography from 'src/components/Typography';
import Modal from 'src/components/modal';
import useAuthUser from 'src/hooks/useAuthUser';
import InvoicePayment from './InvoicePayment';

const blankSpace = {
  component: () => <div />,
  colSpan: 0.5,
  gridProps: { mt: -3 },
};

function getServiceProduct(items) {
  const types = items?.map((item) => ({
    ...item,
    name: item?.service || item?.product,
  }));
  return types;
}

function setDefaultValue(selectedInvoice, setValue) {
  const list = getServiceProduct(selectedInvoice?.items);
  setValue('invoiceAmount', selectedInvoice?.invoiceAmount);
  setValue('issueDate', dayjs(selectedInvoice?.issueDate));
  setValue('dueDate', dayjs(selectedInvoice?.dueDate));
  setValue('shipingCharges', selectedInvoice?.shipingCharges);
  setValue('discount', selectedInvoice?.discount);
  setValue('note', selectedInvoice?.note);
  setValue('items', list);
}

function checkDueDate(date) {
  return dayjs().isAfter(dayjs(date));
}

// function hideSaveAndDraftButton(invoice) {
//   if (checkDueDate(invoice?.dueDate)) return true;

//   return false;
// }

function hideSaveAsDraftButton(invoice) {
  if (
    upperCase(invoice?.status) === upperCase(invoiceStatus.SENT) ||
    upperCase(invoice?.status) === upperCase(invoiceStatus.PARTIALLY_PAID) ||
    !checkDueDate(invoice?.dueDate)
  )
    return true;

  return false;
}
function hideBothButton(invoice) {
  if (upperCase(invoice?.status) === upperCase(invoiceStatus.PAID)) return true;
  return false;
}
let checkButtonClick = invoiceStatus.SENT;
const CreateInvoice = (props) => {
  const {
    header,
    modalCloseAction,
    patientData,
    selectedInvoice,
    productResponse,
    serviceResponse,
  } = props;
  const [userData] = useAuthUser();
  const [minDueDate, setMinDueDate] = useState();
  const [isPaymentInvoiceModalVisible, setPaymentInvoiceModalVisible] =
    useState(false);
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, setValue, clearErrors } = form;

  const calcService = useCallback(
    (data, index) => {
      const { items } = data || {};
      // eslint-disable-next-line no-unsafe-optional-chaining
      const { type } = items[index] || {};
      if (type === 'service') {
        const selectedType = serviceResponse?.results.find(
          ({ id }) => id === items?.[index]?.name
        );
        setValue(`items.${index}.price`, Number(selectedType?.price));
        clearErrors(`items.${index}.price`);
      }
      if (type === 'product') {
        const selectedType = productResponse?.results.find(
          ({ id }) => id === items?.[index]?.name
        );
        setValue(`items.${index}.price`, Number(selectedType?.price));
        clearErrors(`items.${index}.price`);
      }

      return { reFetch: false };
    },
    [productResponse, serviceResponse, setValue]
  );

  const calcInvoiceAmount = useCallback((data) => {
    const { discount = 0, shipingCharges = 0, items } = data;
    const Total = items?.reduce(
      (accumulator, currentValue) =>
        accumulator + Number(currentValue?.price || 0),
      0
    );

    const total = (
      Number(Total || 0) +
      (Number(shipingCharges) || 0) -
      (Number(discount) || 0)
    ).toFixed(2);
    setValue(`invoiceAmount`, total);
    return { defaultValue: 10 };
  }, []);

  const calcDueDate = useCallback((data) => {
    setMinDueDate(data?.issueDate);
    return { reFetch: false };
  }, []);

  const calc = useCallback(
    (data, index) => {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const { type } = data?.items[index] || {};
      setValue(`items.${index}.price`, '');
      if (type === 'service')
        return { reFetch: true, options: serviceResponse?.results };

      if (type === 'product')
        return { reFetch: true, options: productResponse?.results };
      return { reFetch: false };
    },
    [productResponse, serviceResponse]
  );

  const formGroups = useMemo(
    () => [
      {
        // eslint-disable-next-line react/no-unstable-nested-components
        component: () => (
          <div>
            <Typography sx={{ fontSize: '14px', fontWeight: 700 }}>
              Patient name
            </Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>
              {patientData?.name}
            </Typography>
          </div>
        ),
        colSpan: 0.5,
      },
      {
        inputType: 'date',
        name: 'issueDate',
        label: 'Issue Date',
        disablePast: !!isEmpty(selectedInvoice),
        required: requiredField,
        format: dateFormats.MMDDYYYY,
        colSpan: 0.5,
      },
      {
        ...blankSpace,
      },
      {
        inputType: 'date',
        name: 'dueDate',
        label: 'Due Date',
        colSpan: 0.5,
        minDate: isEmpty(selectedInvoice)
          ? minDueDate || dayjs(new Date())
          : minDueDate || dayjs(selectedInvoice?.dueDate),
        dependencies: {
          keys: ['issueDate'],
          calc: calcDueDate,
        },
        required: requiredField,
        format: dateFormats.MMDDYYYY,
        disablePast: !!isEmpty(selectedInvoice),
      },
      {
        inputType: 'nestedForm',
        name: 'items',
        textButton: 'Add Service',
        label: 'Items',
        // required: requiredField,
        columnsPerRow: 1,
        formGroups: [
          {
            name: 'type',
            inputType: 'select',
            label: 'Type',
            labelAccessor: 'name',
            valueAccessor: 'code',
            required: requiredField,
            options: [
              { name: 'Service', code: 'service' },
              { name: 'Product', code: 'product' },
            ],
            colSpan: 0.15,
          },
          {
            name: 'name',
            label: 'Item',
            inputType: 'select',
            labelAccessor: 'name',
            valueAccessor: 'id',
            required: requiredField,
            dependencies: {
              keys: ['type'],
              calc,
            },
            colSpan: 0.5,
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'price',
            textLabel: 'Price',
            colSpan: 0.1,
            required: requiredField,
            pattern: regDecimal,
            dependencies: {
              keys: ['name'],
              calc: calcService,
            },
            maxLength: { ...inputLength.amountLength },
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <Currency />
                </InputAdornment>
              ),
            },
          },
        ],
      },
      {
        inputType: 'text',
        multiline: true,
        minRows: 3,
        name: 'note',
        textLabel: 'Description',
        colSpan: 2,
        pattern: regTextArea,
      },

      {
        ...blankSpace,
      },
      {
        inputType: 'text',
        type: 'number',
        name: 'shipingCharges',
        textLabel: 'Shipping Charge',
        maxLength: { ...inputLength.amountLength },
        colSpan: 0.5,
        pattern: regDecimal,
        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <Currency />
            </InputAdornment>
          ),
        },
      },
      {
        ...blankSpace,
      },
      {
        inputType: 'text',
        type: 'number',
        name: 'discount',
        textLabel: 'Discount',
        maxLength: { ...inputLength.amountLength },
        pattern: regDecimal,
        colSpan: 0.5,
        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <Currency />
            </InputAdornment>
          ),
        },
      },
      {
        ...blankSpace,
      },
      {
        inputType: 'text',
        type: 'number',
        name: 'invoiceAmount',
        textLabel: 'Total Amount',
        pattern: regDecimal,
        disabled: true,
        colSpan: 0.5,
        dependencies: {
          keys: ['items', 'shipingCharges', 'discount'],
          calc: calcInvoiceAmount,
        },
        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <Currency />
            </InputAdornment>
          ),
        },
      },
    ],
    [calcService, minDueDate]
  );

  useEffect(() => {
    if (isEmpty(selectedInvoice))
      setValue('shipingCharges', userData?.practice?.shipingCharges);
  }, [userData]);

  useMemo(() => {
    if (selectedInvoice) {
      setTimeout(() => {
        setDefaultValue(selectedInvoice, setValue);
      }, 300);
    }
  }, [selectedInvoice]);

  const [response, , loading, createApi, clearData] = useCRUD({
    id: CREATE_INVOICE,
    url: isEmpty(selectedInvoice)
      ? API_URL.invoice
      : `${API_URL.invoice}/${selectedInvoice?.id}`,
    type: isEmpty(selectedInvoice)
      ? REQUEST_METHOD.post
      : REQUEST_METHOD.update,
  });

  useEffect(() => {
    if (!isEmpty(response)) {
      let message = '';
      if (isEmpty(selectedInvoice)) {
        message = successMessage.create;
      } else {
        message = successMessage.update;
      }
      showSnackbar({
        message,
        severity: 'success',
      });
      clearData();
      modalCloseAction();
      triggerEvents(`REFRESH-TABLE-${GET_INVOICE}`);
    }
  }, [clearData, modalCloseAction, response]);

  const toggleModal = useCallback(() => {
    setPaymentInvoiceModalVisible(!isPaymentInvoiceModalVisible);
  }, [isPaymentInvoiceModalVisible]);

  const createPayload = useCallback((data) => {
    const {
      shipingCharges,
      invoiceAmount,
      note,
      issueDate,
      dueDate,
      items,
      discount,
    } = data;

    if (dayjs(dueDate).isBefore(dayjs(issueDate))) {
      showSnackbar({
        message: 'Due date should be greater than issue date.',
        severity: 'error',
      });
      return {};
    }
    if (Number(invoiceAmount) < 0) {
      showSnackbar({
        message: 'Invoice amount should be greater than or equal to 0',
        severity: 'error',
      });
      return {};
    }
    const payloadItems = [];

    items?.forEach((item) => {
      payloadItems.push({
        type: item?.type,
        [item?.type]: item?.name,
        price: item?.price || 0,
      });
    });

    const payload = {
      shipingCharges: shipingCharges || 0,
      invoiceAmount,
      note,
      issueDate: dayjs(issueDate).format(),
      dueDate: dayjs(dueDate).format(),
      patient: patientData?.id,
      items: payloadItems,
      discount: discount || 0,
    };

    return payload;
  }, []);

  const onSave = useCallback(
    (data) => {
      const payload = createPayload(data);
      if (isEmpty(payload)) return;
      payload.status = invoiceStatus.SENT;
      checkButtonClick = invoiceStatus.SENT;
      if (selectedInvoice) createApi(payload);
      else createApi({ data: payload });
    },
    [modalCloseAction, createApi, patientData]
  );

  const onSaveDraft = useCallback(
    (data) => {
      const payload = createPayload(data);
      if (isEmpty(payload)) return;
      payload.status = invoiceStatus.DRAFT;
      checkButtonClick = invoiceStatus.DRAFT;
      if (selectedInvoice) createApi(payload);
      else createApi({ data: payload });
    },
    [modalCloseAction, createApi, patientData]
  );

  const showSaveAsDraftButton = useCallback(
    () => (
      <>
        <LoadingButton
          loading={checkButtonClick === invoiceStatus.DRAFT && loading}
          onClick={handleSubmit(onSaveDraft)}
          label="Save as draft"
        />
        <LoadingButton
          loading={checkButtonClick === invoiceStatus.SENT && loading}
          onClick={handleSubmit(onSave)}
          label="Save"
        />
      </>
    ),
    [loading]
  );

  const initialDateValues = useMemo(
    () => ({
      issueDate: dayjs(new Date()),
      dueDate: dayjs(new Date()),
    }),
    []
  );

  // const showPaymentButton = useCallback(
  //   () => (
  //     <CustomButton
  //       loading={loading}
  //       variant="primary"
  //       onClick={toggleModal}
  //       label="Enter Payment"
  //     />
  //   ),
  //   [loading]
  // );

  const showSaveAndPaymentButton = useCallback(
    () => (
      <>
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onSave)}
          label="Save"
        />
        {/* <CustomButton
          loading={loading}
          variant="primary"
          onClick={toggleModal}
          label="Enter Payment"
        /> */}
      </>
    ),
    [loading]
  );

  const getButtons = useCallback(() => {
    if (isEmpty(selectedInvoice)) {
      return showSaveAsDraftButton();
    }
    if (hideBothButton(selectedInvoice)) {
      return null;
    }
    // if (hideSaveAndDraftButton(selectedInvoice)) {
    //   return showPaymentButton();
    // }
    if (hideSaveAsDraftButton(selectedInvoice)) {
      return showSaveAndPaymentButton();
    }

    return showSaveAsDraftButton();
  }, [loading, selectedInvoice]);

  return (
    <Container
      component="main"
      style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={0}>
        <Grid container>
          <Grid xs={12} md={12} lg={12}>
            <Card
              display="flex"
              sx={{
                height: '100%',
                backgroundColor: palette.background.paper,
                boxShadow: 'none',
              }}
            >
              {header ? (
                <ModalHeader
                  header={header}
                  modalCloseAction={modalCloseAction}
                />
              ) : null}
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ marginTop: 4 }}>
                  <CustomForm
                    formGroups={formGroups}
                    columnsPerRow={1}
                    gridGap={2}
                    form={form}
                    defaultValue={initialDateValues}
                  />
                </Box>
                <Box
                  mr={2}
                  mt={4}
                  sx={{
                    backgroundColor: palette.background.paper,
                  }}
                />
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <CustomButton
                  variant="secondary"
                  onClick={modalCloseAction}
                  label="Cancel"
                />
                {getButtons()}
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Stack>
      {isPaymentInvoiceModalVisible && (
        <Modal
          open={isPaymentInvoiceModalVisible}
          onClose={toggleModal}
          header={{
            title: 'Invoice Payment',
          }}
        >
          <InvoicePayment
            modalCloseAction={toggleModal}
            patientData={patientData}
            selectedInvoice={selectedInvoice}
          />
        </Modal>
      )}
    </Container>
  );
};

export default CreateInvoice;
