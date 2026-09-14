import { useState, useRef, useCallback, useMemo } from 'react';


export function useDrag(options) {
  return (data) => ({
    key: JSON.stringify(data),
    draggable: 'true',
    onDragStart: (e) => {
      if (options && options.onDragStart) {
        options.onDragStart(data, e);
      }
      e.dataTransfer.setData('custom', JSON.stringify(data));
    },
    onDragEnd: (e) => {
      if (options && options.onDragEnd) {
        options.onDragEnd(data, e);
      }
    },
  });
}

export function useDrop(options) {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [isHover, setIsHover] = useState(false);
  const onDrop = useCallback(
    (dataTransfer, event) => {
      const uri = dataTransfer.getData('text/uri-list');
      const dom = dataTransfer.getData('custom');
      if (dom && optionsRef.current.onDom) {
        let data = dom;
        try {
          data = JSON.parse(dom);
        } catch (e) {
          // nothing
        }
        optionsRef.current.onDom(data, event);
      } else if (uri && optionsRef.current.onUri) {
        optionsRef.current.onUri(uri, event);
      } else if (
        dataTransfer.files &&
        dataTransfer.files.length > 0 &&
        optionsRef.current.onFiles
      ) {
        optionsRef.current.onFiles(
          Array.from(dataTransfer.files),
          event,
        );
      } else if (
        dataTransfer.items &&
        dataTransfer.items.length &&
        optionsRef.current.onText
      ) {
        dataTransfer.items[0].getAsString((text) => {
          optionsRef.current.onText?.(text, event);
        });
      }
    },
    [],
  );
  const props = useMemo(
    () => ({
      onDragOver: (event) => {
        event.preventDefault();
      },
      onDragEnter: (event) => {
        event.preventDefault();
        setIsHover(true);
      },
      onDragLeave: () => {
        setIsHover(false);
      },
      onDrop: (event) => {
        event.preventDefault();
        event.persist();
        setIsHover(false);
        onDrop(event.dataTransfer, event);
      },
      onPaste: (event) => {
        event.persist();
        onDrop(event.clipboardData, event);
      },
    }),
    [onDrop],
  );
  return [props, { isHover }];
}
