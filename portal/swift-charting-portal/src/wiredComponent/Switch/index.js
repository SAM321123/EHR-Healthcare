import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';

import useCRUD from 'src/hooks/useCRUD';
import { REQUEST_METHOD } from 'src/api/constants';
import { TOGGLE_TABLE_SWITCH } from 'src/store/types';
import Switch from 'src/components/Switch';
import { showSnackbar } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';

const SwitchLabel = ({
  label,
  api,
  rowData,
  handleChange,
  disabled = false,
}) => {
  const { masterTypeCode, id, code, isActive } = rowData;
  const [isChecked, setIsChecked] = useState(isActive);

  const [response, , , updateRowData, clearUpdateResponse] = useCRUD({
    id: `${TOGGLE_TABLE_SWITCH}-${id}`,
    url: `${api}/${masterTypeCode || id}`,
    type: REQUEST_METHOD.update,
  });

  const handleSwitchToggle = useCallback(
    (e) => {
      const { checked } = e.target;
      setIsChecked(checked);
      updateRowData({ code, isActive: checked });
      if (isFunction(handleChange)) {
        handleChange(checked);
      }
    },
    [code, handleChange, updateRowData]
  );

  useEffect(() => {
    if (response) {
      clearUpdateResponse(true);
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
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

SwitchLabel.defaultProps = {
  label: '',
  register: {},
  labelPlacement: 'end',
};

SwitchLabel.propTypes = {
  label: PropTypes.string,
  labelPlacement: PropTypes.string,
  register: PropTypes.instanceOf(Object),
};

export default React.memo(SwitchLabel);
