import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';

import useCRUD from 'src/hooks/useCRUD';
import { REQUEST_METHOD } from 'src/api/constants';
import { TOGGLE_TABLE_SWITCH } from 'src/store/types';
import Switch from 'src/components/Switch';
import { showSnackbar } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';

const TwoFaSwitchLabel = ({
  label,
  api,
  rowData,
  handleChange,
  disabled = false,
}) => {
  const { masterTypeCode, id, code } = rowData || {};
  const user = rowData?.user || null;
  const [isChecked, setIsChecked] = useState(!!user?.twoFaEnable);

  const [response, , , updateRowData, clearUpdateResponse] = useCRUD({
    id: `${TOGGLE_TABLE_SWITCH}-${id}`,
    url: `${api}/${masterTypeCode || id}`,
    type: REQUEST_METHOD.update,
  });

  const handleSwitchToggle = useCallback(
    (e) => {
      if (!user) return;
      const { checked } = e.target;
      setIsChecked(checked);
      updateRowData({ code, twoFaEnable: checked });
      if (isFunction(handleChange)) {
        handleChange(checked);
      }
    },
    [code, handleChange, updateRowData, user]
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

  // Keep switch in sync when table rows change.
  useEffect(() => {
    setIsChecked(!!user?.twoFaEnable);
  }, [user?.twoFaEnable]);

  return (
    <Switch
      key={id}
      onChange={handleSwitchToggle}
      label={label}
      disabled={disabled || !user}
      checked={isChecked}
      inputProps={{ 'aria-label': 'controlled' }}
    />
  );
};

TwoFaSwitchLabel.defaultProps = {
  label: '',
  register: {},
  labelPlacement: 'end',
};

TwoFaSwitchLabel.propTypes = {
  label: PropTypes.string,
  labelPlacement: PropTypes.string,
  register: PropTypes.instanceOf(Object),
};

export default React.memo(TwoFaSwitchLabel);
