import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';

import useCRUD from 'src/hooks/useCRUD';
import { REQUEST_METHOD } from 'src/api/constants';
import { TOGGLE_TABLE_SWITCH } from 'src/store/types';
import Checkbox from 'src/components/Checkbox';

const CheckBoxLabel = ({
  label,
  api,
  rowData,
  data,
  handleChange,
  disabled = false,
}) => {

  const { masterTypeCode, id, code, filled } = rowData;
  // const [isChecked, setIsChecked] = useState(filled);
  const [isChecked, setIsChecked] = useState(data);
  const [response, , , updateRowData, clearUpdateResponse] = useCRUD({
    id: `${TOGGLE_TABLE_SWITCH}-${id}`,
    url: `${api}/${masterTypeCode || id}`,
    type: REQUEST_METHOD.update,
  });

  const handleSwitchToggle = useCallback(
    (e) => {
      const { checked } = e.target;
      setIsChecked(checked);
      updateRowData({ code, filled: checked });
      if (isFunction(handleChange)) {
        handleChange(checked);
      }
    },
    [code, handleChange, updateRowData]
  );

  useEffect(() => {
    if (response) {
      clearUpdateResponse(true);
    }
  }, [response]);

  return (
    <Checkbox
      key={id}
      onChange={handleSwitchToggle}
      label={label}
      disabled={disabled}
      checked={isChecked}
      inputProps={{ 'aria-label': 'controlled' }}
    />
  );
};

CheckBoxLabel.defaultProps = {
  label: '',
  register: {},
  labelPlacement: 'end',
};

CheckBoxLabel.propTypes = {
  label: PropTypes.string,
  labelPlacement: PropTypes.string,
  register: PropTypes.instanceOf(Object),
};

export default React.memo(CheckBoxLabel);
