import React, {  useState,  useEffect } from 'react';
import DragDropTable from 'src/components/Table/DragDropTable';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import { GLOBAL_TYPE_SORT_LIST, GLOBAL_TYPE_SORT_ORDER } from 'src/store/types';
import { showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import { Typography } from '@mui/material';
import TableTextRendrer from 'src/components/TableTextRendrer';
import WiredAutoComplete from 'src/wiredComponent/AutoComplete';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    maxWidth: '10rem',
  },
  {
    label: 'Description',
    dataKey: 'description',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer style={{ maxWidth: '15rem' }}>
        {data?.description || 'N/A'}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Global Category Type',
    type: 'text',
    dataKey: 'globalCategoryType',
    maxWidth: '10rem',
    render: ({ data }) => (
      <TableTextRendrer>
        {data?.globalCategoryType?.name || 'N/A'}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Sort Order',
    dataKey: 'sortOrder',
    type: 'number',
    maxWidth: '10rem',
    render: ({ data }) => <Typography>{data?.sortOrder}</Typography>,
  },
];

const SortOrder = () => {
  const [globalCategoryTypeCode, setGlobalCategoryTypeCode] = useState(null);
  const [response, , loading, getGlobalTypeSortList] = useCRUD({
    id: GLOBAL_TYPE_SORT_LIST,
    url: API_URL.getAllGlobalTypeSortList,
    type: REQUEST_METHOD.get,
  });

  const [updateOrderResponse, , , sortOrder, clearData] = useCRUD({
    id: GLOBAL_TYPE_SORT_ORDER,
    url: API_URL.updateGlobalTypeSortOrder,
    type: REQUEST_METHOD.update,
  });
  useEffect(() => {
    getGlobalTypeSortList({ globalCategoryTypeCode: globalCategoryTypeCode });
  }, [globalCategoryTypeCode]);

  useEffect(() => {
    if (!isEmpty(updateOrderResponse)) {
      showSnackbar({
        message: 'Order changed',
        severity: 'success',
      });
      clearData(true);
      getGlobalTypeSortList({ globalCategoryTypeCode: globalCategoryTypeCode });
    }
  }, [updateOrderResponse]);
  const handleFilterChange = (value) => {
    if (!isEmpty(value)) {
      const { code } = value;
      setGlobalCategoryTypeCode(code);
    } else {
      setGlobalCategoryTypeCode(null);
    }
  };
  const handleUpdateRows = (updatedRows) => {
    sortOrder({ reorderedArray: updatedRows });
  };

  return (
    <>
      <Container
        style={{
          backgroundColor: palette.background.paper,
          padding: 0,
          boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
        }}
        loading={loading}
      >
        <div style={{ margin: '16px' }}>
          <WiredAutoComplete
            name="globalCategoryTypeCode"
            url={API_URL.globalTypeCategory}
            filter={{ isActive: true }}
            size="small"
            onChange={handleFilterChange}
            style={{ maxWidth: '280px' }}
            fetchInitial="true"
            labelAccessor={['name']}
            cache={false}
            placeholder="Filter by Category"
            multiple={false}
          />
        </div>
        <DragDropTable
          onUpdateRows={handleUpdateRows}
          isScroll={true}
          data={response}
          columns={columns}
          loading={loading}
          wrapperStyle={{
            backgroundColor: palette.common.white,
            boxShadow: 'none',
            border: `1px solid ${palette.grey[200]}`,
            borderRadius: '0 5px 5px',
          }}
        />
        </Container>
    </>
  );
};
export default SortOrder;
