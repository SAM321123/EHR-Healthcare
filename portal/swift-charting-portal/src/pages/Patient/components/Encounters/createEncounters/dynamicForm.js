import { debounce, isEmpty } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import useReduxState from 'src/hooks/useReduxState';
import BuilderPreview from 'src/pages/FormBuilder/NewForm/BuilderPreview'

const cardStyle={boxShadow:'none'};
const cardContentStyle={padding:0};

const DynamicForm = ({questions,id}) => {
  
  const [,setDynamicFormData] = useReduxState(`Patient_Encounter-Form-Data-Dynamic-From`);

  const [formDefaultData] = useReduxState(`Patient_Encounter-Form-Default-Data`);


  const form = useForm({ mode: 'onChange' });
  const { watch } = form;
  const [formGroups, setFormGroups] = useState([]);

  const formValuesRef = useRef();

  const handleSaveOnlyForm = useCallback(
    debounce(() => {
      setDynamicFormData((prevData) => ({
        ...(prevData || {}),
          [id]: formValuesRef.current,
        }
      ))}, 300), // Adjust the debounce delay as needed
    [setDynamicFormData, id]
  );

  useEffect(() => {
    const subscription = watch((value) => {
      if (!isEmpty(value)) {
        formValuesRef.current = form.getValues();
        handleSaveOnlyForm();
      }
    });
    return () => subscription.unsubscribe();
  }, [handleSaveOnlyForm, watch]);


  useEffect(() => {
    if (!isEmpty(questions)) {
      setFormGroups(
        JSON.parse(questions || '[]')
      );
    }
  }, [questions]);

  const defaultSubmissionValue = useMemo(() => {
    if(!isEmpty(formDefaultData?.dynamicForms?.[id])){
      if(typeof formDefaultData.dynamicForms[id]==='string'){
      return JSON.parse(formDefaultData.dynamicForms[id] || '{}')
      }
      return formDefaultData.dynamicForms[id] || {}
    }
        return {};
    }, [formDefaultData, id]);

  return (
    <div> <BuilderPreview
    form={form}
    formGroups={formGroups}
    setFormGroups={setFormGroups}
    defaultValue={defaultSubmissionValue}
    cardStyle={cardStyle}
    cardContentStyle={cardContentStyle}

  /></div>
  )
}

export default React.memo(DynamicForm)