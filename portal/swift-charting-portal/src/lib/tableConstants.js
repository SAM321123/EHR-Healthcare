/* eslint-disable jsx-a11y/img-redundant-alt */
import { API_URL } from 'src/api/constants';
import Switch from 'src/wiredComponent/Switch';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { dateFormats, directionCodeType, frequencyCodeType, routeCodeType } from './constants';
import { canculateEmarTimePeriod, convertWithTimezone, dateFormatter, getDateDiff, getFullName, getImageUrl } from './utils';
import userIcon from 'src/assets/images/user.png';
import TableDropDown from 'src/wiredComponent/DropDown';
import { join } from 'lodash';
import { Box, Grid, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

const ASSISTANT_COLUMNS = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'firstName',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => `${data?.firstName} ${data?.lastName}`,
  },
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
    maxWidth: '15rem',
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    width: '10px',
    api: API_URL.assistant,
    render: ({ data }) => <Switch rowData={data} api={API_URL.assistant} />,
  },
  {
    label: '',
  },
];
const PRACTITIONER_COLUMNS = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'firstName',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => `${data?.firstName} ${data?.lastName}`,
  },
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
    maxWidth: '15rem',
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    width: '10px',
    render: ({ data }) => <Switch rowData={data} api={API_URL.practitioner} />,
  },
  {
    label: '',
  },
];
const CLINIC_ADMIN_COLUMNS = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
    render: ({ data }) => (
      <TableTextRendrer>
        {getFullName(data || {})}
      </TableTextRendrer>
    )
  },
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
    maxWidth: '15rem',
  },
  // {
  //   label: 'Status',
  //   dataKey: 'isActive',
  //   type: 'boolean',
  //   activeData: 'Active',
  //   inActiveData: 'InActive',
  //   api: API_URL.clinicAdmin,
  //   width: '10px',
  //   render: ({ data }) => <Switch rowData={data} api={API_URL.clinicAdmin} />,
  // },
  // {
  //   label: 'Contact',
  //   type: 'text',
  //   dataKey: 'email',
  //   maxWidth: '15rem',
  // },
];
const CLINIC_COLUMNS = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
    maxWidth: '10rem',
  },
  {
    label: 'Address',
    dataKey: 'address.description',
    type: 'text',
    maxWidth: '14rem',
  },
  // {
  //   label: 'Team',
  //   dataKey: 'team',
  //   type: 'text',
  //   maxWidth: '3rem',
  // },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    width: '2rem',
  },
  {
    label: '',
  },
];
const PATIENT_COLUMNS = [
  {
    label: 'ID',
    type: 'text',
    dataKey: 'id',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Md Toolbox ID',
    type: 'text',
    dataKey: 'mdToolboxPatientId',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>{data?.mdToolboxPatientId || 'N/A'}</TableTextRendrer>
    ),
  },
  {
    label: 'Patient Name',
    type: 'text',
    dataKey: 'firstName',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => (
      <Grid container spacing={1} style={{alignItems: 'center'}}>
        <Grid item xs={6} sm={6} md={4} >
      <img
          style={{
            height: 32,
            width: 32,
            borderRadius: 50,
            objectFit: 'cover',
            filter: 'opacity(0.5)',
          }}
          src={data?.file?.file ? getImageUrl(data?.file?.file) : userIcon}
          alt="patient image"
        />

        </Grid>
        <Grid item xs={6} sm={6} md={8}>
      <TableTextRendrer style={{ maxWidth: '10rem' }}>
        {getFullName(data || {})}
      </TableTextRendrer>

        </Grid>
      </Grid>
    ),
  },
  {
    label: 'Age',
    type: 'text',
    dataKey: 'dob',
    maxWidth: '10rem',
    sort: true,
    render: ({ data }) => (
      <TableTextRendrer>
        {getDateDiff(data.dob, new Date(), { unit: 'years' })}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Gender',
    type: 'text',
    dataKey: 'genderIdentityCode',
    maxWidth: '10rem',
    render: ({ data }) => {
      let displayText = '';

      if (data?.genderIdentityCode) {
        if (data.genderIdentityCode === 'another_gender_identity') {
          displayText =
            data?.anotherGenderIdentity || data?.genderIdentity?.name;
        } else {
          displayText = data?.genderIdentity?.name;
        }
      } else {
        displayText =
          data?.sexAtBirthCode === 'gender_at_birth_other'
            ? data?.otherSexAtBirth || data?.sexAtBirth?.name
            : data?.sexAtBirth?.name;
      }

      return <TableTextRendrer>{displayText || 'N/A'}</TableTextRendrer>;
    },
  },
  {
    label: 'Problems',
    type: 'text',
    dataKey: 'id',
    maxWidth: '10rem',
    render: ({ data }) => {
      const firstThreeProblems = data.problems.slice(0, 3);
      const firstThreeICDNames = firstThreeProblems
        .map(
          (problem) =>
            `${problem?.ICD?.name}${
              problem?.ICD?.description ? ` (${problem?.ICD?.description})` : ''
            }`
        )
        .join(', ');
      return (
        <TableTextRendrer style={{ maxWidth: '10rem' }}>
          {firstThreeICDNames || 'N/A'}
        </TableTextRendrer>
      );
    },
  },
    {
    label: '2FA',
    dataKey: 'twoFaEnable',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    width: '2rem',
  },
  {
    label: 'Enrolled Date',
    dataKey: 'createdAt',
    type: 'date',
    sort: true,
    format: dateFormats.MMDDYYYY,
  },
  {
    label: 'Provider',
    type: 'text',
    dataKey: 'primaryProviderId',
    maxWidth: '10rem',
    sort: true,
    render: ({ data }) => (
      <TableTextRendrer>{getFullName(data?.primaryProvider)}</TableTextRendrer>
    ),
  },
];
const MEDICATION_ADMINISTRATION = [
  {
    label: 'Medications',
    maxWidth: '6rem',
    type: 'text',
    render: ({ data }) => {
      const title = `${data?.medicationItem?.genericDrug} (${data?.medicationItem?.brandNameDrug})`;
      return (
        <TableTextRendrer title={title} style={{ maxWidth: '20rem' }}>
          {title}
        </TableTextRendrer>
      );
    },
  },
  {
    label: 'Patient Name',
    type: 'text',
    dataKey: 'medicationItem.medication.patient.firstName',
    maxWidth: '10rem',
    render: ({ data }) => {
      const patientName = data.medicationItem.medication.patient;
      return <TableTextRendrer>{getFullName(patientName)}</TableTextRendrer>;
    },
  },
  {
    label: 'Date',
    type: 'date',
    dataKey: 'slotDate',
    format: dateFormats.MMDDYYYY,
    maxWidth: '10rem',
  },
  {
    label: 'Schedule Time',
    type: 'date',
    dataKey: 'slotDate',
    format: dateFormats.hhmmA,
  },
  {
    label: 'EMAR Time',
    type: 'date',
    dataKey: 'date',
    format: dateFormats.hhmmA,
  },
  {
    label: 'EMAR Status',
    type: 'text',
    dataKey: 'actionCode',
    maxWidth: '10rem',
    render: ({ data }) => {
      const timePeriod = canculateEmarTimePeriod(data?.actionCode , data?.date, data?.slotDate)
      return (
        <TableTextRendrer style={{ maxWidth: '20rem' }}>
          {timePeriod
            ? `${data?.action?.name} (${timePeriod})`
            : `${data?.action?.name}`}
        </TableTextRendrer>
      );
    },
  },
];

const MEDICATION_HISTORY = [
  {
    label: 'Patient Name',
    type: 'text',
    dataKey: 'medication.patient.firstName',
    maxWidth: '10rem',
    render: ({ data }) => {
      const patientName = data.medication.patient;
      return <TableTextRendrer>{getFullName(patientName)}</TableTextRendrer>;
    },
  },
  {
    label: 'Medication',
    type: 'text',
    render: ({ data }) => {
      const title = `${data.genericDrug} (${data.brandNameDrug})`;
      return (
        <TableTextRendrer style={{ maxWidth: '12rem' }}>
          {title}
        </TableTextRendrer>
      );
    },
    maxWidth: '10rem',
  },
  {
    label: 'Reason for Changes',
    type: 'text',
    dataKey: 'reasonForChanges',
    maxWidth: '10rem',
    render: ({ data }) => {
      const reasonForChanges = data.reasonForChanges || 'N/A';
      return <TableTextRendrer>{reasonForChanges}</TableTextRendrer>;
    },
  },
  {
    label: 'Prescribed By',
    type: 'text',
    dataKey: 'medication.prescribedBy.firstName',
    maxWidth: '10rem',
    render: ({ data }) => {
      const prescribedBy = data.medication.prescribedBy;
      return <TableTextRendrer>{getFullName(prescribedBy)}</TableTextRendrer>;
    },
  },
  {
    label: 'Revised By',
    type: 'text',
    dataKey: 'medication.revisedBy.firstName',
    maxWidth: '10rem',
    render: ({ data }) => {
      const revisedBy = data.medication.revisedBy;
      return <TableTextRendrer>{getFullName(revisedBy)}</TableTextRendrer>;
    },
  },
  {
    label: 'Dosage Form',
    type: 'text',
    dataKey: 'doseForm.name',
    width: '20rem',
  },
  {
    label: 'Amount',
    type: 'text',
    dataKey: 'amount',
    maxWidth: '10rem',
  },
  {
    label: 'Unit',
    type: 'text',
    dataKey: 'unit.name',
    maxWidth: '10rem',
  },
  {
    label: 'Route',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title =
        data?.route?.code === routeCodeType.OTHER
          ? `${data?.routeOther} (Other)`
          : data?.route?.name;
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Frequency',
    type: 'text',
    dataKey: 'frequency.name',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title =
        data?.frequency?.code === frequencyCodeType.OTHER
          ? `${data?.frequencyOther} (Other)`
          : data?.frequency?.name;
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Direction',
    type: 'text',
    dataKey: 'direction.name',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title =
        data?.direction?.code === directionCodeType.OTHER
          ? `${data?.directionOther} (Other)`
          : data?.direction?.name;
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Duration',
    type: 'text',
    dataKey: 'durationAmount',
    maxWidth: '10rem',
  },
  {
    label: 'Duration Unit',
    type: 'text',
    dataKey: 'duration.name',
    maxWidth: '10rem',
  },
  {
    label: 'Reason Rx',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data?.diagnoses
        ?.map(
          (item) =>
            `${item?.icd?.name} ${
              item?.icd?.description ? `(${item?.icd?.description})` : ''
            }`
        )
        .join(', ');
      return (
        <TableTextRendrer style={{ maxWidth: '10rem' }}>
          {title || 'N/A'}
        </TableTextRendrer>
      );
    },
  },
  {
    label: 'Reason Rx (Other)',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data?.diagnosesOther?.map((item) => `${item}`).join(', ');
      return (
        <TableTextRendrer style={{ maxWidth: '10rem' }}>
          {title || 'N/A'}
        </TableTextRendrer>
      );
    },
  },
  {
    label: 'Quantity',
    type: 'text',
    dataKey: 'quantity',
    maxWidth: '10rem',
  },
  {
    label: 'Refill',
    type: 'text',
    dataKey: 'refill',
    maxWidth: '10rem',
  },
  {
    label: 'Medication Status',
    type: 'text',
    dataKey: 'medicineStatus.name',
    maxWidth: '10rem',
  },
  {
    label: 'Medication Status Reason',
    type: 'text',
    dataKey: 'medicineStatus.medicineStatusReason',
    maxWidth: '10rem',
  },
  {
    label: 'Start On',
    type: 'date',
    dataKey: 'startDate',
    format: dateFormats.MMDDYYYY,
    maxWidth: '10rem',
  },
  {
    label: 'Dispense as Written',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.dispenseAsWritten ? 'Yes' : 'No';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Substitutions Permitted',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.substitutions ? 'Yes' : 'No';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Patient-specific Instructions',
    type: 'text',
    dataKey: 'patientSpecificInstructions',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.patientSpecificInstructions || 'N/A';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Allergies/Warnings',
    type: 'text',
    dataKey: 'allergiesWarnings',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.allergiesWarnings || 'N/A';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Additional Note',
    type: 'text',
    dataKey: 'additionalInstruction',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.additionalInstruction || 'N/A';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  }
 
];
const MEDICATION_ERROR_RATES = [
  {
    label: 'Prescriber',
    type: 'text',
    dataKey: 'medication.prescriber.firstName',
    maxWidth: '10rem',
    render: ({ data }) => {
      const prescriberName = data.medication.prescriber;
      return <TableTextRendrer>{getFullName(prescriberName)}</TableTextRendrer>;
    },
  },
  {
    label: 'Patient Name',
    type: 'text',
    dataKey: 'medication.patient.firstName',
    maxWidth: '10rem',
    render: ({ data }) => {
      const patientName = data.medication.patient;
      return <TableTextRendrer>{getFullName(patientName)}</TableTextRendrer>;
    },
  },
  {
    label: 'Medication',
    type: 'text',
    render: ({ data }) => {
      const title = `${data.genericDrug} (${data.brandNameDrug})`;
      return (
        <TableTextRendrer style={{ maxWidth: '12rem' }}>
          {title}
        </TableTextRendrer>
      );
    },
    maxWidth: '10rem',
  },
  {
    label: 'Total Error',
    type: 'text',
    render: ({ data }) => {
      const incorrectCount = data?.marLogs?.filter(mar => mar.actionCode === 'incorrect');
      return (
        <TableTextRendrer style={{ maxWidth: '12rem' }}>
          {incorrectCount?.length}
        </TableTextRendrer>
      );
    },
    maxWidth: '10rem',
  },
  {
    label: 'Error Rate',
    type: 'text',
    render: ({ data }) => {
      const incorrectCount = data?.marLogs?.filter(mar => mar.actionCode === 'incorrect');
      const totalEmarCount = data?.marLogs
      const errorRate = ((incorrectCount?.length / totalEmarCount?.length) * 100).toFixed(2)
      return (
        <TableTextRendrer style={{ maxWidth: '12rem' }}>
          {`${errorRate}%` || `N/A`}
        </TableTextRendrer>
      );
    },
    maxWidth: '10rem',
  },
]
const DOSE_FREQUENCY_COLUMN = [
  {
    label: 'Patient Name',
    type: 'text',
    dataKey: 'patient.firstName',
    maxWidth: '10rem',
    render: ({ data }) => {
      const patientName = data.patient;
      return <TableTextRendrer>{getFullName(patientName)}</TableTextRendrer>;
    },
  },
  {
    label: 'Medicine',
    type: 'text',
    render: ({ data }) => {
      const title = `${data.genericDrug} (${data.brandNameDrug})`;
      return (
        <TableTextRendrer style={{ maxWidth: '12rem' }}>
          {title}
        </TableTextRendrer>
      );
    },
    maxWidth: '10rem',
  },
  {
    label: 'Frequency Of Unit Adjustment',
    type: 'text',
    dataKey: 'frequencyOfUnitCodeChanges',
    maxWidth: '10rem',
  },
  {
    label: 'Frequency Of Amount Adjustment',
    type: 'text',
    dataKey: 'frequencyOfAmountChanges',
    maxWidth: '10rem',
  },
]
const STAFF_COLUMNS = [
  {
    label: 'ID',
    type: 'text',
    dataKey: 'id',
    sort: true,
  },
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    render: ({ data }) => (
      <div style={{ display: 'flex', gap: 3.89, alignItems: 'center' }}>
        <img
          style={{
            height: 32,
            width: 32,
            borderRadius: 50,
            objectFit: 'cover',
            filter: 'opacity(0.5)',
          }}
          src={data?.file?.file ? getImageUrl(data?.file?.file) : userIcon}
          alt="patient image"
        />
        <TableTextRendrer>{getFullName(data)}</TableTextRendrer>
      </div>
    ),
  },
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
  },
  {
    label: 'Role',
    type: 'text',
    dataKey: 'roleId',
    render: ({ data }) => {
      console.log('data', data, data?.user);
      const roles = data?.user?.roles?.map((role) => role?.name).join(', ');
      return (
        <TableTextRendrer>{roles || 'No roles assigned'}</TableTextRendrer>
      );
    },
  },
  {
    label: 'Prescriber',
    dataKey: 'isPrescriber',
    type: 'boolean',
    render: ({ data }) => {
      return (
        <Box
          sx={{
            padding: 2,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: 'fit-content'
          }}
        >
          {data?.isPrescriber ? <CheckCircleOutline color="success" /> : <CheckCircleOutline color="disabled" />}
        </Box>
      )
    }
  },
   {
    label: '2FA',
    dataKey: 'twoFaEnable',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    width: '2rem',
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    width: '2rem',
  },
];

const BLOCKED_USER_COLUMN = [
  {
    label: 'ID',
    type: 'text',
    dataKey: 'id',
    sort: true,
  },
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    render: ({ data }) => (
      <div style={{ display: 'flex', gap: 3.89, alignItems: 'center' }}>
        <img
          style={{
            height: 32,
            width: 32,
            borderRadius: 50,
            objectFit: 'cover',
            filter: 'opacity(0.5)',
          }}
          src={data?.file?.file ? getImageUrl(data?.file?.file) : userIcon}
          alt="patient image"
        />
        <TableTextRendrer>{getFullName(data)}</TableTextRendrer>
      </div>
    ),
  },
  {
    label: 'Email',
    type: 'text',
    dataKey: 'email',
  },
  {
    label: 'Blocked Date',
    type: 'date',
    dataKey: 'blockedDateTime',
    format: dateFormats.MMDDYYYY,
  },
  {
    label: 'Blocked Time',
    type: 'date',
    dataKey: 'blockedDateTime',
    format: dateFormats.hhmmA,
  },
  {
    label: 'Role',
    type: 'text',
    dataKey: 'roleId',
    render: ({ data }) => {
      const roles = data?.roles?.map((role) => role?.name).join(', ');
      return (
        <TableTextRendrer>{roles || 'No roles assigned'}</TableTextRendrer>
      );
    },
  },
];

const INVOICE_COLUMNS = [
  {
    label: 'Invoice #',
    type: 'text',
    dataKey: 'invoiceNumber',
    maxWidth: '5rem',
    sort: true,
  },
  {
    label: 'Description',
    type: 'text',
    dataKey: 'note',
    maxWidth: '14rem',
  },
  {
    label: 'Due Date',
    dataKey: 'dueDate',
    type: 'date',
    format: dateFormats.MMDDYYYY,
  },
  {
    label: 'Status',
    dataKey: 'status',
    type: 'chips',
    labelAccessor: 'status',
  },
  {
    label: 'Amount',
    dataKey: 'invoiceAmount',
    type: 'text',
  },
];
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
    render: ({ data }) => (
      <TableTextRendrer style={{ maxWidth: '8rem' }}>
        {getFullName(data.patient || {})}
      </TableTextRendrer>
    ),
  },

  {
    label: 'Prescriber',
    type: 'text',
    dataKey: 'providerId',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer style={{ maxWidth: '8rem' }}>
        {getFullName(data.provider || {})}
      </TableTextRendrer>
    ),
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
    render: ({ data }) => (
      <TableTextRendrer style={{ maxWidth: '12rem' }}>
        {data?.laboratoryTests
          ?.map(
            (item) =>
              `${item.name} ( CPT: ${item.cptCode} LOINC: ${item.loincCode}) - ${item?.description}`
          )
          ?.join(',') || 'N/A'}
      </TableTextRendrer>
    ),
  },
  // {
  //   label: 'Status',
  //   dataKey: 'statusCode',
  //   type: 'text',
  //   sort: true,
  //   render: ({ data }) => (
  //     <>
  //       <TableDropDown
  //         data={data?.status || {}}
  //         id={data?.id}
  //         api={`${API_URL.labsRadiology}/${data.id}`}
  //         code="status_code"
  //         dataKey="statusCode"
  //       />
  //     </>
  //   ),
  // },
];

const ALLERGIES_COLUMNS = [
  {
    label: 'Allergent',
    type: 'text',
    dataKey: 'allergy',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Severity',
    type: 'text',
    dataKey: 'severities.name',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Reaction',
    type: 'text',
    dataKey: 'reaction.name',
    maxWidth: '10rem',
    sort: true,
    render: ({ data }) => (
      <TableTextRendrer>
        {join(
          data?.reactions?.map((item) => item.name),
          ','
        )}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Date Onset',
    dataKey: 'dateOfOnSet',
    type: 'date',
    sort: true,
    format: dateFormats.MMDDYYYY,
  },
];

const MEDICATION_COLUMNS = [
  {
    label: 'Medication',
    maxWidth: '6rem',
    type: 'text',
    render: ({ data }) => {
      const title = data?.items
        ?.map(
          (item) => `${item?.genericDrug?.name} (${item?.brandNameDrug?.name})`
        )
        .join(', ');
      return (
        <TableTextRendrer title={title} style={{ maxWidth: '20rem' }}>
          {title}
        </TableTextRendrer>
      );
    },
  },
  {
    label: 'Prescriber',
    type: 'number',
    render: ({ data }) => (
      <TableTextRendrer style={{ maxWidth: '15rem' }}>
        {getFullName(data?.prescriber)}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Created on',
    type: 'date',
    dataKey: 'createdAt',
    format: dateFormats.MMMDDYYYYHHMMSS,
    sort: true,
    maxWidth: '10rem',
  },
];

const DIAGNOSIS_COLUMN = [
  {
    label: 'Diagnosis',
    type: 'text',
    dataKey: 'problem.name',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Diagnosis Description',
    type: 'text',
    dataKey: 'problem.description',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'ICD10',
    type: 'text',
    dataKey: 'ICD.name',
    maxWidth: '10rem',
    sort: true,
    render: ({ data }) => {
      return (
        <TableTextRendrer style={{ maxWidth: '15rem' }}>{`${data?.ICD?.name}${
          data?.ICD?.description ? ` (${data?.ICD?.description})` : ''
        }`}</TableTextRendrer>
      );
    },
  },
  {
    label: 'Type',
    dataKey: 'type.name',
    type: 'text',
    sort: true,
  },
  {
    label: 'Comments',
    dataKey: 'comments',
    type: 'text',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Last Edited',
    dataKey: 'updatedAt',
    sort: true,
    render: ({ data }) => (
      <div>
        <TableTextRendrer>
          {dateFormatter(data.updatedAt, dateFormats.MMDDYYYYhhmmA)}
        </TableTextRendrer>
        <TableTextRendrer>
          {getFullName(data.updatedBy || data.createdBy)}
        </TableTextRendrer>
      </div>
    ),
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'text',
    sort: true,
    render: ({ data }) => (
      <>
        <TableDropDown
          data={data.status || {}}
          id={data.id}
          api={`${API_URL.diagnosis}/${data.id}`}
          code="diagnosis_status"
          dataKey="statusCode"
        />
      </>
    ),
  },
];

const VITALS_COLUMN = [
  {
    label: 'Blood Pressure',
    type: 'text',
    dataKey: 'bpMM',
    sort: true,
    maxWidth: '4rem',
    render: ({ data }) =>
      !!data.bpMM &&
      !!data.bphg && (
        <TableTextRendrer>{`${data.bpMM}/${data.bphg} mm/Hg`}</TableTextRendrer>
      ),
  },
  {
    label: 'Heart Rate',
    type: 'text',
    dataKey: 'heartRate',
    sort: true,
    maxWidth: '5rem',
    render: ({ data }) =>
      !!data.heartRate && (
        <TableTextRendrer>{`${data.heartRate} bpm`}</TableTextRendrer>
      ),
  },
  {
    label: 'Respiratory Rate',
    type: 'text',
    dataKey: 'respiratoryRate',
    sort: true,
    maxWidth: '6rem',
    render: ({ data }) =>
      !!data.respiratoryRate && (
        <TableTextRendrer>{`${data.respiratoryRate} bpm`}</TableTextRendrer>
      ),
  },
  {
    label: 'Temperature',
    type: 'text',
    dataKey: 'tempreature',
    sort: true,
    maxWidth: '5rem',
    render: ({ data }) =>
      !!data.tempreature && (
        <TableTextRendrer>{`${data.tempreature} °C`}</TableTextRendrer>
      ),
  },
  {
    label: 'Height',
    type: 'text',
    dataKey: 'height',
    sort: true,
    maxWidth: '3rem',
    render: ({ data }) => {
      if (!!data.height) {
        let heightInFeet = data.height;
        if (data.heightUnit === 'cm') {
          // Convert height from centimeters to feet and inches
          const feet = Math.floor(data.height / 30.48);
          const inches = Math.round((data.height % 30.48) / 2.54);
          heightInFeet = `${feet}'${inches}"`;
        } else if (data.heightUnit === 'in') {
          // If height unit is in inches, convert it to feet and inches
          const feet = Math.floor(data.height / 12);
          const inches = data.height % 12;
          heightInFeet = `${feet}'${inches}"`;
        } else if (data.heightUnit === 'ft') {
          // If height unit is already in feet, simply display it
          heightInFeet = `${data.height}'`;
        }
        return <TableTextRendrer>{heightInFeet}</TableTextRendrer>;
      }
      return null;
    },
  },
  {
    label: 'Weight',
    type: 'text',
    dataKey: 'weight',
    sort: true,
    maxWidth: '3rem',
    render: ({ data }) =>
      !!data.weight && (
        <TableTextRendrer>{`${data.weight} kg`}</TableTextRendrer>
      ),
  },
  {
    label: 'BMI',
    type: 'text',
    dataKey: 'bmi',
    sort: true,
    maxWidth: '2rem',
    render: ({ data }) =>
      !!data.bmi && <TableTextRendrer>{`${data.bmi}`}</TableTextRendrer>,
  },
  {
    label: 'SPO2',
    type: 'text',
    dataKey: 'spO2',
    sort: true,
    maxWidth: '3rem',
    render: ({ data }) =>
      !!data.spO2 && <TableTextRendrer>{`${data.spO2}%`}</TableTextRendrer>,
  },
  {
    label: 'Recorded',
    dataKey: 'recordDateTime',
    type: 'date',
    sort: true,
    maxWidth: '8rem',
    format: dateFormats.MMDDYYYYhhmmA,
  },
];

export {
  CLINIC_ADMIN_COLUMNS,
  ASSISTANT_COLUMNS,
  PRACTITIONER_COLUMNS,
  CLINIC_COLUMNS,
  PATIENT_COLUMNS,
  INVOICE_COLUMNS,
  LAB_RADIOLOGY_COLUMNS,
  ALLERGIES_COLUMNS,
  MEDICATION_COLUMNS,
  DIAGNOSIS_COLUMN,
  VITALS_COLUMN,
  STAFF_COLUMNS,
  MEDICATION_ADMINISTRATION,
  MEDICATION_HISTORY,
  MEDICATION_ERROR_RATES,
  DOSE_FREQUENCY_COLUMN,
  BLOCKED_USER_COLUMN,
};
