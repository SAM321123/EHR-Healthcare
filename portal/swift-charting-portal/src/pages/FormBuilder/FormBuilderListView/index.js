import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { showConfirmDialog, showSnackbar, triggerEvents } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import palette from 'src/theme/palette';
import { generatePath } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';

import EditFormConfig from '../editForm';
import FormConfiguration from '../configurationForm';
import MasterFormPage from '../../Masters/masterForm';

const getListId = (type) => `form-builder-list-view-${type}`;

const getFormLabel = (type) => {
  const map = {
    FT_QUESTIONNAIRES: 'Questionnaire',
    FT_CONSENT_FORMS: 'Consent Form',
    FT_NOTE_TEMPLATES: 'Note Template',
    FT_HISTORY_TEMPLATES: 'History Form',
    FT_ENCOUNTER_TEMPLATES: 'Encounter Form',
  };
  return map[type] || 'Form';
};

// Read-only status badge
const StatusBadge = ({ isActive }) => {
  const label = isActive ? 'Active' : 'Inactive';
  const color = isActive
    ? palette.background.appleGreen
    : palette.background.mediumPurple;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: `${color}22`,
        color,
        borderRadius: '20px',
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      {label}
    </Box>
  );
};

// Category sidebar item
const CategoryItem = ({ category, isSelected, onClick }) => (
  <Box
    onClick={() => onClick(category)}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 1.5,
      py: 1.25,
      mb: 0.5,
      borderRadius: '8px',
      cursor: 'pointer',
      backgroundColor: isSelected ? palette.background.accentBlue : 'transparent',
      borderLeft: isSelected
        ? `3px solid ${palette.primary.main}`
        : '3px solid transparent',
      transition: 'all 0.15s ease',
      '&:hover': { backgroundColor: palette.background.accentBlue },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      {isSelected ? (
        <FolderOpenOutlinedIcon
          sx={{ fontSize: 18, color: palette.primary.main, flexShrink: 0 }}
        />
      ) : (
        <FolderOutlinedIcon
          sx={{ fontSize: 18, color: palette.grey[500], flexShrink: 0 }}
        />
      )}
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: isSelected ? 600 : 400,
          color: isSelected ? palette.primary.main : palette.text.primary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {category?.name}
      </Typography>
    </Box>
  </Box>
);

const RowActionsMenu = ({ row, onMarkActive, onPrint, onDelete, onShare }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleClose = (e) => {
    e?.stopPropagation();
    setAnchorEl(null);
  };

  const handle = (fn) => (e) => {
    e.stopPropagation();
    handleClose();
    fn(row);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        sx={{ color: palette.grey[600] }}
        aria-label="More actions"
      >
        <MoreVertIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              borderRadius: '8px',
              minWidth: 160,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem sx={{ fontSize: 13 }} onClick={handle(onMarkActive)}>
          {row?.isActive ? 'Mark in-Active' : 'Mark active'}
        </MenuItem>
        <MenuItem sx={{ fontSize: 13 }} onClick={handle(onPrint)}>
          Print Or Save
        </MenuItem>
        <MenuItem sx={{ fontSize: 13, color: palette.error.main }} onClick={handle(onDelete)}>
          Delete
        </MenuItem>
        <MenuItem sx={{ fontSize: 13 }} onClick={handle(onShare)}>
          Share
        </MenuItem>
      </Menu>
    </>
  );
};

const FormBuilderListView = ({
  type,
  addMoreForm = true,
  addMoreAction = true,
}) => {
  const listId = getListId(type);

  const [selectedFormConfig, setSelectedFormConfig] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [formConfigToEdit, setFormConfigToEdit] = useState(null);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const isEditorVisible = !!selectedFormConfig?.id;

  // ── Fetch forms ──────────────────────────────────────────────
  const queryParams = useMemo(() => {
    return {
      formTypeCode: type,
      ...(selectedCategory && { formCategoryCode: selectedCategory.code }),
    };
  }, [type, selectedCategory]);

  const [
    formList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
    ,
    updateReadData
  ] = useQuery({
    listId,
    url: API_URL.saveForm,
    type: REQUEST_METHOD.get,
    queryParams,
  });

  useEffect(() => {
    handleOnFetchDataList();
  }, [handleOnFetchDataList]);

  // ── Fetch categories ─────────────────────────────────────────
  const [getMasterResponse, , , getMaster] = useCRUD({
    id: `master-categories-list-${type}`,
    type: REQUEST_METHOD.get,
    url: `${API_URL.getMasters}/form_category`,
  });

  useEffect(() => {
    getMaster({ isActive: true, limit: 300 });
  }, []);

  useEffect(() => {
    Events.on('REFRESH-FORM-CATEGORY', `category-refresh-${type}`, () => {
      getMaster({ isActive: true, limit: 300 });
    });
    return () => {
      Events.remove('REFRESH-FORM-CATEGORY', `category-refresh-${type}`);
    };
  }, [getMaster, type]);

  const categories = useMemo(() => {
    if (!getMasterResponse?.results) return [];
    const filtered = getMasterResponse.results.filter(
      (item) => item?.parent?.code === type
    );
    return [...filtered].reverse();
  }, [getMasterResponse, type]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const filteredForms = useMemo(() => {
    return formList?.results || [];
  }, [formList?.results]);

  const [updateFormResponse, , , updateForm, clearUpdateForm] = useCRUD({
    id: `form-list-update-${type}`,
    type: REQUEST_METHOD.update,
    url: API_URL.saveForm,
  });

  const [shareFormResponse, , , shareForm, clearShareForm] = useCRUD({
    id: `form-list-share-${type}`,
    type: REQUEST_METHOD.get,
    url: `${API_URL.saveForm}/share-form`,
  });

  useEffect(() => {
    if (shareFormResponse) {
      showSnackbar({ message: 'Share successfully', severity: 'success' });
      clearShareForm(true);
    }
  }, [shareFormResponse, clearShareForm]);

  useEffect(() => {
    if (updateFormResponse) {
      const message = updateFormResponse.isDeleted ? successMessage.delete : successMessage.update;
      showSnackbar({ message, severity: 'success' });
      triggerEvents(`REFRESH-TABLE-${listId}`);
      clearUpdateForm(true);
    }
  }, [updateFormResponse, listId, clearUpdateForm]);

  const handleMarkActive = useCallback(
    (row) => {
      updateForm({ isActive: !row?.isActive }, `/${row?.id}`);
    },
    [updateForm]
  );

  const handleDeleteFormConfirmed = useCallback(
    ({ data, close }) => {
      updateForm({ isDeleted: true }, `/${data?.id}`);
      close(false);
    },
    [updateForm]
  );

  const handleDeleteRow = useCallback(
    (row) => {
      showConfirmDialog({
        data: row,
        confirmAction: handleDeleteFormConfirmed,
        message: 'Are you sure you want to delete?',
      });
    },
    [handleDeleteFormConfirmed]
  );

  const handleShareRow = useCallback(
    (row) => {
      shareForm({}, `/${row?.id}`);
    },
    [shareForm]
  );

  const handlePrint = useCallback((data) => {
    const path = generatePath(`/${UI_ROUTES.printForm}`, { formId: data.id });
    window.open(path, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  }, []);

  const handleCategoryClick = useCallback(
    (cat) => {
      setSelectedCategory(cat);
      handlePageChange(null, 1);
    },
    [handlePageChange]
  );

  const handleOpenAddCategory = useCallback(
    () => setIsCategoryModalVisible(true),
    []
  );

  const handleCloseAddCategory = useCallback(() => {
    setIsCategoryModalVisible(false);
    getMaster({ isActive: true, limit: 300 });
  }, [getMaster]);

  const handleOpenAddForm = useCallback(() => {
    setFormConfigToEdit(null);
    setIsFormModalVisible(true);
  }, []);

  const handleCloseFormModal = useCallback((savedForm) => {
    setIsFormModalVisible(false);
    setFormConfigToEdit(null);
    if (savedForm && savedForm.id && !savedForm.target) {
       if (!savedForm.formCategory && selectedCategory) {
          savedForm.formCategory = selectedCategory;
       }
       let newResults = formList?.results || [];
       let newTotalResults = formList?.totalResults || 0;
       const exists = newResults.some(item => item.id === savedForm.id);
       if (exists) {
          newResults = newResults.map(item => item.id === savedForm.id ? savedForm : item);
       } else {
          newResults = [savedForm, ...newResults];
          newTotalResults = newTotalResults + 1;
       }
       updateReadData({ ...formList, results: newResults, totalResults: newTotalResults });
    }
  }, [listId, formList, updateReadData, selectedCategory]);

  const handleEditForm = useCallback((data) => setSelectedFormConfig(data), []);

  const handleEditorClose = useCallback((updatedForm) => {
    setSelectedFormConfig({});
    if (updatedForm && updatedForm.id && !updatedForm.target) {
       if (!updatedForm.formCategory && selectedCategory) {
          updatedForm.formCategory = selectedCategory;
       }
       let newResults = formList?.results || [];
       let newTotalResults = formList?.totalResults || 0;
       const exists = newResults.some(item => item.id === updatedForm.id);
       if (exists) {
          newResults = newResults.map(item => item.id === updatedForm.id ? updatedForm : item);
       } else {
          newResults = [updatedForm, ...newResults];
          newTotalResults = newTotalResults + 1;
       }
       updateReadData({ ...formList, results: newResults, totalResults: newTotalResults });
    }
  }, [listId, formList, updateReadData, selectedCategory]);

  const LINKED_FORM_TYPES = new Set(['FT_QUESTIONNAIRES', 'FT_ENCOUNTER_TEMPLATES']);

  const getLinkColumnLabel = () => {
    if (type === 'FT_QUESTIONNAIRES') return 'Linked Consent Form';
    if (type === 'FT_ENCOUNTER_TEMPLATES') return 'Linked Encounter Types';
    return 'Linked';
  };

  const getLinkValue = (data) => {
    if (type === 'FT_QUESTIONNAIRES') {
      const links = data?.linkedConsentForms;
      if (!links || links.length === 0) return null;
      return links.map((l) => l?.name || l).join(', ');
    }
    if (type === 'FT_ENCOUNTER_TEMPLATES') {
      const links = data?.encounterTypes;
      if (!links || links.length === 0) return null;
      return links.map((l) => l?.name || l).join(', ');
    }
    return null;
  };

  const columns = useMemo(() => {
    const baseCols = [
      { 
        label: '#', 
        dataKey: 'id', 
        sort: true,
        maxWidth: '2rem',
        render: ({ data }) => (
          <Typography sx={{ fontSize: 13, color: palette.text.primary }}>
            {data?.id || '—'}
          </Typography>
        )
      },
      {
        label: 'Form Name',
        dataKey: 'name',
        sort: true,
        maxWidth: '12rem',
        render: ({ data }) => (
          <Box>
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: palette.text.primary }}
            >
              {data?.name || '—'}
            </Typography>
            {data?.formCategory?.description && (
              <Typography
                sx={{ fontSize: 11, color: palette.grey[500], mt: 0.25 }}
              >
                {data.formCategory.description}
              </Typography>
            )}
          </Box>
        ),
      },
    ];

    if (LINKED_FORM_TYPES.has(type)) {
      baseCols.push({
        label: getLinkColumnLabel(),
        dataKey: 'linkedConsentForms',
        maxWidth: '12rem',
        render: ({ data }) => {
          const value = getLinkValue(data);
          if (!value) {
            return (
              <Typography sx={{ fontSize: 12, color: palette.grey[400] }}>
                —
              </Typography>
            );
          }
          return (
            <Typography sx={{ fontSize: 12, color: palette.text.secondary }}>
              {value}
            </Typography>
          );
        },
      });
    }

    baseCols.push(
      {
        label: 'Status',
        dataKey: 'isActive',
        maxWidth: '8rem',
        render: ({ data }) => <StatusBadge isActive={data?.isActive} />,
      },
      {
        label: 'Last Updated',
        dataKey: 'updatedAt',
        type: 'date',
        format: 'MMM DD, YYYY hh:mm A',
        maxWidth: '9rem',
      }
    );

    return baseCols;
  }, [type]);

  const actionButtons = useCallback(
    (row) => [
      { label: 'View', icon: 'view', action: handlePrint },
      { label: 'Edit', icon: 'edit', action: handleEditForm },
      {
        label: 'More',
        icon: 'more',
        action: () => {},
        renderIcon: () => (
          <RowActionsMenu
            row={row}
            onMarkActive={handleMarkActive}
            onPrint={handlePrint}
            onDelete={handleDeleteRow}
            onShare={handleShareRow}
          />
        ),
      },
    ],
    [
      handlePrint,
      handleEditForm,
      handleMarkActive,
      handleDeleteRow,
      handleShareRow,
    ]
  );

  const TableHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: { placeholder: 'Search forms...' },
            name: 'searchText',
          },
        ],
        rightComponents: [
          addMoreAction &&
            addMoreForm && {
              type: 'fabButton',
              style: { ml: 2 },
              actionLabel: `Add New ${getFormLabel(type)}`,
              onClick: handleOpenAddForm,
            },
        ].filter(Boolean),
      }),
    [handleOpenAddForm, addMoreAction, addMoreForm, type]
  );

  if (isEditorVisible) {
    return (
      <EditFormConfig
        selectedFormConfig={selectedFormConfig}
        setSelectedFormConfig={handleEditorClose}
      />
    );
  }

  return (
    <Container
      style={{ backgroundColor: palette.background.paper, padding: 0 }}
      loading={loading}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {/* ── Left: Categories ─────────────────────────────── */}
        <Box
          sx={{
            width: 220,
            flexShrink: 0,
            border: `1px solid ${palette.grey[200]}`,
            borderRadius: '10px',
            backgroundColor: palette.common.white,
            p: 1.5,
            minHeight: 400,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              px: 0.5,
            }}
          >
            <Typography
              sx={{ fontSize: 14, fontWeight: 700, color: palette.text.primary }}
            >
              Categories
            </Typography>
            {addMoreAction && (
              <Tooltip title="Add New Category">
                <IconButton
                  size="small"
                  onClick={handleOpenAddCategory}
                  sx={{
                    backgroundColor: palette.primary.main,
                    color: '#fff',
                    width: 24,
                    height: 24,
                    borderRadius: '6px',
                    '&:hover': { backgroundColor: palette.primary.dark },
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {categories.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: palette.grey[500], px: 0.5 }}>
              No categories yet
            </Typography>
          ) : (
            categories.map((cat) => (
              <CategoryItem
                key={cat.id || cat.code}
                category={cat}
                isSelected={selectedCategory?.id === cat.id}
                onClick={handleCategoryClick}
              />
            ))
          )}
        </Box>

        {/* ── Right: Forms table ───────────────────────────── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}
          >
            <FolderOpenOutlinedIcon
              sx={{ fontSize: 20, color: palette.primary.main }}
            />
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: palette.text.primary }}
            >
              {selectedCategory?.name || 'All Forms'}
            </Typography>
            <Chip
              label={formList?.totalResults || 0}
              size="small"
              sx={{
                height: 20,
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: palette.background.accentBlue,
                color: palette.primary.main,
                borderRadius: '10px',
                '& .MuiChip-label': { px: '6px' },
              }}
            />
          </Box>

          <Box
            sx={{
              border: `1px solid ${palette.grey[200]}`,
              borderRadius: '10px',
              backgroundColor: palette.common.white,
              overflow: 'hidden',
            }}
          >
            <Table
              headerComponent={
                <TableHeader onFilterChange={handleFilters} filters={filters} />
              }
              data={filteredForms}
              totalCount={formList?.totalResults || 0}
              columns={columns}
              pagination
              rowsPerPage={rowsPerPage}
              page={page}
              handlePageChange={handlePageChange}
              actionButtons={actionButtons}
              loading={loading}
              sort={sort}
              handleSort={handleSort}
              wrapperStyle={{
                backgroundColor: palette.common.white,
                boxShadow: 'none',
                border: 'none',
                borderRadius: 0,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Existing Add Form modal */}
      {isFormModalVisible && (
        <FormConfiguration
          isFormVisible={isFormModalVisible}
          handleFormVisibility={handleCloseFormModal}
          selectedFormConfig={formConfigToEdit || {}}
          setSelectedFormConfig={setFormConfigToEdit}
          selectedFormType={type}
          selectedCategory={selectedCategory}
          isConfigAddForm={!formConfigToEdit?.id}
        />
      )}

      {/* Existing Add Category modal */}
      {isCategoryModalVisible && (
        <MasterFormPage
          isVisible={isCategoryModalVisible}
          setIsVisible={setIsCategoryModalVisible}
          selectedMaster={{ code: 'form_category', name: 'Form Categories' }}
          handleCloseModal={handleCloseAddCategory}
          parentMasterCodeType={type}
        />
      )}
    </Container>
  );
};

export default FormBuilderListView;
