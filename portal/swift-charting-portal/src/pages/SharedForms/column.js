import Typography from "src/components/Typography";

const sharedFormColumns = [
  {
    label: 'Patient Name',
    type: 'text',
    dataKey: 'patient.name',
    sort: true,
  },
  {
    label: 'Form Category',
    type: 'text',
    dataKey: 'formData.formCategory.name',
  },
  
  {
    label: 'Status',
    type: 'text',
    dataKey: 'status',
    render: ({ data }) => {
      let parsedFormStatus = data?.status;
      if (data?.formData?.formType?.code === 'FT_NOTE_TEMPLATES') {
        if (data?.status === "Sent") {
          parsedFormStatus = 'Pending';
        } 
        else if(data?.status === 'Complete' && data?.sharedWith){
          parsedFormStatus ="Sent"
        }
        else if (data?.status === "Complete" || data?.status === 'Partial') {
          parsedFormStatus = 'Draft';
        }
      }
      return <Typography>{parsedFormStatus}</Typography>;
    },
  },
];

export default sharedFormColumns;
