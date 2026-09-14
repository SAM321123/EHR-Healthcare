import React, { useState, useEffect, useRef } from 'react';
import useCRUD from 'src/hooks/useCRUD';
import Loader from '../Loader';

const InfiniteScrollListWrapper = ({
  id = '',
  url = '',
  type = '',
  subscribeSocket = false,
  component = '',
  limit = 10,
  style,
  ...rest
}) => {
  const [
    { results: listItems = [], page = 1, totalPages = 1 } = {},
    ,
    ,
    getNotifications,
    clearNotifications,
  ] = useCRUD({
    id,
    url,
    type,
    subscribeSocket,
  });

  const [listData, setListData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const scrollBarRef = useRef();

  const handleScroll = () => {
    if (
      scrollBarRef.current.scrollHeight - scrollBarRef.current.scrollTop !==
      scrollBarRef.current.clientHeight
    )
      return;
    setIsFetching(true);
  };

  useEffect(() => {
    getNotifications({ limit });
    scrollBarRef?.current?.addEventListener('scroll', handleScroll);
    return () => {
      scrollBarRef?.current?.removeEventListener('scroll', handleScroll);
      setListData([]);
      // clearNotifications(true);
    };
  }, []);

  useEffect(() => {
    if (!isFetching) return;
    if (page < totalPages) {
      getNotifications({ limit, page: page + 1 });
    }
  }, [isFetching]);

  useEffect(() => {
    if (listItems?.length && isFetching) {
      setListData((prev) => [...prev, ...listItems]);
    } else {
      setListData([...listItems]);
    }
    setIsFetching(false);
  }, [listItems]);

  return (
    <div
      ref={scrollBarRef}
      style={{ height: '400px', overflow: 'auto', ...style }}
    >
      {component({ data: listData, ...rest })}
      {isFetching && <Loader />}
    </div>
  );
};

export default InfiniteScrollListWrapper;
