import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import PageHeader from 'src/components/PageHeader';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import palette from 'src/theme/palette';
import { GET_ALL_PRODUCTS } from 'src/store/types';
import SwitchLabel from 'src/wiredComponent/Switch';
import { isEmpty } from 'lodash';
import Table from '../../components/Table';
import ModalComponent from '../../components/modal';
import ProductForm from './productForm';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
  },
  {
    label: 'SKU',
    type: 'text',
    dataKey: 'sku',
  },
  {
    label: 'Description',
    type: 'text',
    dataKey: 'description',
    render: ({ data }) => (data?.description ? data.description : 'N/A'),
  },
  {
    label: 'Service',
    type: 'text',
    dataKey: 'service.name',
    render: ({ data }) => (data?.service?.name ? data.service.name : 'N/A'),
  },
  {
    label: 'Price',
    type: 'text',
    dataKey: 'price',
  },
  {
    label: 'Expires in(days)',
    type: 'text',
    dataKey: 'consultationExpiry',
    render: ({ data }) => (data?.consultationExpiry ? data.consultationExpiry : 'N/A'),
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    render: ({ data }) => <SwitchLabel rowData={data} api={API_URL.product} />,
  },
];

const Products = () => {
  const [openModal, setOpenModal] = useState(false);
  const [defaultData, setDefaultdata] = useState(null);
  const form = useForm({ mode: 'onChange' });
  const { reset } = form;

  const [
    ProductContent,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
  ] = useQuery({
    id: GET_ALL_PRODUCTS,
    url: API_URL.product,
    type: REQUEST_METHOD.get,
  });

  const editService = useCallback((data) => {
    if (data) {
      setOpenModal(true);
      setDefaultdata(data);
    }
  }, []);

  const moreActions = [
    {
      label: 'Edit',
      icon: 'edit',
      action: editService,
    },
  ];

  const handleModal = useCallback(() => {
    setOpenModal((prev) => !prev);
    setDefaultdata(null);
    reset();
  }, [reset]);

  const FilterCollectionHeader = FilterComponents({
    rightComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search by Name',
        },
        name: 'searchText',
      },
      {
        type: 'fabButton',
        style: { ml: 2 },
        onClick: handleModal,
      },
    ],
  });

  return (
    <Container
      loading={loading}
      style={{
        backgroundColor: palette.background.paper,
        padding: 16,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
    >
      <>
        <PageHeader
          title="Products"
          rightContent={[
            {
              render: (
                <FilterCollectionHeader
                  onFilterChange={handleFilters}
                  filters={filters}
                />
              ),
            },
          ]}
        />
        <Table
          data={ProductContent?.results}
          totalCount={ProductContent?.totalResults}
          columns={columns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          actionButtons={moreActions}
          wrapperStyle={{
          }}
        />
        {openModal && (
          <ModalComponent
            open={openModal}
            header={{
              title: isEmpty(defaultData) ? 'Add Product' : 'Edit Product',
              closeIconAction: handleModal,
              isCloseIcon: false,
            }}
          >
            <ProductForm
              modalCloseAction={handleModal}
              handleOnFetchDataList={handleOnFetchDataList}
              singleProductResponse={defaultData}
            />
          </ModalComponent>
        )}
      </>
    </Container>
  );
};

export default Products;
