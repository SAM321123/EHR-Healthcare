/* eslint-disable no-unused-vars */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { ENCOUNTER_DATA } from 'src/store/types';
import Container from 'src/components/Container';
import { convertWithTimezone, getFullName } from 'src/lib/utils';
import { dateFormats } from 'src/lib/constants';
import Table from 'src/components/Table';
import EncounterDiagnosisTable from 'src/pages/MedicalBilling/diagnosisTable';
import ProcedureCodeTable from 'src/pages/MedicalBilling/procedureCodeTable';


const EncounterViewModal = ({ 
  modalCloseAction, 
  encounterId, 
}) => {

    const [
      encounterResponse,
      ,
      loading,
      callGetInvoiceAPI,
      clearInvoiceData,
    ] = useCRUD({
      id: `${ENCOUNTER_DATA}-${encounterId}`,
      url:`${API_URL.patientEncounterInfo}/${encounterId}`,
      type: REQUEST_METHOD.get,
    });

    useEffect(() => {
        callGetInvoiceAPI();
    }, [])

 const paymentType = encounterResponse?.paymentType;

    let invoicePaymentType;
    if(paymentType === 'payInvoiceInFull'){
        invoicePaymentType = 'Pay Invoice in Full';
    } else if(paymentType === 'partialPayment'){
        invoicePaymentType = 'Partial Payment';
    }else{
        invoicePaymentType = 'N/A';
    }

  const styles = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    claimId: {
      color: '#374151',
      fontWeight: '600',
    },
    buttonsContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '12px',
    },
    button: {
      padding: '4px 12px',
      fontSize: '14px',
      fontWeight: '500',
      borderBottom: '2px solid transparent',
      cursor: 'pointer',
    },
    activeButton: {
      color: '#2563eb',
      borderBottomColor: '#2563eb',
    },
    errorBanner: {
      backgroundColor: '#FF0000',
      color: 'white',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
    },
    tableContainer: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginTop: '12px',
    },
    table: {
      width: '100%',
      textAlign: 'left',
      color: '#374151',
    },
    tableHeader: {
      borderBottom: '1px solid #d1d5db',
      paddingBottom: '8px',
      fontSize: '14px',
      fontWeight: '600',
    },
    tableRow: {
      borderBottom: '1px solid #d1d5db',
      padding: '8px 0',
    },
    codeCell: {
      fontWeight: '600',
      color: '#FF0000',
    },
    patientDetails: {
      marginTop: '16px',
      backgroundColor: '#ffffff',
      padding: '16px',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    patientTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px',
    },
    patientInfo: {
      fontSize: '14px',
      color: '#374151',
    },
    patientContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
  };

  const data = [
    {
      subTotal: encounterResponse?.billing?.subTotal || 0,
      tip: encounterResponse?.billing?.tip || 0,
      insuranceSubmittedAmount: encounterResponse?.billing?.insuranceSubmittedAmount || 0,
      total: encounterResponse?.billing?.total || 0,
    },
  ];
  const columns = [
    {
      label: 'Sub Total',
      type: 'text',
      dataKey: 'subTotal',
    },
    {
      label: 'Tip',
      type: 'text',
      dataKey: 'tip',
    },
    {
      label: 'Insurance Submitted Amount',
      type: 'text',
      dataKey: 'insuranceSubmittedAmount',
      maxWidth: '10rem',
    },
    {
      label: 'Total',
      type: 'text',
      dataKey: 'total',
      maxWidth: '10rem',
    },
  ];

  return (
    <Container style={{ margin: '20px' }}>
      <div style={{ marginTop: '16px' }}>
        <div style={styles.patientContainer}>
          <div style={styles.patientInfo}>
            <strong>Encounter Assign To:</strong>{' '}
            {getFullName(encounterResponse?.assignedTo)}
          </div>
          <div style={styles.patientInfo}>
            <strong>Duration:</strong>{' '}
            {encounterResponse?.duration || 'N/A'}
          </div>
          <div style={styles.patientInfo}>
            <strong>Start Time:</strong>{' '}
            {convertWithTimezone(
                encounterResponse?.startDate,
              {
                format: dateFormats.hhmmA,
              }
            ) || 'N/A'}
          </div>
          <div style={styles.patientInfo}>
            <strong>End Time:</strong>{' '}
            {convertWithTimezone(
              encounterResponse?.endDate,
              {
                format: dateFormats.hhmmA,
              }
            ) || 'N/A'}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '16px' }}>
        <div style={styles.patientContainer}>
          <div style={styles.patientInfo}>
            <strong>Billing Provider:</strong>{' '}
            {getFullName(encounterResponse?.billing?.primaryProvider)}
          </div>
          <div style={styles.patientInfo}>
            <strong>Reference Provider:</strong>{' '}
            {getFullName(encounterResponse?.billing?.referenceProvider) || 'N/A'}
            {/* {encounterResponse?.billing?.referenceProvider || 'N/A'} */}
          </div>
          <div style={styles.patientInfo}>
            <strong>Procedure:</strong>{' '}
            {encounterResponse?.billing?.procedureCodeType ===
            'standardProcedureCode'
              ? 'Standard Procedure Code'
              : 'Custom Procedure Code'}
          </div>
          <div style={styles.patientInfo}>
            <strong>Billing Type:</strong>{' '}
            {encounterResponse?.billingType?.name}
          </div>
        </div>
        <div>
          <Table
            data={data || []}
            columns={columns}
            wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
          />
        </div>
      </div>
      <div style={{ marginTop: '16px' }}>
        <EncounterDiagnosisTable
          diagnosisData={
            encounterResponse?.billing?.encounterDiagnosis
          }
        />
      </div>
      <div style={{ marginTop: '16px' }}>
        <ProcedureCodeTable
          procedureCodeData={
            encounterResponse?.billing?.encounterProcedureCodes
          }
        />
      </div>
    </Container>
  );
};

export default EncounterViewModal;
