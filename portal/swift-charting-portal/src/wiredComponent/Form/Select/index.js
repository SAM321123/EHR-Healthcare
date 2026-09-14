import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { REQUEST_METHOD } from 'src/api/constants';
import FormSelect from 'src/components/form/Select';
import { get, isArray, isEmpty, isObject } from 'lodash';
import useCRUD from '../../../hooks/useCRUD';
import { convertWithTimezone } from 'src/lib/utils';
import { dateFormats } from 'src/lib/constants';

const WiredSelect = ({
  getValues,
  defaultValue,
  name,
  labelAccessor,
  url,
  params,
  onChange = () => {},
  cache = true,
  code,
  options,
  extraId,
  extraAPIParams={},
  accessor,
  fetchInitial = true,
  selectFirstValue,
  applyPractice = false,
  crudId,
  responseKey = 'results',
  addOnFilterKey,
  isNested= false,
  identifier,
  responseModifier,
  getDisabled=()=>{},
  ...restProps
}) => {

  const {form} = restProps || {};
  const { watch } = form;
  const {valueAccessor='value'}= restProps || {};

  const [wiredSelectFilter, setWiredSelectFilter] = useState({});
  const addOnFilterCallChecked = useRef(false);

  const [data, , loading, getData,clearData] = useCRUD({
    id:
      crudId ||
      `wired-select-${restProps?.register?.name || name}${
        code ? `-${code}` : ''
      }${extraId ? `-${extraId}` : ''}`,
    url,
    type: REQUEST_METHOD.get,
    responseModifier,
  });

  const disabled = getDisabled(data , loading)|| restProps.disabled

  useEffect(() => {
    if(addOnFilterKey) {
      const subscription = watch((value, {name:_name}) => {
        let fieldData = get(value,_name) || []
        if(_name===(identifier|| name)){
          if(isNested){
            if(!Array.isArray(fieldData)){
              fieldData = [{[addOnFilterKey]:fieldData}]
            }
            const nestedData = fieldData?.map(item=>item[name]);
            setWiredSelectFilter({[addOnFilterKey]: nestedData})
          }else{
            if(!Array.isArray(fieldData)){
              fieldData = [fieldData]
            }
            if( fieldData.length ){
              setWiredSelectFilter({[addOnFilterKey]: fieldData})
            }
          }
      }
    });
    return () => subscription.unsubscribe();
    }
    return ()=>{};
  }, []);
  
  useEffect(() => {
    const { reFetch, queryParams } = extraAPIParams || {};
    if (reFetch) {
      if (queryParams) {
        getData({ ...params, ...queryParams,...wiredSelectFilter });
      } else {
        getData(
          {...params,...wiredSelectFilter},
          extraAPIParams?.reFetchData ? `/${extraAPIParams?.reFetchData}` : null
        );
      }
    }
  }, [extraAPIParams]);

  useEffect(() => {
    if (options?.length || url === null) {
      return 
    }
    if (!cache && fetchInitial) {
      getData({...params,...wiredSelectFilter});
    } else if (!data && fetchInitial) {
      getData({...params,...wiredSelectFilter});
    } else if (cache){
      getData({...params,...wiredSelectFilter});
    }
  }, [cache, url]);

  useEffect(()=>()=>{
      if(!cache) clearData(true);
    },[])

  const parsedData = useMemo(() => {
    if (options?.length) {
      return options;
    }
    if (accessor) {
      return accessor(data);
    }
    if (isArray(data)) {
      return data;
    }
    if (isObject(data)) {
      return get(data, responseKey);
    }
    return [];
  }, [accessor, data, options]);

  useEffect(()=>{
    if(parsedData && !isEmpty(wiredSelectFilter) && !addOnFilterCallChecked.current){
      const addOnDataArray  = wiredSelectFilter[addOnFilterKey];
      const dataResultObject = parsedData.reduce((acc,curr)=>{acc[curr[valueAccessor]]=1; return acc},{});
      const nonExistingRecords = addOnDataArray.filter(item=>!dataResultObject[item]);
      if(nonExistingRecords.length){
        getData({...params,...wiredSelectFilter});
        addOnFilterCallChecked.current=true
      }
    }
  },[parsedData,wiredSelectFilter]);

  // const getOptionLabel = useCallback(
  //   (option) => {
  //     if (Array.isArray(labelAccessor)) {
  //       return labelAccessor
  //         .reduce((acc, key) => `${acc} ${get(option,key, '')} `, '')
  //         .trim();
  //     }
  //     return get(option,labelAccessor, option);
  //   },
  //   [labelAccessor]
  // );
  const getOptionLabel = useCallback(
    (option) => {
      console.log("🚀 ~ option:", option);
  
      if (Array.isArray(labelAccessor)) {
        return labelAccessor
          .map((item) => {
            let key = typeof item === 'object' ? item.label : item;
            let value = get(option, key, '');
  
            // If the item is an object and has type 'date', format the value
            if (typeof item === 'object' && item.type === 'date') {
              value = convertWithTimezone(value, { format: dateFormats.MMDDYYYY });
            }
  
            return value;
          })
          .filter(Boolean) // Removes empty values to avoid unnecessary spaces
          .join(' ')
          .trim();
      }
  
      return get(option, labelAccessor, option);
    },
    [labelAccessor]
  );
  

  useEffect(() => {
    if (selectFirstValue && parsedData?.length === 1) {
      // need to work
      // const { form, register } = restProps;
      // form.setValue(register?.name, parsedData[0]?.id);
    }
  }, [data, name, parsedData, restProps, restProps.form, selectFirstValue]);

  return (
    <FormSelect
      size="small"
      data={parsedData}
      getOptionLabel={getOptionLabel}
      defaultValue={defaultValue}
      loading={loading}
      onChange={onChange}
      labelAccessor={labelAccessor}
      {...restProps}
      disabled = {disabled}
    />
  );
};

export default WiredSelect;
