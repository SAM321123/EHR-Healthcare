import React, { useEffect, useMemo } from 'react';

import { isEmpty } from '../../lib/lodash';
import FormComponent from './FormComponent';

const CustomForm = ({
  form,
  formGroups,
  columnsPerRow = 1,
  gridGap = 3,
  defaultValue = {},
  fieldWrapper,
  showLabel=true,
  preview=false,
  resetOnDefaultValue=false,
}) => {
  const nestedFilterGroup = useMemo(
    () => formGroups?.filter((item) => item?.formGroups),
    [formGroups]
  );
  let nestedGroups = {};
  if (nestedFilterGroup?.length) {
    nestedFilterGroup.map((item) => {
      nestedGroups = {
        ...nestedGroups,
        [item.name]: [item.formGroups.values()],
      };
      return nestedGroups;
    });
  }
  useEffect(() => {
    if (!isEmpty(nestedGroups)) {
      const formValues = form.getValues() || {};
      Object.entries(nestedGroups).forEach(([key, value]) => form.setValue(key, formValues[key]?.length ? formValues[key] : value, {
          	shouldValidate: true,
        	}));
      }
  }, [formGroups]);

  useEffect(() => {
    if (!isEmpty(defaultValue)) {
      if (resetOnDefaultValue) {
        form.reset();
      } 
      Object.entries(defaultValue).forEach(([key, value]) =>
        form.setValue(key, value, {
          shouldValidate: true,
        })
      );
    }
  }, [defaultValue]);

  return (
    <FormComponent
      formGroups={formGroups}
      columnsPerRow={columnsPerRow}
      gridGap={gridGap}
      defaultValue={defaultValue}
      form={form}
      fieldWrapper={fieldWrapper}
      showLabel={showLabel}
      preview={preview}
    />
  );
};

export default CustomForm;
