import { useParams } from 'react-router-dom';

import { API_URL, BASE_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import { dateFormats, formStatus } from 'src/lib/constants';
import { downloadPdf, getFullName } from 'src/lib/utils';

import Table from 'src/components/Table';
import Typography from 'src/components/Typography';

import useAuthUser from 'src/hooks/useAuthUser';

import { CardContent } from '@mui/material';
import { useMemo } from 'react';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { decrypt } from 'src/lib/encryption';
import palette from 'src/theme/palette';


const QuestionnairesTable = ({ type='FT_QUESTIONNAIRES',onSClick=()=>{},onOClick=()=>{},onAClick=()=>{},onPClick=()=>{} }) => {
  const [userData] = useAuthUser();

  const params = useParams();
  let patientId = params?.patientId || userData?.id;
  if(params.patientId){
    patientId= decrypt(patientId);
  }

  const formColumns =  useMemo(() => {

    return [
      {
        label: 'Form Name',
        type: 'text',
        dataKey: 'formData.name',
        maxWidth: '7rem',
        render: ({ data }) => {
          const { patientFormSubmission } = data || {};
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{data?.formData?.name}</span>
            </div>
          );
        },
      },
  
      {
        label: 'Form Category',
        type: 'text',
        dataKey: 'formData.formCategory.name',
        maxWidth: '15rem',
      },
      {
        label: 'Practitioner',
        type: 'text',
        dataKey: 'practitionerId',
        maxWidth: '15rem',
        render:({data})=><TableTextRendrer>{getFullName(data?.practitioner || {})}</TableTextRendrer>
      },
      {
        label: 'Shared At',
        type: 'date',
        dataKey: 'createdAt',
        format: dateFormats.MMMDDYYYYHHMMSS,
        maxWidth: '15rem',
      },
      {
        label: 'Status',
        type: 'text',
        dataKey: 'status',
        maxWidth: '10rem',
        render: ({ data }) => {
          let parsedFormStatus = data?.status;
          if (data?.formData?.formType?.code === 'FT_NOTE_TEMPLATES') {
            if (data?.status === formStatus.SENT) {
              parsedFormStatus = 'Pending';
            }else if(data?.status === formStatus.COMPLETE && data?.sharedWith){
              parsedFormStatus ="Sent"
            }
             else if (data?.status === formStatus.COMPLETE || data?.status === formStatus.PARTIAL) {
              parsedFormStatus = 'Draft';
            }
          }
          return <Typography>{parsedFormStatus}</Typography>;
        },
      },
      {
          label: 'Status',
          type: 'text',
          dataKey: 'status',
          maxWidth: '10rem',
          render: ({ data }) => {
           return <div style={{display:'flex',flexDirection:'row',gap:5}}>
              <div className='hover' onClick={()=>onSClick(data)} style={{padding:5,borderRadius:4,border:`1px solid ${palette.border.main}`}}>S</div>
              <div className='hover' onClick={()=>onOClick(data)} style={{padding:5,borderRadius:4,border:`1px solid ${palette.border.main}`}}>O</div>
              <div className='hover' onClick={()=>onAClick(data)} style={{padding:5,borderRadius:4,border:`1px solid ${palette.border.main}`}}>A</div>
              <div className='hover' onClick={()=>onPClick(data)} style={{padding:5,borderRadius:4,border:`1px solid ${palette.border.main}`}}>P</div>
  
            </div>
            
          },
        },
    ];
  },[]);

  const [
    sharedFormList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    ,
    ,
    sort,
    handleSort,
  ] = useQuery({
    listId: 'PATIENT_SHARED_FORMS_LIST',
    url: API_URL.sharedFormList,
    type: REQUEST_METHOD.get,
    queryParams: {
      patientId: patientId,
      formTypeCode: type,
    },
    subscribeSocket:true,
  });


  const moreActions = [
    {
      label: 'Download',
      icon: 'download',
      action: (row) => {
        if (row?.id)
          downloadPdf(
            `/${API_URL.downloadPatientFormPDF}/${row?.id}`
          );
      },
    },
  ];
  return (
    <CardContent>
      <Table
        loading={loading}
        data={sharedFormList?.results || sharedFormList}
        totalCount={sharedFormList?.totalResults}
        columns={formColumns}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        sort={sort}
        handleSort={handleSort}
        wrapperStyle={{ overflow: 'auto',border:'none' }}
        timezone
        itemStyle={{ textTransform: 'capitalize' }}
        actionButtons={moreActions}
      />

    </CardContent>
  );
};

export default QuestionnairesTable;
