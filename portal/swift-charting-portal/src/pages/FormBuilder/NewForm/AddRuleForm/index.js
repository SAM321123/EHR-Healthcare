/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import ActionButton from 'src/components/ActionButton';
import Modal from 'src/components/modal';
import DropDown from 'src/components/Select';
import CheckboxLabel from 'src/components/Checkbox';
import RadioButton from 'src/components/RadioButton';
import { Iconify } from 'src/components/iconify';
import { showSnackbar } from 'src/lib/utils';
import { isEmpty, get,cloneDeep, isEqual } from 'src/lib/lodash';

import './addRuleForm.scss';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import AutoComplete from 'src/components/Autocomplete';
import useAuthUser from 'src/hooks/useAuthUser';

const AddRuleForm = ({
  handleClose, open, formGroups = [], rules = [], setRules,
}) => {
  const [addButtonHide, setAddButtonHide] = useState(false);
  const [actionInfo, setActionInfo] = useState({});
  const [conditions, setConditions] = useState([{}]);
  const [ruleIndex, setRuleIndex] = useState();
  const [userData] = useAuthUser();
  const {practice} = userData ||{}
  const [tagsData, , , tagsDataFetch] = useCRUD({
    id: 'patient-tags-master-data-fetch',
    type:REQUEST_METHOD.get,
    url: `${API_URL.getMasters}/PATIENT_TAGS`,
  });
  useEffect(()=>{
    tagsDataFetch({practice:practice?.id})
  },[])
  const fieldOptions = useMemo(() => {
    const options = [];
    formGroups?.forEach((section, sectionIndex) => {
      section?.fields?.forEach((row, rowIndex) => {
        row?.forEach((field, fieldIndex) => {
          if (
            field?.inputType === 'radio'
          || field?.inputType === 'checkBox'
          || field?.inputType === 'select'
          || field?.inputType ==='multiSelect'
          || field?.inputType ==='multiChoice'
          ) {
            options.push({
              label: `${sectionIndex + 1}.${rowIndex + 1}.${fieldIndex + 1}-${field?.textLabel}`,
              value:  field?.id,
              field,
              section:sectionIndex
            });
          }
        });
      });
    });
    return options;
  }, [formGroups]);

  const getAllFields = useCallback(() => {
    const options = [];
    formGroups?.forEach((section, sectionIndex) => {
      section?.fields?.forEach((row, rowIndex) => {
        row?.forEach((field, fieldIndex) => {
           if(isEmpty(conditions?.find((item)=>item?.field?.id ===field?.id))){
             options.push({
               label: `${sectionIndex + 1}.${rowIndex + 1}.${fieldIndex + 1}-${field?.textLabel}`,
               value: field,
             });
           }
        });
      });
    });
    return options;
  }, [conditions, formGroups]);

  const form = useForm();

  const handleAddFormGroups = useCallback(() => {
    setAddButtonHide(!addButtonHide);
  }, [addButtonHide]);

  const handleQuestion = useCallback((key, event) => {
    const dataValue = event.target?.value?.split('-');
    
    setActionInfo((newData)=>({
      ...newData,
      applyTo: {...actionInfo?.applyTo,type: dataValue[1]},
      action: dataValue[0],
    }))
  }, [actionInfo.applyTo]);

  const handleChooseAnswers = useCallback((event, data, index) => {
    const newConditions = cloneDeep(conditions)
    if (event?.target?.checked) {
      if(typeof data === 'object'){
        newConditions[index].value = data
      } else {
        newConditions[index].value = {value: data}
      }
    } else {
      newConditions[index].value = undefined
    };
    setConditions([...newConditions]);
  }, [conditions]);

  const handleChooseQuestions = useCallback((event, data = {}, index='') => {
    if (event.target.checked) {
      const value = {...data, section:index+1 }
      setActionInfo((newData) => ({
        ...newData,
        applyTo: {...newData.applyTo, [newData?.applyTo?.type]: [...(newData?.applyTo?.[newData?.applyTo?.type] ||[]),value]},
      }));
    } else {
      let updatedData = []
      if(actionInfo?.applyTo?.type==='field'){
         updatedData = actionInfo.applyTo?.[actionInfo?.applyTo?.type]?.filter((item)=>item.value?.id!==(data?.value?.id || data?.id))
      }else{
        updatedData = actionInfo.applyTo?.[actionInfo?.applyTo?.type]?.filter((item)=>item?.id!==(data?.value?.id || data?.id))
      }
      setActionInfo((newFillConditions) => ({
        ...newFillConditions,
        applyTo: {...newFillConditions.applyTo, [newFillConditions?.applyTo?.type]: updatedData},
      }));
    }
  }, [actionInfo]);

  const getSelectedAnswers = (data = []) => (
    data?.map((item) => (item?.value?.value))
  );

  const getSelectedQuestions = (data = {}) => {
    let selectedAnswers = []
    if(data?.type === 'field'){
      selectedAnswers=  data?.[data?.type].map((item)=>item?.value?.textLabel).join(',') 
    }else if(data?.type==='tag'){
      selectedAnswers=  data?.[data?.type].map((item)=>item?.name).join(',')
    }
    else{
      selectedAnswers=  data?.[data?.type].map((item)=>item?.title || item?.section).join(' , ')
    }
    return selectedAnswers
  };
  const getSelectedQuestionsId = (data = {}) => {
    let selectedAnswers = []
    if(data?.type === 'field'){
      selectedAnswers=  data?.[data?.type].map((item)=>item?.value?.id) ||'options'
    }else{
      selectedAnswers=  data?.[data?.type].map((item)=>item?.id) ||'options'
    }
    return selectedAnswers
  };

  const getSelectedFields = (data = []) => data?.map((item) => (item?.field?.textLabel));
  const getSelectedFieldsId = (data = []) => data?.map((item) => (item?.field?.id));

  const handleAddMore = useCallback(() => () => {
    setConditions([...conditions, {}]);
  }, [conditions]);

  const handleConditions = useCallback((condition, index) => {
    conditions[index + 1].operator = condition?.target?.value;
    setConditions([...conditions])
  }, [conditions]);

  const handleSelectQuestion = useCallback((event, index) => {
    const value = event?.target?.value;
    const selectedField = fieldOptions?.find((option)=>option?.value === value)
    conditions[index].field = selectedField?.field
    conditions[index].section=selectedField?.section
    conditions[index].value = {}
    setConditions([...conditions]);
  }, [conditions, fieldOptions]);

  const handleEditRule = useCallback((index)=>()=>{
    setRuleIndex(index);
    setConditions(rules?.[index]?.conditions);
    setActionInfo({action: rules?.[index]?.action, applyTo: {...rules?.[index]?.applyTo}})
    setAddButtonHide(!addButtonHide)
  }, [addButtonHide, rules]);

  const handleBack = useCallback(()=>{
    setActionInfo({});
    setConditions([{}]);
    setAddButtonHide(false)
    setRuleIndex()
    if(rules.length === 0){
      handleClose();
    }
  }, [handleClose, rules?.length])

  const isConditionsFullfilled = useCallback(()=>{
    let isFullfilled = true;
    conditions.forEach((item)=>{
      if(isEmpty(get(item,'value',[]))){
        isFullfilled=false;
      }
    })
    return isFullfilled;
  },[conditions])

  const isDuplicateRule = useCallback(({existingRules,newRule})=>{
    let isDuplicate = false;
    existingRules?.forEach((item)=>{    
      if(
        item?.action ===newRule?.action &&
        item?.applyTo?.type ===newRule?.applyTo?.type &&
        isEqual(getSelectedQuestionsId(item?.applyTo),getSelectedQuestionsId(newRule?.applyTo)) &&
        isEqual(getSelectedFieldsId(item?.conditions),getSelectedFieldsId(newRule?.conditions)) &&
        isEqual(getSelectedAnswers(item?.conditions),getSelectedAnswers(newRule?.conditions))
        ){
          isDuplicate=true;
        }})
      return isDuplicate;
  },[])

  const handleSave = useCallback(() => {
    const index = ruleIndex >= 0 ? ruleIndex : rules.length;
    const existingRules = [...rules]
    const newRule ={conditions,...actionInfo}
    if(!isDuplicateRule({existingRules:rules,newRule})){
      existingRules[index] = {conditions, ...actionInfo }
      setRules([...existingRules]);
      setAddButtonHide(false);
      setActionInfo({});
      setConditions([{}]);
      setRuleIndex()
    }else{
      showSnackbar({
        message:'Rule already exists',
        severity: 'error',
      });
    }

  }, [ruleIndex, rules, conditions, actionInfo, isDuplicateRule, setRules]);

  const footer = useMemo(
    () => ({
      leftActions: addButtonHide || rules.length === 0 ? [
        {
          name: 'Back',
          variant: 'text',
          action: handleBack,
          style: { boxShadow: 'unset', color: '#303030' },
        },
        {
          name: 'Save',
          action: handleSave,
          disabled: !((conditions?.length 
            && actionInfo?.action 
            && actionInfo?.applyTo?.[actionInfo?.applyTo?.type]?.length))
            || !isConditionsFullfilled(),
          style: { marginRight: 16 },
        },
      ] 
      : [{
        name: 'Close',
        variant: 'text',
        action: handleClose,
        style: { boxShadow: 'unset', color: '#303030' },
      },
    ] ,
    }),
    [actionInfo?.action, actionInfo?.applyTo, addButtonHide, conditions?.length, handleBack, handleClose, handleSave, isConditionsFullfilled, rules.length]
  );
  const handleTagInput = useCallback((data) => {
    setActionInfo({
      ...actionInfo,
      applyTo: {...actionInfo.applyTo, [actionInfo?.applyTo?.type]: data},
    });
}, [actionInfo])

const handleDeleteRules = useCallback(({index})=>{
    rules.splice(index,1)
    setRules([...rules])
},[rules, setRules])

  return (
    <Modal open={open} footer={footer} header={{title:'Rules'}} onClose={handleClose}>
        <div className="add-rules-container">
          {(addButtonHide || rules.length === 0) ? (
            <div className='rules-section'>
              {conditions?.map((question, index) => (
                <div key={question+index}>
                  <div className="field-wrapper">
                    <div className='field-index active' />
                    <div className="rules-list">
                      IF answer to question
                      <DropDown
                        defaultValue={question?.field?.id}
                        valueAccessor= 'value'
                        labelAccessor= 'label'
                        data={fieldOptions}
                        name="answers"
                        fullWidth
                        onChange={(data) => handleSelectQuestion(data, index)}
                      />
                    </div>
                  </div>
                  <div className="field-wrapper">
                    <div className={!isEmpty(conditions?.[index]?.field)
                      ? 'field-index active' : 'field-index'}
                    />
                    <div className="rules-list">
                      EQUALS
                      <div role="presentation" className="list">
                       {!isEmpty(conditions?.[index]) ? conditions?.[index]?.field?.options
                       ? conditions?.[index].field?.options?.map((item) => (
                            <CheckboxLabel
                              checked={question?.value?.value === item?.label}
                              key={item?.label}
                              label={item?.label}
                              onChange={(event) => handleChooseAnswers(event, item, index)}
                            />
                          ))
                        : <CheckboxLabel
                         checked={question?.field?.textLabel === conditions?.[index]?.field?.textLabel}
                          key={conditions?.[index]?.field?.textLabel}
                        label={conditions?.[index]?.field?.textLabel}
                        onChange={(event) => handleChooseAnswers(event, conditions?.[index]?.field?.textLabel, index)}
                      /> : null
                        }
                      </div>
                    </div>
                  </div>
                  {(index+1) === conditions?.length && (
                  <div role='presentation' style={{ cursor: 'pointer', textAlign: 'end' ,marginLeft:'80%'}} onClick={handleAddMore(index)}>
                   Add more
                  </div>
                  )}
                  {(conditions?.length > 1 && (index+1) !== conditions?.length)? (
                    <div style={{ marginLeft: '35%' }}>
                      <RadioButton

                        key={index}
                        defaultValue={conditions[index+1]?.operator}
                        options={[{ label: 'OR', value: 'OR' }, { label: 'AND', value: 'AND' }]}
                        onChange={(condition) => handleConditions(condition, index)}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
              <div className="field-wrapper">
                <div className={!isEmpty(get(conditions, `[${conditions?.length - 1}].value`, []))
                  ? 'field-index active' : 'field-index'}
                />
                <div className="rules-list">
                  THEN
                  <DropDown
                  defaultValue={`${actionInfo?.action}-${actionInfo?.applyTo?.type}`}
                    fullWidth
                    valueAccessor= 'value'
                    labelAccessor= 'label'
                    disabled={!isConditionsFullfilled()}
                    data={[
                      { label: 'hide section', value: 'hide-section' },
                      { label: 'show section', value: 'show-section' },
                      { label: 'show field', value: 'show-field' },
                      { label: 'hide field', value: 'hide-field' },
                      { label: 'add tag', value: 'add-tag' },
                    ]}
                    name="condition"
                    onChange={(data) => handleQuestion('condition', data)}
                  />
                </div>
              </div>
              <div className="field-wrapper">
                <div className={actionInfo?.action
                  ? 'field-index active' : 'field-index'}
                />
                <div className="rules-list">
                  { !isEmpty(actionInfo?.applyTo)
              && `select question to ${actionInfo?.action} ${actionInfo?.applyTo?.type}`}
                  <div className="list">
                    {!isEmpty(actionInfo?.applyTo) && (actionInfo?.applyTo?.type === 'section')
                      ? formGroups?.map(
                        (item, index) => isEmpty(conditions?.find((condition)=>condition?.section ===index)) && (
                      <CheckboxLabel
                      disabled={!isConditionsFullfilled()}
                        defaultChecked={!isEmpty(actionInfo?.applyTo?.[actionInfo?.applyTo?.type]?.find((section)=>section?.id===item?.id))}
                        label={`${index + 1} ${item?.title || ''}`}
                        key={item?.id}
                        onChange={(event) => handleChooseQuestions(event, item,index)}
                      />
                      )
                      ) : !isEmpty(actionInfo?.applyTo) && (actionInfo?.applyTo?.type === 'field') ? (
                        getAllFields()?.map((item) => (
                        <CheckboxLabel
                          disabled={!isConditionsFullfilled()}
                          defaultChecked={!isEmpty(actionInfo?.applyTo?.[actionInfo?.applyTo?.type]?.find((field)=>field?.value?.id===item?.value?.id))}
                          label={`${item?.label || ''}`}
                          key={item?.value?.id}
                          onChange={(event) => handleChooseQuestions(event, item)}
                        />
                        )
                        ))
                       : !isEmpty(actionInfo?.applyTo) &&
                       <AutoComplete
                       sx={{
                         maxHeight: '100px',
                         marginBottom: '10px',
                       }}
                       defaultValue={actionInfo?.applyTo?.[actionInfo?.applyTo?.type]||[]}
                       name="drop"
                       onChange={handleTagInput}
                       getOptionLabel={(option) => option.name}
                       data={tagsData?.results || []}
                       valueAccessor="code"
                       labelAccessor="name"
                       multiple
                     />
                  }
                  </div>
                </div>
              </div>

            </div>
          )
            : (
              <>
                <ActionButton className="add-rules"
                 onClick={form.handleSubmit(handleAddFormGroups)}
                 >Add Rules</ActionButton>
                {rules?.length ? rules?.map((item, index) => (
                  <div key={index} className="rules-container">
                  <div
                   key={item?.selectQuestion}
                   role='presentation' 
                   onClick={handleEditRule(index)}
                   className="rules"
                  >
                    {`IF Answer to question #[${getSelectedFields(item?.conditions)}] EQUALS [ ${getSelectedAnswers(item?.conditions)} ] , THEN ${item?.action} ${item?.applyTo?.type}  [ ${getSelectedQuestions(item?.applyTo)} ]`}
                  </div>
                   <Iconify
                   icon="eva:close-outline"
                   cursor="pointer"
                   sx={{ width: 20, height: 20 }}
                   onClick={(e) => {
                     e.stopPropagation();
                     handleDeleteRules({ index });
                   }}
                 />
                 </div>
                )) : ''}
              </>
            )}
        </div>
    </Modal>
  );
};

export default AddRuleForm;
