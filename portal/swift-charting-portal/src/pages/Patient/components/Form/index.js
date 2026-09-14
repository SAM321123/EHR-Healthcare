import React, { useCallback, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import WarningIcon from '@mui/icons-material/Warning';

import useQuery from 'src/hooks/useQuery';
import { getUserRole, downloadPdf, triggerEvents, getFullName } from 'src/lib/utils';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { API_URL, BASE_URL, REQUEST_METHOD } from 'src/api/constants';
import { dateFormats, faxType, formStatus, roleTypes } from 'src/lib/constants';

import Table from 'src/components/Table';
import FilterComponents from 'src/components/FilterComponents';
import Typography from 'src/components/Typography';

import useAuthUser from 'src/hooks/useAuthUser';
import usePatientDetail from 'src/hooks/usePatientDetail';

import isEmpty from 'lodash/isEmpty';
import SharedForm from './sharedForm';
import PatientTags from '../PatientTags';
import NoteTempModal from './noteTempModal';
import ShareAndFaxModal from '../ShareAndFaxModal';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { decrypt } from 'src/lib/encryption';

export const formColumns = ({ userData }) => {
  const userRole = getUserRole();
  return [
    {
      label: 'Form Name',
      type: 'text',
      dataKey: 'formData.name',
      maxWidth: '7rem',
      render: ({ data }) => {
        const { patientFormSubmission } = data || {};
        const { tags } = patientFormSubmission || {};
        const showWarningIcon =
          data?.status === formStatus.COMPLETE &&
          ((userRole === roleTypes.assistant &&
            data?.hasPendingAssistantSignature &&
            userData?.id === data?.assistant?.id) ||
            (userRole === roleTypes.practitioner &&
              data?.hasPendingPractitionerSignature &&
              userData?.id === data?.practitioner?.id));
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{data?.formData?.name}</span>
            {showWarningIcon && (
              <Tooltip title="Your Signature is Pending">
                <WarningIcon style={{ fontSize: '16px', color: 'orange' }} />
              </Tooltip>
            )}
            {tags && <PatientTags tags={tags} />}
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
  ];
};
const PatientFormList = ({ type }) => {
  const [userData] = useAuthUser();
  const [isSharedFormVisible, setIsSharedFormVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState({});  
  const params = useParams();
  const navigate = useNavigate();
  let patientId = params?.patientId || userData?.id;
  if(params.patientId){
    patientId= decrypt(patientId);
  }
  const [patientData] = usePatientDetail({ patientId });

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

  const handleSharedFormModalVisbility = useCallback(() => {
    setIsSharedFormVisible(!isSharedFormVisible);
  }, [isSharedFormVisible]);

  const FilterCollectionHeader = FilterComponents({
    rightComponents: [
      {
        type: 'fabButton',
        style: { ml: 2, minWidth: '38px' },
        onClick: handleSharedFormModalVisbility,
      },
    ],
  });

  const handleRowClick = useCallback(
    (data) => {
      navigate(
        generatePath(UI_ROUTES.editPatientForm, {
          ...params,
          formId: data?.id,
        })
      );
    },
    [navigate, params]
  );

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
  if (type === 'FT_NOTE_TEMPLATES') {
    moreActions.push({
      label: 'Share',
      icon: 'share',
      action: (row) => {
        if (row?.id) setSelectedForm(row);
      },
    });
  }
  const closeShareAndFaxModal = ()=>{
    setSelectedForm({});
  }

  const onRefershShareAndFaxModal =()=>{
    triggerEvents(`REFRESH-TABLE-PATIENT_SHARED_FORMS_LIST`);

  }
  return (
    <>
      <Table
        loading={loading}
        headerComponent={<FilterCollectionHeader />}
        data={sharedFormList?.results || sharedFormList}
        totalCount={sharedFormList?.totalResults}
        columns={formColumns({ userData })}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        sort={sort}
        handleSort={handleSort}
        onRowClick={handleRowClick}
        wrapperStyle={{ overflow: 'auto' }}
        timezone
        itemStyle={{ textTransform: 'capitalize' }}
        actionButtons={moreActions}
      />
      {isSharedFormVisible && (
        <SharedForm
          isVisible={isSharedFormVisible}
          selectedFormType={type}
          handleSharedFormModalVisbility={handleSharedFormModalVisbility}
          selectedPatient={patientData}
          user={userData}
        />
      )}
      {!isEmpty(selectedForm) && (
        <ShareAndFaxModal
          data={selectedForm}
          onClose={closeShareAndFaxModal}
          url={`${API_URL.shareNoteTemplate}/${selectedForm?.id}`}
          faxType={faxType.PATIENT_FORM}
          onRefersh={onRefershShareAndFaxModal}
          title="Share Note"

        />
      )}
    </>
  );
};

export default PatientFormList;
