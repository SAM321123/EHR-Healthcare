import { isEmpty } from 'lodash';
import React from 'react';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import { dateFormats } from 'src/lib/constants';
import {
  convertWithTimezone,
  formatPhoneNumber,
  getDateDiff,
  getFullName,
} from 'src/lib/utils';
import EncounterDiagnosisTable from 'src/pages/MedicalBilling/diagnosisTable';
import ProcedureCodeTable from 'src/pages/MedicalBilling/procedureCodeTable';

const ViewEncounterDetails = ({ viewEncounterData }) => {
  const columns = [
    {
      label: 'Sub Total',
      type: 'text',
      dataKey: 'subTotal',
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

  const data = [
    {
      subTotal: viewEncounterData?.encounterBilling?.subTotal,
      insuranceSubmittedAmount:
        viewEncounterData?.encounterBilling?.insuranceSubmittedAmount,
      total: viewEncounterData?.encounterBilling?.total,
    },
  ];
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

  return (
    <Container style={{ margin: '20px' }}>
      {/* <div style={styles.header}>
        <span
          style={{
            backgroundColor: `${viewEncounterData?.status?.colorCode}`,
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            padding: '4px 12px',
            borderRadius: '12px',
          }}
        >
          {viewEncounterData?.status?.name}
        </span>
        <span style={styles.claimId}>
          Claim ID: <strong>{viewEncounterData?.claimId || 'N/A'}</strong>
        </span>
        <span style={styles.claimId}>
          Encounter ID: <strong>{`EN${viewEncounterData?.encounterId}`}</strong>
        </span>
      </div>
      {!isEmpty(viewEncounterData?.errors) && (
        <div>
          <div style={styles.errorBanner}>
            <span style={{ marginRight: '8px' }}></span> You need to fix{' '}
            {viewEncounterData?.errors?.length} errors
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>CODE</th>
                  <th style={styles.tableHeader}>DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {viewEncounterData?.errors?.map((error) => (
                  <tr style={styles.tableRow}>
                    <td style={styles.codeCell}>{error?.code}</td>
                    <td>{error?.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}
      {/* <div style={{ marginTop: '8px' }}>
        <div style={styles.patientTitle}>Patient Details</div>
        <div style={styles.patientContainer}>
          <div style={styles.patientInfo}>
            <strong>Name:</strong> {getFullName(viewClaimData?.patient)}
          </div>
          <div style={styles.patientInfo}>
            <strong>Phone:</strong>{' '}
            {formatPhoneNumber(viewClaimData?.patient?.phone)}
          </div>
          <div style={styles.patientInfo}>
            <strong>Sex:</strong> {viewClaimData?.patient?.sexAtBirth?.name}
          </div>
          <div style={styles.patientInfo}>
            <strong>Age:</strong>{' '}
            {getDateDiff(viewClaimData?.patient?.dob, new Date(), {
              unit: 'years',
            })}{' '}
            Yrs
          </div>
          <div style={styles.patientInfo}>
            <strong>Address:</strong>{' '}
            {[
              viewClaimData?.patient?.address?.description,
              viewClaimData?.patient?.address?.postalCode,
            ]
              .filter(Boolean)
              .join(', ')}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '8px' }}>
        <div style={styles.patientTitle}>Insurance Details</div>
        <div style={styles.patientContainer}>
          <div style={styles.patientInfo}>
            <strong>Name of Insured:</strong>{' '}
            {getFullName(viewClaimData?.encounterBilling?.insurance)}
          </div>
          <div style={styles.patientInfo}>
            <strong>Insurance Policy Holder:</strong>{' '}
            {viewClaimData?.encounterBilling?.insurance?.insurancePolicy?.name}
          </div>
          <div style={styles.patientInfo}>
            <strong>Insurance ID:</strong>{' '}
            {viewClaimData?.encounterBilling?.insurance?.insuranceId}
          </div>
          <div style={styles.patientInfo}>
            <strong>Insurance Company Name:</strong>{' '}
            {viewClaimData?.encounterBilling?.insurance?.insuranceCompanyName}
          </div>
          <div style={styles.patientInfo}>
            <strong>Insured Relationship to Patient:</strong>{' '}
            {viewClaimData?.encounterBilling?.insurance?.insuredRelationship}
          </div>
          <div style={styles.patientInfo}>
            <strong>Insurance Payer ID:</strong>{' '}
            {viewClaimData?.encounterBilling?.insurance?.payerData?.payerId}
          </div>
          <div style={styles.patientInfo}>
            <strong>Insurance Payer Name:</strong>{' '}
            {viewClaimData?.encounterBilling?.insurance?.payerData?.payerName}
          </div>
        </div>
      </div> */}
      <div style={{ marginTop: '16px' }}>
        <div style={styles.patientContainer}>
          <div style={styles.patientInfo}>
            <strong>Encounter Assign To:</strong>{' '}
            {getFullName(
              viewEncounterData?.encounterBilling?.encounter?.assignedTo
            )}
          </div>
          <div style={styles.patientInfo}>
            <strong>Duration:</strong>{' '}
            {viewEncounterData?.encounterBilling?.encounter?.duration || 'N/A'}
          </div>
          <div style={styles.patientInfo}>
            <strong>Start Time:</strong>{' '}
            {convertWithTimezone(
              viewEncounterData?.encounterBilling?.encounter?.startDate,
              {
                format: dateFormats.hhmmA,
              }
            ) || 'N/A'}
          </div>
          <div style={styles.patientInfo}>
            <strong>End Time:</strong>{' '}
            {convertWithTimezone(
              viewEncounterData?.encounterBilling?.encounter?.endDate,
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
            {getFullName(viewEncounterData?.encounterBilling?.primaryProvider)}
          </div>
          <div style={styles.patientInfo}>
            <strong>Reference Provider:</strong>{' '}
            {getFullName(viewEncounterData?.encounterBilling?.referenceProvider) || 'N/A'}
            {/* {viewEncounterData?.encounterBilling?.referenceProvider || 'N/A'} */}
          </div>
          <div style={styles.patientInfo}>
            <strong>Procedure:</strong>{' '}
            {viewEncounterData?.encounterBilling?.procedureCodeType ===
            'standardProcedureCode'
              ? 'Standard Procedure Code'
              : 'Custom Procedure Code'}
          </div>
          <div style={styles.patientInfo}>
            <strong>Billing Type:</strong>{' '}
            {viewEncounterData?.encounterBilling?.encounter?.billingType?.name}
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
            viewEncounterData?.encounterBilling?.encounterDiagnosis
          }
        />
      </div>
      <div style={{ marginTop: '16px' }}>
        <ProcedureCodeTable
          procedureCodeData={
            viewEncounterData?.encounterBilling?.encounterProcedureCodes
          }
        />
      </div>
    </Container>
  );
};

export default ViewEncounterDetails;
