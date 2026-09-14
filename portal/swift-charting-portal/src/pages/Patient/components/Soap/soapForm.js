import { debounce, isEmpty } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import Typography from 'src/components/Typography';
import useCRUD from 'src/hooks/useCRUD';
import useReduxState from 'src/hooks/useReduxState';
import MemoForm from './memoForm';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import QuestionnairesTable from './questionnairesTable';
import ModalComponent from 'src/components/modal';
import { genrateFormData } from './formParser';
import RecentNotesTable from './recentNotesTable';
import { decodeHtml } from 'src/lib/utils';


const SoapForm = () => {
  const [showQuestionnaires,setShowQuestionnaires] = useState(false);
  const [showRecentNotes ,setshowRecentNotes] = useState(false);
  const subjectiveEditorRef = useRef(null);
  const objectiveEditorRef = useRef(null);
  const assessmentEditorRef = useRef(null);
  const planEditorRef = useRef(null);
  const [,setSoapFormData] = useReduxState(`Patient_Encounter-Form-Data-SOAP-Form-Data`,{});
  const [formDefaultData] = useReduxState(`Patient_Encounter-Form-Default-Data`);
  const formValuesRef = useRef({});

  const [
    soapNoteTemplates,
    ,
    ,
    getSoapNoteTemplates,
    ,
  ] = useCRUD({
    id: `soap_note_templates`,
    url: `${API_URL.getMasters}/soap_note_template`,
    type: REQUEST_METHOD.get,
  });

  const form = useForm({ mode: 'onChange' });
  const {watch} = form || {};

  const getSubjectiveEditor = (editor) => {
    subjectiveEditorRef.current = editor;
  };

  const getObjectiveEditor = (editor) => {
    objectiveEditorRef.current = editor;
  };
  const getAssessmentEditor = (editor) => {
    assessmentEditorRef.current = editor;
  };
  const getPlanEditor = (editor) => {
    planEditorRef.current = editor;
  };

  useEffect(() => {
    getSoapNoteTemplates();
  }, [getSoapNoteTemplates]);

  const defaultSubmissionValue = useMemo(() => {
    if(!isEmpty(formDefaultData?.soapForm)){
      return formDefaultData.soapForm
    }
        return {};
    }, [formDefaultData]);
    
  const showTemplateForSubjective = useCallback((data) => {
    if (data.subjectiveTemplateCode) {
      const selectedSoapNoteTemplate =
        soapNoteTemplates?.results?.find(
          (item) => item.code === data.subjectiveTemplateCode
        ) || {};
      return {
        hide: false,
        reFetch: true,
        options: selectedSoapNoteTemplate?.metaData || [],
      };
    }
    return { hide: true };
  },[soapNoteTemplates]);

  const showTemplateForObjective = useCallback((data) => {
    if (data.objectiveTemplateCode) {
      const selectedSoapNoteTemplate =
        soapNoteTemplates?.results?.find(
          (item) => item.code === data.objectiveTemplateCode
        ) || {};
      return {
        hide: false,
        reFetch: true,
        options: selectedSoapNoteTemplate?.metaData || [],
      };
    }
    return { hide: true };
  },[soapNoteTemplates]);

  const showTemplateForAssesment = useCallback((data) => {
    if (data.assessmentTemplateCode) {
      const selectedSoapNoteTemplate =
        soapNoteTemplates?.results?.find(
          (item) => item.code === data.assessmentTemplateCode
        ) || {};
      return {
        hide: false,
        reFetch: true,
        options: selectedSoapNoteTemplate?.metaData || [],
      };
    }
    return { hide: true };
  },[soapNoteTemplates]);

  const showTemplateForPlan = useCallback((data) => {
    if (data.planTemplateCode) {
      const selectedSoapNoteTemplate =
        soapNoteTemplates?.results?.find(
          (item) => item.code === data.planTemplateCode
        ) || {};
      return {
        hide: false,
        reFetch: true,
        options: selectedSoapNoteTemplate?.metaData || [],
      };
    }
    return { hide: true };
  },[soapNoteTemplates]);


  const handleSaveOnlyForm = useCallback(
    debounce(() => {
      setSoapFormData(()=>(formValuesRef.current));
    }, 300), // Adjust the debounce delay as needed
    []
  );

  useEffect(() => {
    const subscription = watch((value, { type }) => {
        if (!isEmpty(value)) {
          formValuesRef.current = form.getValues();
          handleSaveOnlyForm();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const closeQuestionnairesModal = ()=>{
    setShowQuestionnaires(false);
  };
  const closeRecentNotesModal = ()=>{
    setshowRecentNotes(false);
  };
  const formGropus =useMemo(()=> [
    {
      component: () => <Typography  style={{ fontWeight: 600, fontSize: 15 }}>Subjective Note</Typography>,
    },
    {
      inputType: 'wiredSelect',
      filter: { limit: 20 },
      name: 'subjectiveTemplateCode',
      labelAccessor: 'name',
      valueAccessor: 'code',
      colSpan: 0.5,
      placeholder: 'Customized Templates',
      options: soapNoteTemplates?.results || [],
      url:null,
    },
    {
      component: ({ options = [] } = {}) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 5,
                whiteSpace: 'nowrap',
              }}
            >
              <div
                className="hover"
                onClick={() => {
                  subjectiveEditorRef.current.insertHeading(`${item.label}: `);
                }}
              >
                <Typography
                  style={{ fontWeight: 600, fontSize: 15 }}
                >{`${item.label}: `}</Typography>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                {item.options.map((_item, index) => (
                  <React.Fragment key={_item}>
                    <div
                      className="hover"
                      onClick={() => {
                        subjectiveEditorRef.current.insertContent(`${_item}, `);
                      }}
                    >
                      <Typography style={{ fontSize: 14 }}>{_item}</Typography>
                    </div>
                    {index < item.options.length - 1 && (
                      <Typography style={{ fontSize: 14 }}> | </Typography>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
      dependencies: {
        keys: ['subjectiveTemplateCode'],
        calc: showTemplateForSubjective,
      },
    },
    {
      inputType: 'editor',
      name: 'subjective',
      getEditorOnReady: getSubjectiveEditor,
    },

    // Objective

    {
      component: () => <Typography  style={{ fontWeight: 600, fontSize: 15 }}>Objective Note</Typography>,
    },
    {
        inputType: 'wiredSelect',
        filter: { limit: 20 },
        name: 'objectiveTemplateCode',
        labelAccessor: 'name',
        valueAccessor: 'code',
        colSpan: 0.5,
        placeholder: 'Customized Templates',
        url:null,
        options: soapNoteTemplates?.results || [],
      },
      {
        component: ({ options = [] } = {}) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {options.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 5,
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  className="hover"
                  onClick={() => {
                    objectiveEditorRef.current.insertHeading(`${item.label}: `);
                  }}
                >
                  <Typography
                    style={{ fontWeight: 600, fontSize: 15 }}
                  >{`${item.label}: `}</Typography>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  {item.options.map((_item, index) => (
                    <React.Fragment key={_item}>
                      <div
                        className="hover"
                        onClick={() => {
                          objectiveEditorRef.current.insertContent(`${_item}, `);
                        }}
                      >
                        <Typography style={{ fontSize: 14 }}>{_item}</Typography>
                      </div>
                      {index < item.options.length - 1 && (
                        <Typography style={{ fontSize: 14 }}> | </Typography>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ),
        dependencies: {
          keys: ['objectiveTemplateCode'],
          calc: showTemplateForObjective,
        },
      },
    {
      inputType: 'editor',
      name: 'objective',
      getEditorOnReady: getObjectiveEditor,
    },

    // Assessment

    {
      component: () => <Typography  style={{ fontWeight: 600, fontSize: 15 }}>Assessment Note</Typography>,
    },
    {
        inputType: 'wiredSelect',
        filter: { limit: 20 },
        name: 'assessmentTemplateCode',
        labelAccessor: 'name',
        valueAccessor: 'code',
        colSpan: 0.5,
        placeholder: 'Customized Templates',
        options: soapNoteTemplates?.results || [],
        url:null,
      },
      {
        component: ({ options = [] } = {}) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {options.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 5,
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  className="hover"
                  onClick={() => {
                    assessmentEditorRef.current.insertHeading(`${item.label}: `);
                  }}
                >
                  <Typography
                    style={{ fontWeight: 600, fontSize: 15 }}
                  >{`${item.label}: `}</Typography>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  {item.options.map((_item, index) => (
                    <React.Fragment key={_item}>
                      <div
                        className="hover"
                        onClick={() => {
                          assessmentEditorRef.current.insertContent(`${_item}, `);
                        }}
                      >
                        <Typography style={{ fontSize: 14 }}>{_item}</Typography>
                      </div>
                      {index < item.options.length - 1 && (
                        <Typography style={{ fontSize: 14 }}> | </Typography>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ),
        dependencies: {
          keys: ['assessmentTemplateCode'],
          calc: showTemplateForAssesment,
        },
      },
    {
      inputType: 'editor',
      name: 'assessment',
      getEditorOnReady: getAssessmentEditor,
    },

    // Paln

    {
      component: () => <Typography  style={{ fontWeight: 600, fontSize: 15 }}>Plan Note</Typography>,
    },
    {
        inputType: 'wiredSelect',
        filter: { limit: 20 },
        name: 'planTemplateCode',
        labelAccessor: 'name',
        valueAccessor: 'code',
        colSpan: 0.5,
        placeholder: 'Customized Templates',
        options: soapNoteTemplates?.results || [],
        url:null,
      },
      {
        component: ({ options = [] } = {}) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {options.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 5,
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  className="hover"
                  onClick={() => {
                    planEditorRef.current.insertHeading(`${item.label}: `);
                  }}
                >
                  <Typography
                    style={{ fontWeight: 600, fontSize: 15 }}
                  >{`${item.label}: `}</Typography>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  {item.options.map((_item, index) => (
                    <React.Fragment key={_item}>
                      <div
                        className="hover"
                        onClick={() => {
                            planEditorRef.current.insertContent(`${_item}, `);
                        }}
                      >
                        <Typography style={{ fontSize: 14 }}>{_item}</Typography>
                      </div>
                      {index < item.options.length - 1 && (
                        <Typography style={{ fontSize: 14 }}> | </Typography>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ),
        dependencies: {
          keys: ['planTemplateCode'],
          calc: showTemplateForPlan,
        },
      },
    {
      inputType: 'editor',
      name: 'plan',
      getEditorOnReady: getPlanEditor,
    },
  ],[showTemplateForAssesment, showTemplateForObjective, showTemplateForPlan, showTemplateForSubjective, soapNoteTemplates]);

  const onSoapClick = (data) => {
    const fields = ['subjective', 'objective', 'assessment', 'plan'];
  
    fields.forEach((field) => {
      const decodedTemp = data?.soapForm?.[field] ? decodeHtml(data.soapForm[field]) : ''; 
      const oldValue = form.getValues(field) || ''; 
      form.setValue(field, oldValue + decodedTemp, { shouldValidate: true });
    });
  
    closeRecentNotesModal();
  };
  const onSClick = (data)=>{
    let temp = genrateFormData({questions:JSON.parse(data?.formData?.questions || '[]'),rules:[],answers:{}});
    const oldValue = form.getValues('subjective');
    if(oldValue){
      temp = oldValue+ temp;
    }
    form.setValue('subjective',temp,{shouldValidate:true})
    closeQuestionnairesModal()
  }
  const onOClick = (data)=>{
    let temp = genrateFormData({questions:JSON.parse(data?.formData?.questions || '[]'),rules:[],answers:{}});
    const oldValue = form.getValues('objective');

    if(oldValue){
      temp = oldValue+ temp;
    }
    form.setValue('objective', temp,{shouldValidate:true})
    closeQuestionnairesModal()
  }
  const onAClick = (data)=>{
    let temp = genrateFormData({questions:JSON.parse(data?.formData?.questions || '[]'),rules:[],answers:{}});
    const oldValue = form.getValues('assessment');
    if(oldValue){
      temp = oldValue+ temp;
    }
    form.setValue('assessment', temp,{shouldValidate:true})
    closeQuestionnairesModal()
  }
  const onPClick = (data)=>{
    let temp = genrateFormData({questions:JSON.parse(data?.formData?.questions || '[]'),rules:[],answers:{}});
    const oldValue = form.getValues('plan');
    if(oldValue){
      temp = oldValue+ temp;
    }
    form.setValue('plan', temp,{shouldValidate:true})
    closeQuestionnairesModal()
  }
  return (
    <Container>
      <div style={{display: 'flex', gap: '1em'}}>
          <LoadingButton
          variant="outlinedSecondary"
          onClick={()=>setShowQuestionnaires(true)}
          label="Questionnaire"
          sx={{height:30,borderRadius:20}}
        />
         <LoadingButton
          variant="outlinedSecondary"
          onClick={()=>setshowRecentNotes(true)}
          label="Recent Notes"
          sx={{height:30,borderRadius:20}}
        />
        </div>
          
        <div style={{marginTop:30}}>
          <MemoForm form={form} defaultSubmissionValue={defaultSubmissionValue} formGropus={formGropus} />
      </div>
      { showQuestionnaires && <ModalComponent
      open={showQuestionnaires}
      header={{
        title: 'Show Questionnaires',
        closeIconAction: closeQuestionnairesModal,
      }}
      modalStyle={{width:'100%'}}
    >
     <QuestionnairesTable onSClick={onSClick} onOClick={onOClick} onAClick={onAClick} onPClick={onPClick}/>
    </ModalComponent>
    }
     { showRecentNotes && <ModalComponent
      open={showRecentNotes}
      header={{
        title: 'Recent Notes',
        closeIconAction: closeRecentNotesModal,
      }}
      modalStyle={{width:'100%'}}
    >
      <RecentNotesTable onSoapClick={onSoapClick}/>
    </ModalComponent>
    }
    </Container>
  );
};

export default SoapForm;
