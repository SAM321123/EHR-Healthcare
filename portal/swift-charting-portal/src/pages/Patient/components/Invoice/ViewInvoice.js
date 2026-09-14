/* eslint-disable jsx-a11y/control-has-associated-label */
import { useCallback, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { capitalize } from 'src/lib/lodash';
import { dateFormats, invoiceStatus } from 'src/lib/constants';
import { convertWithTimezone } from 'src/lib/utils';
import palette from 'src/theme/palette';
import useCRUD from 'src/hooks/useCRUD';
import { GET_INVOICE_DETAILS, GET_INVOICE_PAYMENT } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Currency from 'src/components/Currency';
import CustomButton from 'src/components/CustomButton';
import Modal from 'src/components/modal';
import Container from 'src/components/Container';
import InvoicePayment from './InvoicePayment';
import Checkout from './Checkout';

const capsFirstLetter = (value) => capitalize(value);
const addPreFix = (value) => (
  <>
    <Currency />
    {value}
  </>
);
const itemsTableHeadings = [
  { label: 'Type', dataKey: 'type', valueModifier: capsFirstLetter },
  { label: 'Product/Service', dataKey: 'product', valueAccessor: 'service' },
  { label: 'Quantity', dataKey: 'quantity' },
  { label: 'Price', dataKey: 'price', valueModifier: addPreFix },
];

const paymentTableHeadings = [
  { label: 'Date', dataKey: 'paymentDate', format: dateFormats.MMDDYYYY },
  { label: 'Method', dataKey: 'paymentMethod' },
  { label: 'Amount', dataKey: 'amount', valueModifier: addPreFix },
  { label: 'Description', dataKey: 'note', style: { maxWidth: '20vw' } },
];

function InvoiceAmountSection({ label, amount, cellStyle = {} }) {
  return (
    <tr>
      <td />
      <td />
      <td
        style={{
          borderRightWidth: '1px',
          borderTopWidth: '1px',
          borderLeftWidth: 1,
          borderBottomWidth: '0px',
          borderStyle: 'solid',
          borderColor: palette.grey[400],
          textAlign: 'left',
          paddingLeft: '10px',
          height: 30,
          fontSize: '14px',
          fontFamily: 'Poppins',
          fontWeight: 500,
          ...cellStyle,
        }}
      >
        {label}
      </td>
      <td
        style={{
          borderRightWidth: '1px',
          borderTopWidth: '1px',
          borderBottomWidth: '1px',
          borderLeftWidth: '0px',
          borderStyle: 'solid',
          borderColor: palette.grey[400],
          textAlign: 'left',
          paddingLeft: '10px',
          height: 30,
          fontSize: '14px',
          fontFamily: 'Poppins',
          fontWeight: 500,
          ...cellStyle,
        }}
      >
        <Currency />
        {amount}
      </td>
    </tr>
  );
}
function getSubTotal(invoiceDetails) {
  return (
    Number(invoiceDetails?.invoiceAmount) +
      Number(invoiceDetails?.discount) -
      Number(invoiceDetails?.shipingCharges) || 0
  );
}
function InvoiceAmount(invoiceDetails) {
  return (
    <>
      {InvoiceAmountSection({
        label: 'Subtotal',
        amount: getSubTotal(invoiceDetails),
      })}
      {InvoiceAmountSection({
        label: 'Shipping Charges',
        amount: invoiceDetails?.shipingCharges || 0,
      })}
      {InvoiceAmountSection({
        label: 'Discount',
        amount: invoiceDetails?.discount || 0,
      })}
      {InvoiceAmountSection({
        label: 'Total',
        amount: invoiceDetails?.invoiceAmount || 0,
        cellStyle: {
          fontWeight: 600,
          backgroundColor: palette.grey[200],
          borderBottomWidth: 1,
        },
      })}
    </>
  );
}

function getCellValue(row, column) {
  if (column.valueModifier) {
    return column.valueModifier(
      row[column?.dataKey] || row[column?.valueAccessor]
    );
  }
  if (column?.dataKey === 'product') {
    return row[row.type]?.name;
  }
  if (['paymentDate'].includes(column?.dataKey)) {
    return convertWithTimezone(row[column?.dataKey], {
      format: column?.format,
    });
  }
  return row[column?.dataKey] || row[column?.valueAccessor];
}

function ItemsTable({ invoiceDetails, tableHeadings }) {
  return (
    <table
      width="100%"
      style={{
        borderWidth: 0,
        borderTopWidth: 1,
        borderCollapse: 'collapse',
        borderColor: palette.grey[400],
        borderStyle: 'solid',
        borderRadius: 4,
      }}
    >
      <thead>
        <tr
          style={{
            borderWidth: 1,
            borderTopWidth: 0,
            borderCollapse: 'collapse',
            borderColor: palette.grey[400],
            borderStyle: 'solid',
            backgroundColor: 'rgb(197, 197, 197, 0.2)',
          }}
        >
          {tableHeadings.map((head) => (
            <th
              key={head}
              style={{
                height: 30,
                fontSize: '14px',
                fontFamily: 'Poppins',
                fontWeight: 600,
              }}
            >
              {head?.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {invoiceDetails?.items?.map((row) => (
          <tr key={row}>
            {tableHeadings?.map((column) => (
              <td
                key={column?.dataKey}
                style={{
                  borderRightWidth: '1px',
                  borderTopWidth: '0px',
                  borderBottomWidth: '1px',
                  borderLeftWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: palette.grey[400],
                  textAlign: 'left',
                  paddingLeft: '10px',
                  width: '40px',
                  height: 30,
                  fontSize: '14px',
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                }}
              >
                {column?.preFix}
                {getCellValue(row, column)}
              </td>
            ))}
          </tr>
        ))}
        {InvoiceAmount(invoiceDetails)}
      </tbody>
    </table>
  );
}

function PaymentItemsTable({ invoicePaymentDetails, tableHeadings }) {
  return (
    <table
      width="100%"
      style={{
        borderCollapse: 'collapse',
      }}
    >
      <thead>
        <tr
          style={{
            borderColor: palette.grey[400],
            borderStyle: 'solid',
            borderWidth: 0,
            borderCollapse: 'collapse',
            borderBottomWidth: 1,
            backgroundColor: palette.background.paper,
          }}
        >
          {tableHeadings.map((head) => (
            <th
              key={head}
              style={{
                height: 30,
                fontSize: '14px',
                fontFamily: 'Poppins',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              {head?.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {invoicePaymentDetails?.results?.map((row) => (
          <tr key={row}>
            {tableHeadings?.map((column) => (
              <td
                key={column?.dataKey}
                style={{
                  textAlign: 'left',
                  height: 35,
                  fontSize: '14px',
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  ...column?.style,
                }}
              >
                {getCellValue(row, column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const ViewInvoice = (props) => {
  const {
    selectedInvoice,
    patientData,
    modalCloseAction,
    isPatient = false,
  } = props;
  const { name, email } = patientData;
  const [isPaymentInvoiceModalVisible, setPaymentInvoiceModalVisible] =
    useState(false);
  const [
    invoiceDetails,
    ,
    invoiceLoading,
    getInvoiceDetails,
    clearInvoiceData,
  ] = useCRUD({
    id: GET_INVOICE_DETAILS,
    url: `${API_URL.invoice}/${selectedInvoice?.id}`,
    type: REQUEST_METHOD.get,
  });

  const [
    invoicePaymentList,
    ,
    invoicePaymentLoading,
    invoicePaymentListApi,
    clearInvoicePaymentData,
  ] = useCRUD({
    id: GET_INVOICE_PAYMENT,
    url: `${API_URL.invoicePayment}?invoice=${selectedInvoice?.id}`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getInvoiceDetails();
    invoicePaymentListApi();
    return () => {
      clearInvoiceData(true);
      clearInvoicePaymentData(true);
    };
  }, []);
  const getPaidAmount = useCallback(() => {
    if (invoicePaymentList?.results) {
      const totalPaid = invoicePaymentList?.results?.reduce(
        (accumulator, currentValue) =>
          accumulator + Number(currentValue?.amount || 0),
        0
      );
      return Number(totalPaid);
    }
    return 0;
  }, [invoicePaymentList]);

  const invoiceDetailsColumn = [
    {
      label: 'Invoice #',
      dataKey: 'invoiceNumber',
    },
    {
      label: 'Date',
      dataKey: 'issueDate',
      format: dateFormats.MMDDYYYY,
    },
    {
      label: 'Due on',
      dataKey: 'dueDate',
      format: dateFormats.MMDDYYYY,
    },
  ];

  const getValue = useCallback(
    (item) => {
      if (invoiceDetails) {
        if (['issueDate', 'dueDate'].includes(item?.dataKey)) {
          return convertWithTimezone(invoiceDetails[item?.dataKey], {
            format: item?.format,
          });
        }
        if (item?.dataKey === 'items') {
          return 'items';
        }
        return invoiceDetails[item?.dataKey];
      }
      return '';
    },
    [invoiceDetails, invoicePaymentList]
  );

  const getDueAmount = useCallback(
    (invoiceDetail, invoicePayment) => {
      if (invoiceDetail && invoicePayment) {
        const totalPaid = invoicePayment?.results?.reduce(
          (accumulator, currentValue) =>
            accumulator + Number(currentValue?.amount || 0),
          0
        );
        return (
          Number(invoiceDetail.invoiceAmount) - Number(totalPaid).toFixed(2)
        );
      }
      return 0;
    },
    [invoiceDetails, invoicePaymentList]
  );

  const toggleModal = useCallback(() => {
    if (isPaymentInvoiceModalVisible) {
      invoicePaymentListApi();
    }
    setPaymentInvoiceModalVisible(!isPaymentInvoiceModalVisible);
  }, [isPaymentInvoiceModalVisible, invoiceDetails, invoicePaymentList]);
  const showPaymentButton = useCallback(() => {
    if (
      getDueAmount(invoiceDetails, invoicePaymentList) > 0 &&
      invoiceDetails?.status !== invoiceStatus.DRAFT
    ) {
      return (
        <CustomButton
          variant="primary"
          onClick={toggleModal}
          label={isPatient ? 'Pay Now' : 'Enter Payment'}
          sx={{
            ml: 2,
          }}
        />
      );
    }

    return <div />;
  }, [invoiceDetails, invoicePaymentList]);

  return (
    <Container
      component="main"
      loading={invoiceLoading || invoicePaymentLoading}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          paddingLeft: 30,
          paddingRight: 30,
          marginTop: 20,
        }}
      >
        <div
          id="header"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <div id="billingInfo">
            <div
              id="billingInfoHeading"
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Poppins',
                color: palette.grey[800],
              }}
            >
              Bill To:
            </div>
            <div
              style={{
                fontSize: 14,
                color: palette.grey[700],
                fontFamily: 'Poppins',
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: 14,
                color: palette.grey[700],
                fontFamily: 'Poppins',
              }}
            >
              {email}
            </div>
          </div>
          <div id="invoiceDetails">
            <div
              id="heading"
              style={{
                fontSize: 24,
                color: palette.grey[700],
                fontFamily: 'Poppins',
              }}
            >
              INVOICE
            </div>
            <div id="details">
              {invoiceDetailsColumn?.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    fontSize: 14,
                    color: palette.grey[800],
                    fontFamily: 'Poppins',
                  }}
                >
                  <div id={`${item.label}_heading`}>{item.label}:</div>
                  <div id={`${item.label}_value`} style={{ paddingLeft: 5 }}>
                    {getValue(item)}
                  </div>
                </div>
              ))}
                          <div                   style={{
                    display: 'flex',
                    flexDirection: 'row',
                    fontSize: 14,
                    color: palette.grey[800],
                    fontFamily: 'Poppins',
                  }}>
            <div id="Paid on_heading">Paid:</div>
            <div id="Paid on_value" style={{paddingLeft:5}}>${(getPaidAmount({invoicePaymentList})).toFixed(2)}</div>
            </div>
            </div>
          </div>
        </div>
        <div
          id="dueAmount"
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'end',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: `1px solid ${palette.grey[400]}`,
              padding: 10,
              alignItems: 'center',
              borderRadius: 4,
              marginTop: 10,
            }}
          >
            <div
              id="amountDueHeading"
              style={{
                fontSize: 14,
                color: palette.grey[800],
              }}
            >
              Amount Due
            </div>
            <div
              id="amountDueValue"
              style={{
                fontSize: 19,
                fontWeight: 600,
                color: palette.grey[800],
              }}
            >
              <Currency />
              {(getDueAmount(invoiceDetails, invoicePaymentList)).toFixed(2)}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 10,
            border: `1px solid ${palette.grey[400]}`,
          }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                color: palette.primary.main,
                fontWeight: 600,
                fontFamily: 'Poppins',
                marginBottom: 5,
              }}
            >
              Items
            </div>
            {ItemsTable({
              invoiceDetails,
              tableHeadings: itemsTableHeadings,
              showTotalAmount: true,
            })}
          </div>

          {invoicePaymentList?.results?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div
                style={{
                  color: palette.primary.main,
                  fontWeight: 600,
                  fontFamily: 'Poppins',
                  marginBottom: 5,
                }}
              >
                Payments
              </div>
              {PaymentItemsTable({
                invoicePaymentDetails: invoicePaymentList,
                tableHeadings: paymentTableHeadings,
              })}
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '30px',
          }}
        >
          <CustomButton
            variant="secondary"
            onClick={modalCloseAction}
            label="Cancel"
          />

          {showPaymentButton()}
        </div>
        {isPaymentInvoiceModalVisible && (
          <Modal
            open={isPaymentInvoiceModalVisible}
            onClose={toggleModal}
            header={{
              title: 'Invoice Payment',
              showCloseIcon: isPatient,
            }}
          >
            {isPatient ? (
              <Checkout
                modalCloseAction={toggleModal}
                patientData={patientData}
                invoiceId={selectedInvoice?.id}
                dueAmount={getDueAmount(invoiceDetails, invoicePaymentList)}
              />
            ) : (
              <InvoicePayment
                modalCloseAction={toggleModal}
                patientData={patientData}
                selectedInvoice={invoiceDetails}
                dueAmount={getDueAmount(invoiceDetails, invoicePaymentList)}
              />
            )}
          </Modal>
        )}
      </div>
    </Container>
  );
};

export default ViewInvoice;
