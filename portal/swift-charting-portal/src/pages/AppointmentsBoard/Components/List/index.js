import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import DetailsCard from '../DetailsCard';

const List = ({
  data: appointmentsResponse,
  status,
  cardRef,
  accept: acceptance,
  onDrop,
  label,
  ...restProps
}) => {
  const ref = useRef(null);
  const accept = useMemo(() => acceptance[status], [acceptance, status]) || [
    'Pending Confirmation',
  ];
  const [cardLoading, setCardLoading] = useState();
  const [hoveringAbove, setHoveringAbove] = useState({});

  const onHover = useCallback(
    (hoverId, index) => {
      if (hoverId && Number.isInteger(index)) {
        if (hoveringAbove.index !== index) {
          setHoveringAbove({ id: hoverId, index });
        }
      } else if (hoveringAbove.id) setHoveringAbove({});
    },
    [hoveringAbove.id, hoveringAbove.index]
  );

  const [{ currentItem, isOver }, drop] = useDrop({
    accept,
    collect: (monitor) => ({
      currentItem: monitor.getItem() || {},
      isOver: !!monitor.isOver(),
    }),
    drop: ({ data: item }) => {
      const newItem = {
        ...item,
        type: status,
        status,
      };
      if (!ref.current) {
        return;
      }
      setCardLoading(item.id);
      onDrop({
        newItem: { ...newItem },
        oldStatus: item?.status,
        newStatus: newItem?.status,
        index: hoveringAbove?.index,
      });
      setHoveringAbove({});
    },
  });

  const itemList = useMemo(() => {
    const newCardArray = appointmentsResponse && [...appointmentsResponse];
    if (isOver && hoveringAbove.id !== currentItem.id) {
      const indicator = {
        type: 'drop-indicator',
        height: 109,
      };
      if (hoveringAbove && Number.isInteger(hoveringAbove.index)) {
        newCardArray.splice(hoveringAbove.index, 0, indicator);
      } else newCardArray.push(indicator);
    }
    return newCardArray;
  }, [appointmentsResponse, currentItem.id, hoveringAbove, isOver]);

  drop(ref);

  return (
    <div
      ref={ref}
      className="dashboard-list-container"
      style={{
        border: isOver ? '4px solid #7b9dd1 ' : 'none',
      }}
    >
      {label && <h4>{`${label} (${itemList?.length})`}</h4>}
      <div style={{ overflowX: 'hidden', width: '100%' }}>
        {itemList?.map((appointment, index) =>
          appointment.type === 'drop-indicator' ? (
            <div
              key={appointment?.id}
              style={{
                height: appointment.height,
                backgroundColor: '#c6d5eb',
                marginBottom: '8px',
              }}
            />
          ) : (
            <DetailsCard
              key={appointment?.id}
              index={index}
              data={appointment}
              onHover={onHover}
              status={status}
              accept={accept}
              cardRef={cardRef}
              loading={cardLoading === appointment?.id}
              {...restProps}
            />
          )
        )}
      </div>
    </div>
  );
};

export default List;
