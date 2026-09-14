/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Collapse, IconButton } from '@mui/material';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDrop } from 'react-dnd';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DetailsCard from '../DetailsCard/index';

const CollapsibleList = ({
  data: appointmentsResponse,
  status,
  cardRef,
  accept: acceptance,
  onDrop,
  label,
  listIndex,
  toggleList,
  isOpenList,
  setIsOpenList,
  ...restProps
}) => {
  const [appointments, setAppointments] = useState(appointmentsResponse);

  const injectRefs = (data = {}) => ({
    ...data,
    ref: React.createRef(),
  });

  useEffect(() => {
    const newData = appointmentsResponse?.map(injectRefs) || [];
    setAppointments([...newData]);
  }, [appointmentsResponse]);

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
    accept: accept || 'Pending Confirmation',
    collect: (monitor) => ({
      currentItem: monitor.getItem() || {},
      isOver: !!monitor.isOver(),
    }),
    drop: ({ data: item, index }) => {
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
        oldListIndex: index,
      });
    },
  });

  const itemList = useMemo(() => {
    const newCardArray = appointments && [...appointments];
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
  }, [appointments, currentItem.id, hoveringAbove, isOver]);

  drop(ref);

  useEffect(() => {
    if (isOver) {
      setIsOpenList((prevOpenList) => ({
        ...prevOpenList,
        [listIndex]: true,
      }));
    }
  }, [isOver, listIndex, setIsOpenList]);

  return (
    <div
      ref={ref}
      style={{
        border: isOver ? '4px solid #7b9dd1 ' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          justifyContent: 'space-between',
        }}
        onClick={() => toggleList(listIndex)}
      >
        <h4>{`${label} (${itemList?.length})`}</h4>
        <IconButton
          size="small"
          color="primary"
          onClick={() => toggleList(listIndex)}
          aria-label="Toggle List"
          style={{ marginBottom: '10px', color: '#303030' }}
        >
          {isOpenList[listIndex] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>
      <Collapse in={isOpenList[listIndex]} timeout="auto">
        <div style={{ overflowX: 'hidden', height: '45vh' }}>
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
      </Collapse>
    </div>
  );
};

export default CollapsibleList;
