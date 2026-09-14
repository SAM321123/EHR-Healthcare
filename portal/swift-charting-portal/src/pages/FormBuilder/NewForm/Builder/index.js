/* eslint-disable import/no-cycle */
import React, { useCallback, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useForm } from 'react-hook-form';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { FormLabel } from '@mui/material';

import ActionButton from 'src/components/ActionButton';
import CustomForm from 'src/components/form';
import { Iconify } from 'src/components/iconify';
import palette from 'src/theme/palette';
import AddField, { INPUT_TYPE_OPTIONS } from './components/AddField';
import SectionTitleModal from './components/SectionTitleModal';
import './builder.scss';

const DND_TYPES = {
  PALETTE: 'form-builder-palette-field',
  ROW: 'form-builder-row',
  SECTION: 'form-builder-section',
  FIELD: 'form-builder-field',
};

const FIELD_HELP_TEXT = {
  select: 'Single-choice dropdown',
  checkBox: 'One on or off checkbox',
  textArea: 'Long answer paragraph',
  radio: 'Single-choice radio list',
  date: 'Date picker field',
  dateTime: 'Date and time picker',
  text: 'Short answer input',
  slider: 'Numeric range selector',
  multiSelect: 'Dropdown with multiple selections',
  matrix: 'Grid style question set',
  multiChoice: 'Multiple checkbox options',
  signature: 'Signature capture area',
  number: 'Numbers only input',
  uploadFile: 'Attach documents or images',
  editor: 'Rich text editor block',
  textLabel: 'Static text or instructions',
};

const FIELD_LIBRARY = INPUT_TYPE_OPTIONS.map((item) => ({
  ...item,
  description: FIELD_HELP_TEXT[item.value] || 'Drag into the form canvas',
}));
const FIELD_GRID_SPACING = 2;

const getRowLength = (row = []) =>
  row.reduce((sum, item) => sum + Number(item?.colSpan || 0), 0);

const getSectionKey = (sectionGroups, sectionIndex) =>
  sectionGroups?.id || sectionGroups?.name || `section-${sectionIndex}`;

const cloneFormGroups = (formGroups = []) =>
  formGroups.map((section) => {
    if (Array.isArray(section)) {
      return [...section];
    }

    return {
      ...section,
      fields: (section?.fields || []).map((row) => [...row]),
    };
  });

const clampIndex = (value, max) =>
  Math.max(0, Math.min(Number(value) || 0, max));

const canMoveFieldToRow = ({ dragItem, sectionIndex, rowIndex, rowLength }) => {
  if (
    dragItem.sectionIndex === sectionIndex &&
    dragItem.rowIndex === rowIndex
  ) {
    return true;
  }

  return rowLength + Number(dragItem.colSpan || 0) <= 12;
};

const moveFieldInForm = ({ formGroups, source, target }) => {
  const parsedFormGroups = cloneFormGroups(formGroups);
  const sourceSection = parsedFormGroups[source.sectionIndex];
  const sourceRow = sourceSection?.fields?.[source.rowIndex];

  if (!sourceRow) {
    return formGroups;
  }

  if (
    source.sectionIndex === target.sectionIndex &&
    source.rowIndex === target.rowIndex
  ) {
    if (sourceRow.length <= 1) {
      return formGroups;
    }

    const rawTargetIndex = clampIndex(target.itemIndex, sourceRow.length);

    if (
      rawTargetIndex === source.itemIndex ||
      rawTargetIndex === source.itemIndex + 1
    ) {
      return formGroups;
    }

    const [draggedField] = sourceRow.splice(source.itemIndex, 1);

    if (!draggedField) {
      return formGroups;
    }

    const nextTargetIndex =
      rawTargetIndex > source.itemIndex ? rawTargetIndex - 1 : rawTargetIndex;

    sourceRow.splice(clampIndex(nextTargetIndex, sourceRow.length), 0, draggedField);

    return parsedFormGroups;
  }

  const [draggedField] = sourceRow.splice(source.itemIndex, 1);

  if (!draggedField) {
    return formGroups;
  }

  let nextTargetRowIndex = target.rowIndex;
  const isSourceRowEmpty = !sourceRow.length;

  if (isSourceRowEmpty) {
    sourceSection.fields.splice(source.rowIndex, 1);

    if (
      source.sectionIndex === target.sectionIndex &&
      source.rowIndex < target.rowIndex
    ) {
      nextTargetRowIndex -= 1;
    }
  }

  const targetSection = parsedFormGroups[target.sectionIndex];
  const targetRow = targetSection?.fields?.[nextTargetRowIndex];

  if (!targetRow) {
    return formGroups;
  }

  targetRow.splice(clampIndex(target.itemIndex, targetRow.length), 0, draggedField);

  return parsedFormGroups;
};

const moveFieldToNewRow = ({
  formGroups,
  source,
  targetSectionIndex,
  targetRowIndex,
}) => {
  const parsedFormGroups = cloneFormGroups(formGroups);
  const sourceSection = parsedFormGroups[source.sectionIndex];
  const sourceRow = sourceSection?.fields?.[source.rowIndex];

  if (!sourceRow) {
    return formGroups;
  }

  const [draggedField] = sourceRow.splice(source.itemIndex, 1);

  if (!draggedField) {
    return formGroups;
  }

  let nextTargetRowIndex = targetRowIndex;

  if (!sourceRow.length) {
    sourceSection.fields.splice(source.rowIndex, 1);

    if (
      source.sectionIndex === targetSectionIndex &&
      source.rowIndex < targetRowIndex
    ) {
      nextTargetRowIndex -= 1;
    }
  }

  const targetSection = parsedFormGroups[targetSectionIndex];

  targetSection.fields.splice(nextTargetRowIndex, 0, [draggedField]);

  return parsedFormGroups;
};

const buildFieldDraft = ({ fieldType, colSpan = 12 }) => {
  const fieldMeta = INPUT_TYPE_OPTIONS.find((item) => item.value === fieldType);
  const fieldLabel = fieldMeta?.label || 'Field';
  const nextColSpan = Math.max(1, Math.min(12, Number(colSpan) || 12));

  const baseField = {
    inputType: fieldType,
    textLabel: fieldLabel,
    label: fieldLabel,
    description: '',
    colSpan: nextColSpan,
    mandatory: false,
  };

  if (fieldType === 'text' || fieldType === 'number') {
    return {
      ...baseField,
      placeholder: `Enter ${fieldLabel}`,
    };
  }

  if (fieldType === 'textArea') {
    return {
      ...baseField,
      placeholder: `Enter ${fieldLabel}`,
      multiline: true,
      minRows: 3,
    };
  }

  if (
    ['select', 'radio', 'multiSelect', 'multiChoice'].includes(fieldType)
  ) {
    return {
      ...baseField,
      options: [],
    };
  }

  if (fieldType === 'slider') {
    return {
      ...baseField,
      min: 0,
      max: 100,
    };
  }

  if (fieldType === 'editor') {
    return {
      ...baseField,
      editorValue: '',
    };
  }

  if (fieldType === 'textLabel') {
    return {
      ...baseField,
      textLabel: 'Informational text',
      label: 'Informational text',
    };
  }

  return baseField;
};

const FieldPaletteCard = ({ item, onClickAdd }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPES.PALETTE,
      item: { fieldType: item.value },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item.value]
  );

  return (
    <button
      ref={drag}
      type="button"
      className={`builder-palette-card${isDragging ? ' is-dragging' : ''}`}
      onClick={() => onClickAdd(item.value)}
    >
      <span className="builder-palette-card__drag">
        <DragIndicatorIcon sx={{ fontSize: '20px' }} />
      </span>
      <span className="builder-palette-card__content">
        <span className="builder-palette-card__label">{item.label}</span>
        <span className="builder-palette-card__hint">{item.description}</span>
      </span>
    </button>
  );
};

const FieldEdgeDropZone = ({
  sectionIndex,
  rowIndex,
  rowLength,
  itemIndex,
  position,
  onPaletteDrop,
  onMoveField,
}) => {
  const ref = useRef();
  const insertionIndex = position === 'before' ? itemIndex : itemIndex + 1;

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [DND_TYPES.FIELD, DND_TYPES.PALETTE],
      canDrop: (dragItem, monitor) => {
        if (monitor.getItemType() === DND_TYPES.PALETTE) {
          return rowLength < 12;
        }

        return canMoveFieldToRow({
          dragItem,
          sectionIndex,
          rowIndex,
          rowLength,
        });
      },
      drop(dragItem, monitor) {
        if (monitor.didDrop() || !monitor.isOver({ shallow: true })) {
          return undefined;
        }

        if (monitor.getItemType() === DND_TYPES.PALETTE) {
          onPaletteDrop({
            fieldType: dragItem.fieldType,
            sectionIndex,
            rowIndex,
            rowLength,
            targetType: 'field',
            itemIndex: insertionIndex,
          });

          return { handled: true };
        }

        if (
          !canMoveFieldToRow({
            dragItem,
            sectionIndex,
            rowIndex,
            rowLength,
          })
        ) {
          return undefined;
        }

        onMoveField({
          source: {
            sectionIndex: dragItem.sectionIndex,
            rowIndex: dragItem.rowIndex,
            itemIndex: dragItem.itemIndex,
          },
          target: {
            sectionIndex,
            rowIndex,
            itemIndex: insertionIndex,
          },
        });

        return { handled: true };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [
      insertionIndex,
      onMoveField,
      onPaletteDrop,
      position,
      rowIndex,
      rowLength,
      sectionIndex,
      itemIndex,
    ]
  );

  drop(ref);

  return (
    <span
      ref={ref}
      role="presentation"
      className={`field-drop-slot field-drop-slot--${position}${
        isOver && canDrop ? ' is-active' : ''
      }`}
    />
  );
};

const RowInsertionDropZone = ({
  sectionIndex,
  targetRowIndex,
  onPaletteDrop,
  onMoveFieldToSection,
  variant = 'inline',
}) => {
  const ref = useRef();
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [DND_TYPES.FIELD, DND_TYPES.PALETTE],
      drop(dragItem, monitor) {
        if (monitor.didDrop() || !monitor.isOver({ shallow: true })) {
          return undefined;
        }

        if (monitor.getItemType() === DND_TYPES.PALETTE) {
          onPaletteDrop({
            fieldType: dragItem.fieldType,
            sectionIndex,
            targetType: 'row',
            insertRowIndex: targetRowIndex,
          });

          return { handled: true };
        }

        onMoveFieldToSection({
          source: {
            sectionIndex: dragItem.sectionIndex,
            rowIndex: dragItem.rowIndex,
            itemIndex: dragItem.itemIndex,
          },
          targetSectionIndex: sectionIndex,
          targetRowIndex,
        });

        return { handled: true };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onMoveFieldToSection, onPaletteDrop, sectionIndex, targetRowIndex]
  );

  drop(ref);

  return (
    <div
      ref={ref}
      className={`builder-row-insert-zone builder-row-insert-zone--${variant}${
        isOver && canDrop ? ' is-drop-active' : ''
      }`}
    >
      <span className="builder-row-insert-zone__line" />
      <span className="builder-row-insert-zone__label">
        Drop here to add a new row
      </span>
    </div>
  );
};

const RowAppendDropZone = ({
  sectionIndex,
  rowIndex,
  rowLength,
  itemIndex,
  onPaletteDrop,
  onMoveField,
  onClick,
  style,
}) => {
  const ref = useRef();
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [DND_TYPES.FIELD, DND_TYPES.PALETTE],
      canDrop: (dragItem, monitor) => {
        if (monitor.getItemType() === DND_TYPES.PALETTE) {
          return rowLength < 12;
        }

        return canMoveFieldToRow({
          dragItem,
          sectionIndex,
          rowIndex,
          rowLength,
        });
      },
      drop(dragItem, monitor) {
        if (monitor.didDrop() || !monitor.isOver({ shallow: true })) {
          return undefined;
        }

        if (monitor.getItemType() === DND_TYPES.PALETTE) {
          onPaletteDrop({
            fieldType: dragItem.fieldType,
            sectionIndex,
            rowIndex,
            rowLength,
            targetType: 'field',
            itemIndex,
          });

          return { handled: true };
        }

        if (
          !canMoveFieldToRow({
            dragItem,
            sectionIndex,
            rowIndex,
            rowLength,
          })
        ) {
          return undefined;
        }

        onMoveField({
          source: {
            sectionIndex: dragItem.sectionIndex,
            rowIndex: dragItem.rowIndex,
            itemIndex: dragItem.itemIndex,
          },
          target: {
            sectionIndex,
            rowIndex,
            itemIndex,
          },
        });

        return { handled: true };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [itemIndex, onMoveField, onPaletteDrop, rowIndex, rowLength, sectionIndex]
  );

  drop(ref);

  return (
    <button
      ref={ref}
      type="button"
      className={`builder-row-add-tile${
        isOver && canDrop ? ' is-drop-active' : ''
      }`}
      onClick={onClick}
      style={style}
    >
      Add Field +
    </button>
  );
};

const FieldCard = ({
  Field,
  fieldProps,
  item,
  itemIndex,
  sectionIndex,
  rowIndex,
  rowLength,
  handleOpen,
  handleDeleteFormGroup,
  onPaletteDrop,
  onMoveField,
}) => {
  const dragHandleRef = useRef();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPES.FIELD,
      item: {
        sectionIndex,
        rowIndex,
        itemIndex,
        colSpan: Number(item?.colSpan || 12),
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item?.colSpan, itemIndex, rowIndex, sectionIndex]
  );
  drag(dragHandleRef);

  return (
    <div
      style={{ width: '100%' }}
      role="presentation"
      className={`editable-field${isDragging ? ' is-dragging' : ''}`}
      onClick={(event) => {
        event?.preventDefault();
        event?.stopPropagation();
        handleOpen({
          item: { item, itemIndex },
          val: 'formGroup',
          type: 'field',
          rowIndex,
          sectionIndex,
          rowLength,
        });
      }}
    >
      <FieldEdgeDropZone
        position="before"
        sectionIndex={sectionIndex}
        rowIndex={rowIndex}
        rowLength={rowLength}
        itemIndex={itemIndex}
        onPaletteDrop={onPaletteDrop}
        onMoveField={onMoveField}
      />
      <FieldEdgeDropZone
        position="after"
        sectionIndex={sectionIndex}
        rowIndex={rowIndex}
        rowLength={rowLength}
        itemIndex={itemIndex}
        onPaletteDrop={onPaletteDrop}
        onMoveField={onMoveField}
      />
      <span ref={dragHandleRef} className="drag-handle">
        <DragIndicatorIcon
          className="drag-icon"
          sx={{ fontSize: '20px', color: palette.grey[600] }}
        />
      </span>
      <div className="editable-field__content">
        <Field
          {...fieldProps}
          preview
          style={{ cursor: 'pointer', pointerEvents: 'none' }}
        />
      </div>
      <Iconify
        icon="eva:close-outline"
        className="editable-field__delete"
        sx={{
          width: 20,
          height: 20,
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={(event) => {
          event?.stopPropagation();
          handleDeleteFormGroup({
            sectionIndex,
            rowIndex,
            itemIndex,
          });
        }}
      />
    </div>
  );
};

const FieldsRow = ({
  rows,
  index,
  sectionIndex,
  rowLength,
  form,
  gridGap,
  handleOpen,
  handleDeleteFormGroup,
  columnsPerRow,
  moveFormGroups = () => {},
  onPaletteDrop,
  onMoveField,
}) => {
  const ref = useRef();
  const rowDragHandleRef = useRef();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPES.ROW,
      item: { index, sectionIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index, sectionIndex]
  );

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: DND_TYPES.ROW,
      canDrop: (dragItem) => dragItem.sectionIndex === sectionIndex,
      hover(dragItem, monitor) {
        if (!ref.current) {
          return;
        }

        const dragIndex = dragItem.index;
        const hoverIndex = index;

        if (
          dragItem.sectionIndex !== sectionIndex ||
          dragIndex === hoverIndex
        ) {
          return;
        }

        moveFormGroups(dragIndex, hoverIndex);
        // eslint-disable-next-line no-param-reassign
        dragItem.index = hoverIndex;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [
      index,
      moveFormGroups,
      sectionIndex,
    ]
  );

  drop(ref);
  drag(rowDragHandleRef);

  return (
    <div
      ref={ref}
      className={`builder-row${
        isOver && canDrop ? ' is-drop-active' : ''
      }${isDragging ? ' is-dragging' : ''}`}
      style={{ gap: gridGap }}
    >
      <div
        ref={rowDragHandleRef}
        className="builder-row-drag-handle"
        role="presentation"
        onClick={(event) => event.stopPropagation()}
      >
        <DragIndicatorIcon
          sx={{ fontSize: '18px', color: palette.grey[600] }}
        />
      </div>
      <CustomForm
        form={form}
        columnsPerRow={rowLength}
        gridGap={FIELD_GRID_SPACING}
        formGroups={rows}
        fieldWrapper={(Field, itemIndex, item) => (fieldProps) => (
          <FieldCard
            Field={Field}
            fieldProps={fieldProps}
            item={item}
            itemIndex={itemIndex}
            sectionIndex={sectionIndex}
            rowIndex={index}
            rowLength={rowLength}
            handleOpen={handleOpen}
            handleDeleteFormGroup={handleDeleteFormGroup}
            onPaletteDrop={onPaletteDrop}
            onMoveField={onMoveField}
          />
        )}
      />
      {rowLength < 12 && (
        <RowAppendDropZone
          sectionIndex={sectionIndex}
          rowIndex={index}
          rowLength={rowLength}
          itemIndex={rows.length}
          onPaletteDrop={onPaletteDrop}
          onMoveField={onMoveField}
          onClick={() =>
            handleOpen({
              val: 'formGroup',
              type: 'field',
              rowIndex: index,
              sectionIndex,
              rowLength,
              item: { item: { colSpan: 12 - rowLength } },
            })
          }
          style={{
            flexBasis: `calc(94% / ${
              12 - rowLength ? columnsPerRow / (12 - rowLength) : columnsPerRow
            } - ${gridGap})`,
          }}
        />
      )}
    </div>
  );
};

const SectionItem = ({
  sectionGroups,
  sectionIndex,
  isCollapsed = false,
  gridGap,
  handleOpen,
  handleOnEditSectionTitle,
  handleDeleteFormGroup,
  form,
  columnsPerRow,
  moveSection,
  formGroups,
  setFormGroups,
  onPaletteDrop,
  onMoveField,
  onMoveFieldToSection,
  onToggleCollapse = () => {},
}) => {
  const ref = useRef();
  const sectionDragHandleRef = useRef();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPES.SECTION,
      item: { sectionIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [sectionIndex]
  );

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: DND_TYPES.SECTION,
      hover(dragItem, monitor) {
        if (!ref.current) {
          return;
        }

        const dragIndex = dragItem.sectionIndex;
        const hoverIndex = sectionIndex;

        if (dragIndex === hoverIndex) {
          return;
        }

        moveSection(dragItem.sectionIndex, sectionIndex);
        // eslint-disable-next-line no-param-reassign
        dragItem.sectionIndex = hoverIndex;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [
      moveSection,
      sectionIndex,
    ]
  );

  drop(ref);
  drag(sectionDragHandleRef);

  const moveFormGroups = useCallback(
    (fromIndex, toIndex) => {
      const parsedFormGroups = [...formGroups];
      const draggedRow = parsedFormGroups[sectionIndex].fields[fromIndex];
      parsedFormGroups[sectionIndex].fields.splice(fromIndex, 1);
      parsedFormGroups[sectionIndex].fields.splice(toIndex, 0, draggedRow);
      setFormGroups(parsedFormGroups);
    },
    [formGroups, sectionIndex, setFormGroups]
  );

  if (Array.isArray(sectionGroups)) {
    const rowLength = getRowLength(sectionGroups);

    return (
      <FieldsRow
        rows={sectionGroups}
        sectionIndex={sectionIndex}
        rowLength={rowLength}
        form={form}
        gridGap={gridGap}
        handleOpen={handleOpen}
        handleDeleteFormGroup={handleDeleteFormGroup}
        columnsPerRow={columnsPerRow}
        onPaletteDrop={onPaletteDrop}
        onMoveField={onMoveField}
      />
    );
  }

  return (
    <div
      ref={ref}
      className={`builder-section-card${isCollapsed ? ' is-collapsed' : ''}${
        isOver && canDrop ? ' is-drop-active' : ''
      }${isDragging ? ' is-dragging' : ''}`}
    >
      <div className="builder-section-header">
        <div className="builder-section-copy">
          <div className="builder-section-heading">
            <span
              ref={sectionDragHandleRef}
              className="builder-section-drag-handle"
              role="presentation"
              onClick={(event) => event.stopPropagation()}
            >
              <DragIndicatorIcon
                sx={{ fontSize: '18px', color: palette.grey[600] }}
              />
            </span>
            <span className="builder-section-title">
              {sectionGroups?.title || `Section ${sectionIndex + 1}`}
            </span>
          </div>
          {sectionGroups?.sectionDescription && (
            <FormLabel sx={{ fontSize: '12px' }}>
              {sectionGroups?.sectionDescription}
            </FormLabel>
          )}
          {isCollapsed && (
            <FormLabel className="builder-section-status">
              {`${sectionGroups?.fields?.length || 0} row${
                sectionGroups?.fields?.length === 1 ? '' : 's'
              } hidden`}
            </FormLabel>
          )}
        </div>
        <div className="builder-section-actions">
          <button
            type="button"
            className="builder-icon-button"
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            title={isCollapsed ? 'Expand section' : 'Collapse section'}
            onClick={(event) => {
              event.stopPropagation();
              onToggleCollapse();
            }}
          >
            <Iconify
              icon={
                isCollapsed ? 'eva:chevron-down-fill' : 'eva:chevron-up-fill'
              }
              sx={{ width: 18, height: 18 }}
            />
          </button>
          <ActionButton
            variant="outlined"
            onClick={() =>
              handleOpen({
                val: 'formGroup',
                type: 'row',
                sectionIndex,
                item: { item: { colSpan: 12 } },
              })
            }
          >
            Add Field
          </ActionButton>
          <Iconify
            icon="uil:edit"
            cursor="pointer"
            sx={{ width: 20, height: 20 }}
            onClick={() =>
              handleOnEditSectionTitle({
                sectionIndex,
                sectionGroups,
              })
            }
          />
          <Iconify
            icon="eva:close-outline"
            cursor="pointer"
            sx={{ width: 20, height: 20 }}
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteFormGroup({ sectionIndex });
            }}
          />
        </div>
      </div>

      {!isCollapsed && (
        <div className="builder-section-fields">
          {sectionGroups?.fields?.length ? (
            <>
              <RowInsertionDropZone
                sectionIndex={sectionIndex}
                targetRowIndex={0}
                onPaletteDrop={onPaletteDrop}
                onMoveFieldToSection={onMoveFieldToSection}
              />
              {sectionGroups?.fields?.map((rowGroup, index) => {
                const rowLength = getRowLength(rowGroup);

                return (
                  <React.Fragment
                    key={rowGroup?.[0]?.id || `${sectionIndex}-${index}`}
                  >
                    <FieldsRow
                      rows={rowGroup}
                      index={index}
                      sectionIndex={sectionIndex}
                      rowLength={rowLength}
                      form={form}
                      gridGap={gridGap}
                      handleOpen={handleOpen}
                      handleDeleteFormGroup={handleDeleteFormGroup}
                      columnsPerRow={columnsPerRow}
                      moveFormGroups={moveFormGroups}
                      onPaletteDrop={onPaletteDrop}
                      onMoveField={onMoveField}
                    />
                    <RowInsertionDropZone
                      sectionIndex={sectionIndex}
                      targetRowIndex={index + 1}
                      onPaletteDrop={onPaletteDrop}
                      onMoveFieldToSection={onMoveFieldToSection}
                    />
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <RowInsertionDropZone
              sectionIndex={sectionIndex}
              targetRowIndex={0}
              onPaletteDrop={onPaletteDrop}
              onMoveFieldToSection={onMoveFieldToSection}
              variant="empty"
            />
          )}
        </div>
      )}
    </div>
  );
};

const Builder = ({
  formGroups,
  columnsPerRow,
  gridGap = '8px',
  setFormGroups,
  handleFormGroups = () => {},
  handleDeleteFormGroup = () => {},
  handleEditFormGroups = () => {},
}) => {
  const form = useForm();
  const [open, setOpen] = useState('');
  const [indexes, setIndexes] = useState({});
  const [formGroupType, setFormGroupsType] = useState('');
  const [sectionTitle, setSectionTitle] = useState({});
  const [maxColSpan, setMaxColSpan] = useState(12);
  const [fieldToEdit, setFieldToEdit] = useState();
  const [collapsedSections, setCollapsedSections] = useState({});

  const handleOpen = useCallback(
    ({
      val,
      rowIndex,
      sectionIndex,
      insertRowIndex,
      type,
      title,
      rowLength = 0,
      item,
      sectionDescription,
    }) => {
      setFieldToEdit(item);
      setIndexes({ rowIndex, sectionIndex, insertRowIndex });
      setFormGroupsType(type);
      setMaxColSpan(
        type === 'field' ? Math.max(0, 12 - Number(rowLength || 0)) : 12
      );
      setOpen(val);
      setSectionTitle({ title, sectionDescription });
    },
    []
  );

  const handleClose = useCallback(() => setOpen(false), []);

  const handleOnEditSectionTitle = useCallback(
    ({ sectionIndex, sectionGroups }) => {
      handleOpen({
        val: 'section',
        sectionIndex,
        title: sectionGroups?.title,
        sectionDescription: sectionGroups?.sectionDescription,
      });
    },
    [handleOpen]
  );

  const moveSection = useCallback(
    (fromIndex, toIndex) => {
      const fromCard = formGroups[fromIndex];
      const newFormGroups = [...formGroups];
      newFormGroups.splice(fromIndex, 1);
      newFormGroups.splice(toIndex, 0, fromCard);
      setFormGroups(newFormGroups);
    },
    [formGroups, setFormGroups]
  );

  const handleToggleCollapse = useCallback((sectionKey) => {
    setCollapsedSections((prevState) => ({
      ...prevState,
      [sectionKey]: !prevState?.[sectionKey],
    }));
  }, []);

  const handlePaletteDrop = useCallback(
    ({
      fieldType,
      sectionIndex,
      rowIndex,
      rowLength = 0,
      targetType,
      itemIndex,
      insertRowIndex,
    }) => {
      const nextColSpan =
        targetType === 'field' ? Math.max(1, 12 - rowLength) : 12;

      handleOpen({
        val: 'formGroup',
        rowIndex,
        sectionIndex,
        insertRowIndex,
        type: targetType,
        rowLength,
        item: {
          item: buildFieldDraft({ fieldType, colSpan: nextColSpan }),
          itemIndex,
        },
      });
    },
    [handleOpen]
  );

  const handleMoveField = useCallback(
    ({ source, target }) => {
      setFormGroups(
        moveFieldInForm({
          formGroups,
          source,
          target,
        })
      );
    },
    [formGroups, setFormGroups]
  );

  const handleMoveFieldToSection = useCallback(
    ({ source, targetSectionIndex, targetRowIndex }) => {
      setFormGroups(
        moveFieldToNewRow({
          formGroups,
          source,
          targetSectionIndex,
          targetRowIndex,
        })
      );
    },
    [formGroups, setFormGroups]
  );

  const handlePaletteQuickAdd = useCallback(
    (fieldType) => {
      if (formGroups?.length) {
        handlePaletteDrop({
          fieldType,
          sectionIndex: formGroups.length - 1,
          targetType: 'row',
        });
        return;
      }

      handlePaletteDrop({ fieldType });
    },
    [formGroups, handlePaletteDrop]
  );

  const [{ isCanvasOver, canDropOnCanvas }, canvasDrop] = useDrop(
    () => ({
      accept: DND_TYPES.PALETTE,
      drop(item, monitor) {
        if (monitor.didDrop() || !monitor.isOver({ shallow: true })) {
          return undefined;
        }

        handlePaletteDrop({ fieldType: item.fieldType });
        return { handled: true };
      },
      collect: (monitor) => ({
        isCanvasOver: monitor.isOver({ shallow: true }),
        canDropOnCanvas: monitor.canDrop(),
      }),
    }),
    [handlePaletteDrop]
  );

  return (
    <div className="formBuilder-container">
      <div className="builder-shell">
        <div className="builder-canvas-column">
          <div className="builder-panel builder-canvas-panel">
            <div className="builder-panel-header">
              <div>
                <h3 className="builder-panel-title">Form Canvas</h3>
                <p className="builder-panel-subtitle">
                  Build the form on the left by dragging fields from the
                  library, or use Add Section to create a blank section first.
                </p>
              </div>
              <ActionButton
                onClick={() => handleOpen({ val: 'section' })}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add Section
              </ActionButton>
            </div>

            <div
              ref={canvasDrop}
              className={`builder-canvas${
                isCanvasOver && canDropOnCanvas ? ' is-drop-active' : ''
              }`}
            >
              {formGroups?.length ? (
                formGroups?.map((sectionGroups, sectionIndex) => {
                  const sectionKey = getSectionKey(sectionGroups, sectionIndex);

                  return (
                    <SectionItem
                      key={sectionKey}
                      sectionGroups={sectionGroups}
                      sectionIndex={sectionIndex}
                      isCollapsed={Boolean(collapsedSections?.[sectionKey])}
                      gridGap={gridGap}
                      handleOpen={handleOpen}
                      handleOnEditSectionTitle={handleOnEditSectionTitle}
                      handleDeleteFormGroup={handleDeleteFormGroup}
                      form={form}
                      columnsPerRow={columnsPerRow}
                      moveSection={moveSection}
                      formGroups={formGroups}
                      setFormGroups={setFormGroups}
                      onPaletteDrop={handlePaletteDrop}
                      onMoveField={handleMoveField}
                      onMoveFieldToSection={handleMoveFieldToSection}
                      onToggleCollapse={() => handleToggleCollapse(sectionKey)}
                    />
                  );
                })
              ) : (
                <div className="builder-empty-state">
                  <span className="builder-empty-state__title">
                    Start building your custom form
                  </span>
                  <span className="builder-empty-state__copy">
                    Drag a field from the right panel into this canvas, or add a
                    blank section first.
                  </span>
                </div>
              )}

              <button
                type="button"
                className="builder-new-section"
                onClick={() => handleOpen({ val: 'section' })}
              >
                <span className="builder-new-section__title">
                  Add Blank Section
                </span>
                <span className="builder-new-section__copy">
                  Create a section first, then drop fields inside it.
                </span>
              </button>
            </div>
          </div>
        </div>

        <aside className="builder-sidebar-column">
          <div className="builder-panel builder-palette-panel">
            <div className="builder-panel-header builder-panel-header--stacked">
              <div>
                <h3 className="builder-panel-title">Field Library</h3>
                <p className="builder-panel-subtitle">
                  Drag or click a field type to add it to the form.
                </p>
              </div>
            </div>

            <div className="builder-palette-grid">
              {FIELD_LIBRARY.map((item) => (
                <FieldPaletteCard
                  key={item.value}
                  item={item}
                  onClickAdd={handlePaletteQuickAdd}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {open === 'section' ? (
        <SectionTitleModal
          open={!!open}
          handleClose={handleClose}
          handleFormGroups={handleFormGroups}
          sectionIndex={indexes?.sectionIndex}
          defaultValue={sectionTitle}
          type={indexes?.sectionIndex !== undefined ? 'edit' : 'add'}
          handleEditFormGroups={handleEditFormGroups}
        />
      ) : open === 'formGroup' ? (
        <AddField
          isVisible={!!open}
          handleClose={handleClose}
          rowIndex={indexes?.rowIndex}
          insertRowIndex={indexes?.insertRowIndex}
          itemIndex={fieldToEdit?.itemIndex}
          handleFormGroups={handleFormGroups}
          sectionIndex={indexes?.sectionIndex}
          formGroupType={formGroupType}
          maxColSpan={maxColSpan}
          fieldToEdit={fieldToEdit?.item}
          handleEditFormGroups={handleEditFormGroups}
        />
      ) : null}
    </div>
  );
};

export default Builder;
