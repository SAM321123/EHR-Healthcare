import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';

import useCRUD from 'src/hooks/useCRUD';
import { REQUEST_METHOD } from 'src/api/constants';
import { TOGGLE_TABLE_SWITCH } from 'src/store/types';
import Switch from 'src/components/Switch';

const IsPrimarySwitch = ({
  label,
  api,
  rowData,
  handleChange,
  disabled = false,
  staffId,
  fetchLocations
}) => {
  const {  id,  isPrimaryLocation } = rowData;
  const [isChecked, setIsChecked] = useState(isPrimaryLocation);

  const [response, , , updateRowData, clearUpdateResponse] = useCRUD({
    id: `${TOGGLE_TABLE_SWITCH}-${id}`,
    url: `${api}/${id}`,
    type: REQUEST_METHOD.update,
  });

  const handleSwitchToggle = useCallback(
    (e) => {
      const { checked } = e.target;
      setIsChecked(checked);
      updateRowData({ staffId , isPrimaryLocation: checked });
      if (isFunction(handleChange)) {
        handleChange(checked);
      }
    },
    [handleChange, updateRowData]
  );

  useEffect(() => {
    if (response) {
      clearUpdateResponse(true);
      fetchLocations()
    }
  }, [response]);

  return (
    <Switch
      key={id}
      onChange={handleSwitchToggle}
      label={label}
      disabled={disabled}
      checked={isChecked}
      inputProps={{ 'aria-label': 'controlled' }}
    />
  );
};

IsPrimarySwitch.defaultProps = {
  label: '',
  register: {},
  labelPlacement: 'end',
};

IsPrimarySwitch.propTypes = {
  label: PropTypes.string,
  labelPlacement: PropTypes.string,
  register: PropTypes.instanceOf(Object),
};

export default React.memo(IsPrimarySwitch);
