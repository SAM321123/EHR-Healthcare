import isEmpty from 'lodash/isEmpty';
import React, { useRef, useMemo, forwardRef } from 'react';
import { useDragLayer } from 'react-dnd';
import DetailsCard from './Components/DetailsCard';

const getItemStyles = (layerDimensions, cardWidth, currentOffset) => {
  if (!layerDimensions || !currentOffset) {
    return {
      display: 'none',
    };
  }
  let { x, y } = currentOffset;
  x -= layerDimensions.x;
  y -= layerDimensions.y;
  const transform = `translate(${x}px, ${y}px) rotate(-7deg)`;
  return {
    width: cardWidth || 219, // add border width
    transform,
    WebkitTransform: transform,
  };
};

const CustomDragLayer = forwardRef((_, cardRef) => {
  const ref = useRef(null);
  const { itemType, item, isDragging, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  const layerDimensions =
    ref && ref.current && ref.current.getBoundingClientRect();
  // clientWidth of the card compromises as we remove the component being dragged.
  // useMemo helps freezing the width value as the dragging begins
  const cardWidth = useMemo(() => cardRef?.current?.clientWidth, [cardRef]);

  const renderItem = () => {
    if (
      !isEmpty(item) &&
      item?.data?.id &&
      itemType &&
      itemType !== '__NATIVE_TEXT__'
    ) {
      return (
        <DetailsCard
          data={{ ...item?.data }}
          cardRef={cardRef}
          status={item?.data?.status}
          color={item?.color}
          style={getItemStyles(layerDimensions, cardWidth, currentOffset)}
        />
      );
    }
    return null;
  };

  if (!isDragging) {
    return null;
  }

  return (
    <div ref={ref} className="dashboard-drag-layer">
      {renderItem()}
    </div>
  );
});

export default CustomDragLayer;
