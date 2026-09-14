import { Card, Divider, Grid, Typography } from '@mui/material';
import { convertWithTimezone, getFullName } from "src/lib/utils";
import { dateFormats, regTextArea, requiredField, successMessage, cardType} from 'src/lib/constants';
import Table from 'src/components/Table';
import Box from '@mui/material/Box'
import TableTextRendrer from 'src/components/TableTextRendrer';



const EncounterInfo = ({ encounterResponse, defaultData}) => {
  const billing = encounterResponse?.billing;
    const dignoColumn = [
      {
        label: 'Rank',
        type: 'text',
        dataKey: 'formData.name',
        render: ({ index, data }) => {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{index + 1}</span>
            </div>
          );
        },
      },
      {
        label: 'Diagnosis Description',
        type: 'text',
        dataKey: 'description',
      },
      {
        label: 'ICD-10/snomedCT',
        type: 'text',
        dataKey: 'name',
      },
    ]
    const column = [
        {
          label: 'Index',
          type: 'text',
          dataKey: 'id',
          render: ({ index, data }) => (
              <TableTextRendrer>
                {index + 1}
              </TableTextRendrer>
          ),
        },
        {
          label: 'CPT Code',
          type: 'text',
          dataKey: 'cptCode',
        },
        {
          label: 'Name',
          type: 'text',
          dataKey: 'name',
          render: ({ data }) => (
            <TableTextRendrer>
              {data?.name}
            </TableTextRendrer>
          ),
        },
        {
          label: 'Description',
          type: 'text',
          dataKey: 'description',
        },
        {
          type: 'text',
          name: 'serviceDate',
          label: 'Date Of Service',
          format: dateFormats.MMDDYYYY,
          sx: { width: '100px' },
          render: ({data}) =>(
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
              {(
                (data?.addOnFields?.serviceDate && convertWithTimezone(data?.addOnFields?.serviceDate, {
                  format: dateFormats.MMDDYYYY,
                })) 
                || (data?.addOnFields?.serviceDa && convertWithTimezone(data?.addOnFields?.serviceDa, {
                  format: dateFormats.MMDDYYYY,
                })) 
                || 'N/A'
              )}
              {/* {(data?.addOnFields?.serviceDate || data?.addOnFields?.serviceDa) || 'N/A'}   */}
            </TableTextRendrer>
          )
        },
        {
          name: 'qty',
          type: 'number',
          textLabel: 'Volume',
          label: 'Volume',
          placeholder: '',
          sx: { width: '60px' },
          render: ({data}) =>(
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
              {data?.addOnFields?.qty || 'N/A'}  
            </TableTextRendrer>
          )
        },
        {
          label: "Qualifier 1",
          type: "text",
          dataKey: "modifier1",
          sx: { width: "60px" },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.modifier1}</TableTextRendrer>,
        },
        {
          label: "Qualifier 2",
          type: "text",
          dataKey: "modifier2",
          sx: { width: "60px" },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.modifier2}</TableTextRendrer>,
        },
        {
          label: "Qualifier 3",
          type: "text",
          dataKey: "modifier3",
          sx: { width: "60px" },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.modifier3}</TableTextRendrer>,
        },
        {
          label: "Qualifier 4",
          type: "text",
          dataKey: "modifier4",
          sx: { width: "60px" },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.modifier4}</TableTextRendrer>,
        },
        {
          inputType: 'text',
          type: 'number',
          name: 'discPer',
          label: 'Disc',

          textLabel: '',
          sx: { width: '80px', marginRight: '4px' },
          maxLength: { value: 4 },
          placeholder: ' ',
          InputProps: { endAdornment: '%' },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.discPer || 0}</TableTextRendrer>,
        },
        {
          inputType: 'text',
          type: 'number',
          name: 'discAmt',
          label: 'Disc Amt',

          textLabel: '',
          sx: { width: '100px', marginRight: '4px' },
          maxLength: { value: 4 },
          placeholder: ' ',
          InputProps: { endAdornment: '$' },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.discAmt}</TableTextRendrer>,
        },
        {
          inputType: 'text',
          type: 'number',
          name: 'taxPer',
          label: 'Tax',

          textLabel: '',
          sx: { width: '80px', marginRight: '4px' },
          maxLength: { value: 4 },
          placeholder: ' ',
          InputProps: { endAdornment: '%' },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.taxPer}</TableTextRendrer>,
        },
        {
          inputType: 'text',
          type: 'number',
          name: 'taxAmt',
          label: 'Tax Amt',

          textLabel: '',
          sx: { width: '100px', marginRight: '4px' },
          maxLength: { value: 4 },
          placeholder: ' ',
          InputProps: { endAdornment: '$' },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.taxAmt}</TableTextRendrer>,
        },
        {
          type: 'number',
          name: 'price',
          label: 'Cost',
          placeholder: ' ',
          sx: { width: '70px' },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.price}</TableTextRendrer>,
        },
        {
          type: 'number',
          name: 'total',
          label: 'Total',
          placeholder: ' ',
          sx: { width: '70px' },
          render: ({ data }) => <TableTextRendrer>{data?.addOnFields?.total}</TableTextRendrer>,
        },
      ]

    return (
        <div
          style={{
            // display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #E8E8E8',
            padding: '10px',
            gap: '10px',
            borderRadius: '8px',
            width: '100%',
          }}
        >
        {/* Invoice Header */}
            <Box textAlign="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">Invoice</Typography>
                <Typography variant="body2">Date: {
                    convertWithTimezone(defaultData?.createdAt, { format: dateFormats.MMDDYYYY }) || new Date().toLocaleDateString()}
                </Typography>
            </Box>

            {/* Patient & Encounter Details */}
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="body2"><strong>Encounter Type :</strong> {encounterResponse?.encounterType?.name || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Encounter Start :</strong> {encounterResponse?.startDate && convertWithTimezone(encounterResponse?.startDate, { format: dateFormats.hhmmA }) || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body2"><strong>Billing Type :</strong> {encounterResponse?.billingType?.name || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Encounter End :</strong> {encounterResponse?.endDate && convertWithTimezone(encounterResponse?.endDate, { format: dateFormats.hhmmA }) || 'N/A'}</Typography>
                </Grid>
            </Grid>
            <Grid container spacing={2} mt={2}>
                <Grid item xs={6}>
                    <Typography variant="body2"><strong>Encounter Assign To :</strong> {getFullName(encounterResponse?.assignedTo) || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body2"><strong>Duration :</strong> {encounterResponse?.duration || 'N/A'}</Typography>
                </Grid>
            </Grid>
            <Grid container spacing={2} mt={2}>
                <Grid item xs={6}>
                    <Typography variant="body2"><strong>Blling Provider :</strong> {getFullName(encounterResponse?.billing?.primaryProvider) || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Date of Visit :</strong> {billing?.visitDate && convertWithTimezone(encounterResponse?.visitDate, { format: dateFormats.MMDDYYYY }) || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body2"><strong>Billing Reference Provider :</strong> {getFullName(encounterResponse?.billing?.referenceProvider) || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Location :</strong> {encounterResponse?.location || 'N/A'}</Typography>
                </Grid>
            </Grid>

            {/* Diagnosis Code Table */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ maxHeight: '400px', overflowY: 'auto', borderRadius: 2, border: '1px solid #E8E8E8' }}>
              <Table
                headerComponent={
                  <Typography variant="h6" sx={{ marginBottom: 2 }}>Encounter Diagnosis</Typography>
                }
                data={encounterResponse?.billing?.encounterDiagnosis
                  || []}
                columns={dignoColumn}
              />
            </Box>      
            {/* Procedure Code Table */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ maxHeight: '400px', overflowY: 'auto', borderRadius: 2, border: '1px solid #E8E8E8' }}>
              <Table
                headerComponent={
                  <Typography variant="h6" sx={{ marginBottom: 2 }}>Encounter Procedure Codes</Typography>
                }
                data={encounterResponse?.billing?.encounterProcedureCodes || []}
                columns={column}
              />
            </Box>
            {encounterResponse?.billingTypeCode !== "insurance_billing_Type" && (
              <Grid container spacing={2} mt={2}>
                  <Grid item xs={6}>
                      <Typography variant="body2"><strong>Card Type : </strong> 
                      {cardType?.find(type => type.value === billing?.cardType)?.name || 'N/A'}
                      </Typography>
                  </Grid>
                  <Grid item xs={6}>
                      <Typography variant="body2"><strong>Card Last 4 Digits :</strong> {billing?.cardNo || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                      <Typography variant="body2"><strong>Date of Payment :</strong> {billing?.paymentDate && convertWithTimezone(billing?.paymentDate, { format: dateFormats.MMDDYYYY }) || 'N/A'}</Typography>
                  </Grid>
              </Grid>
            )}
        </div>
    )

}

export default EncounterInfo;