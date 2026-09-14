/* eslint-disable no-underscore-dangle */
import { useCallback, useEffect, useState } from 'react';

import { get, isEmpty } from 'src/lib/lodash';

const useSelection = ({ tableData, getSelectedIds, defaultSelectedIDs }) => {
  const [selectedIDs, setSelectedIDs] = useState({});

  useEffect(() => {
    if (isEmpty(selectedIDs) && !isEmpty(defaultSelectedIDs)) {
      const defaultIDs = {};
      defaultSelectedIDs?.forEach((val) => {
        defaultIDs[val?.id] = true;
      });
      setSelectedIDs({ ...defaultIDs });
    }
  }, [defaultSelectedIDs]);

  const handleOnSelected = useCallback((event, singleRowData) => {
    event.stopPropagation();

    let selectedIdData = {};

    const rowID = get(singleRowData, 'id', '');
    const alreadySelected = selectedIDs;

    if (Object.keys(alreadySelected).indexOf(rowID) !== -1) {
      // delete selected userId when the user unChecked the individual checkbox
      delete alreadySelected[rowID];
      selectedIdData = { ...alreadySelected };
    } else {
      // select userId when the user checked the individual checkbox
      selectedIdData = {
        ...alreadySelected,
        [rowID]: true,
      };
    }
    setSelectedIDs({ ...selectedIdData });
    getSelectedIds({ ...selectedIdData });
  }, [getSelectedIds, selectedIDs]);

  const handleOnAllSelected = useCallback((event) => {
    let allSelectedIdData = {};
    if (event.target.checked) {
      // select all userId when the user checked the header checkbox
      const allSelectedIds = {};
      tableData?.forEach((rowData) => {
        const rowID = get(rowData, 'id', '');
        allSelectedIds[rowID] = true;
      });
      allSelectedIdData = { ...selectedIDs, ...allSelectedIds };
    } else {
      // delete selected all userId when the user unChecked the header checkbox
      const selectedIdForDeleted = selectedIDs;
      tableData?.forEach((rowData) => {
        const rowID = get(rowData, 'id', '');
        delete selectedIdForDeleted[rowID];
      });
      allSelectedIdData = { ...selectedIdForDeleted };
    }
    setSelectedIDs({ ...allSelectedIdData });
    getSelectedIds({ ...allSelectedIdData });
  }, [getSelectedIds, selectedIDs, tableData]);

  return [selectedIDs, handleOnSelected, handleOnAllSelected];
};

export default useSelection;
