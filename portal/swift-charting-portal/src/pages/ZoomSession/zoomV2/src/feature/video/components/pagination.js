/* eslint-disable react/jsx-boolean-value */
import classnames from 'classnames';
import { useCallback } from 'react';
import './pagination.scss';
import { Button } from '@mui/material';
import { ArrowLeft, ArrowRight } from '@mui/icons-material';

const Pagination = (props) => {
  const { page, totalPage, setPage, inSharing } = props;
  const pageIndication = `${page + 1}/${totalPage}`;
  const toPreviousPage = useCallback(() => {
    if (page > 0) {
      setPage(page - 1);
    }
  }, [page, setPage]);
  const toNextPage = useCallback(() => {
    if (page < totalPage - 1) {
      setPage(page + 1);
    }
  }, [page, totalPage, setPage]);
  return (
    <div className={classnames('pagination', { 'in-sharing': inSharing })}>
      <Button
        key="left"
        className="previous-page-button"
        icon={<ArrowLeft />}
        ghost={true}
        onClick={toPreviousPage}
      >
        {pageIndication}
      </Button>
      <Button key="right" className="next-page-button" icon={<ArrowRight />} ghost={true} onClick={toNextPage}>
        {pageIndication}
      </Button>
    </div>
  );
};

export default Pagination;
