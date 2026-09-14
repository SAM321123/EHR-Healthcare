/* eslint-disable react/no-unstable-nested-components */
import { useCallback, useEffect, useMemo } from 'react';
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
  paymentMethods,
  regDecimal,
  regTextArea,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import { isEmpty } from 'src/lib/lodash';
import Container from 'src/components/Container';
import ModalHeader from 'src/components/modal/header';
import useCRUD from 'src/hooks/useCRUD';
import { GET_INVOICE, INVOICE_PAYMENT } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { getNewDate, showSnackbar, triggerEvents } from 'src/lib/utils';
import palette from 'src/theme/palette';
import CustomForm from 'src/components/form';
import { useForm } from 'react-hook-form';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomButton from 'src/components/CustomButton';
import { WiredSelect } from 'src/wiredComponent/Form/FormFields';
import Currency from 'src/components/Currency';
import Typography from 'src/components/Typography';

const defaultValue = { paymentDate: getNewDate() };

const InvoicePayment = (props) => {
  const { header, modalCloseAction, patientData, selectedInvoice, dueAmount } =
    props;
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;

  const formGroups = useMemo(
    () => [
      {
        component: () => (
          <div>
            <Typography sx={{ fontSize: '14px', fontWeight: 700 }}>
              Register Offline Payment
            </Typography>
          </div>
        ),
        colSpan: 0.5,
      },
      {
        component: () => (
          <div>
            <Typography
              sx={{
                fontSize: '16px',
                textAlign: 'end',
                fontWeight: 600,
              }}
            >
              Amount Due: <Currency />
              {dueAmount.toFixed(2)}
            </Typography>
          </div>
        ),
        colSpan: 0.5,
      },
      {
        ...WiredSelect({
          name: 'paymentMethod',
          label: 'Payment Method',
          labelAccessor: 'method',
          valueAccessor: 'id',
          options: paymentMethods,
          required: requiredField,
        }),
        // colSpan: 0.5,
      },
      {
        inputType: 'text',
        type: 'number',
        name: 'amount',
        textLabel: 'Amount',
        colSpan: 0.5,
        pattern: regDecimal,
        maxLength: { ...inputLength.amountLength },
        required: requiredField,
        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <Currency />
            </InputAdornment>
          ),
        },
      },
      {
        inputType: 'date',
        name: 'paymentDate',
        label: 'Date',
        disablePast: true,
        required: requiredField,
        format: dateFormats.MMDDYYYY,
        colSpan: 0.5,
        maxDate: dayjs().add(1, 'year'),
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
    ],
    []
  );

  const [response, , loading, createApi, clearData] = useCRUD({
    id: INVOICE_PAYMENT,
    url: API_URL.invoicePayment,
    type: REQUEST_METHOD.post,
  });

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      clearData();
      modalCloseAction();
      triggerEvents(`REFRESH-TABLE-${GET_INVOICE}`);
    }
  }, [clearData, modalCloseAction, response]);

  const createPayload = useCallback((data) => {
    const { paymentMethod, amount, note, paymentDate } = data;
    const payload = {
      invoice: selectedInvoice?.id,
      patient: patientData?.id,
      amount: Number(amount).toFixed(2),
      paymentMethod,
      paymentDate: dayjs(paymentDate).format(),
      note,
    };

    if (Number(amount) > dueAmount) {
      showSnackbar({
        message: `Maximum amount should be ${dueAmount}`,
        severity: 'error',
      });

      return null;
    }

    return payload;
  }, []);

  const onSave = useCallback(
    (data) => {
      const payload = createPayload(data);
      if (!payload) return;
      createApi({ data: payload });
    },
    [modalCloseAction, createApi, patientData]
  );

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
                    defaultValue={defaultValue}
                    columnsPerRow={1}
                    gridGap={3}
                    form={form}
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
                <LoadingButton
                  loading={loading}
                  onClick={handleSubmit(onSave)}
                  label="Save"
                />
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default InvoicePayment;
