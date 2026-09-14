import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useState } from 'react';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Box from 'src/components/Box';
import Container from 'src/components/Container';
import PageContent from 'src/components/PageContent';
import Typography from 'src/components/Typography';
import useCRUD from 'src/hooks/useCRUD';
import { successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import { showConfirmDialog, showSnackbar, triggerEvents } from 'src/lib/utils';
import { PRACTICE_ENUM_MASTERS_DATA } from 'src/store/types';
import palette from 'src/theme/palette';

import { generatePath } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import BackIcon from '../../assets/images/svg/back.svg';
import MasterFormPage from '../Masters/masterForm';
import FormConfiguration from './configurationForm';
import EditFormConfig from './editForm';

const FormBuilder = ({
  type,
  addMoreAction = true,
  isActive = true,
  addMoreForm = true,
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedFormConfig, setSelectedFormConfig] = useState({});
  const [isFormCategoryVisible, setIsFormCategoryVisible] = useState();
  const [isDeleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [getFormResponse, , , getForm, , updateFormListData] = useCRUD({
    id: `form-builder-list-${type}`,
    type: REQUEST_METHOD.get,
    url: API_URL.saveForm,
  });

  const [getMasterResponse, , getMasterResponseLoading, getMaster, , updateMasterList] = useCRUD(
    {
      id: `master`,
      type: REQUEST_METHOD.get,
      url: `${API_URL.getMasters}/form_category`,
    }
  );

  const [, , , , clearMaster] = useCRUD({
    id: PRACTICE_ENUM_MASTERS_DATA,
  });

  useEffect(() => {
    clearMaster(true);
  }, []);

  const updatedMasterResponse = useCallback((newCategory) => {
    if (newCategory) {
      // Ensure the relation is populated so it doesn't get filtered out
      if (!newCategory.parent && type) {
         newCategory.parent = { code: type };
      }
      let newResults = getMasterResponse?.results || [];
      const exists = newResults.some(item => item.id === newCategory.id);
      if (exists) {
         newResults = newResults.map(item => item.id === newCategory.id ? newCategory : item);
      } else {
         newResults = [...newResults, newCategory];
      }
      updateMasterList({ ...getMasterResponse, results: newResults });
    } else {
      getMaster({ isActive: true, limit: 300 });
    }
  }, [getMaster, getMasterResponse, updateMasterList, type]);

  useEffect(() => {
    Events.on('REFRESH-FORM-CATEGORY', 'formCategory', updatedMasterResponse);
  }, [updatedMasterResponse]);

  useEffect(() => {
    if (getMasterResponse) {
      const categories = getMasterResponse?.results?.filter(
        (item) => item?.parent?.code === type
      );
      setUniqueCategories(categories);
    }
  }, [getMasterResponse, type]);

  const [
    updateFormTypeResponse,
    ,
    updateFormLoading,
    updateForm,
    clearUpdateFormType,
  ] = useCRUD({
    id: 'delete-form-type',
    type: REQUEST_METHOD.update,
    url: API_URL.saveForm,
  });

  const [shareFormResponse, , shareFormLoading, shareForm, clearShareForm] =
    useCRUD({
      id: 'share-form',
      type: REQUEST_METHOD.get,
      url: `${API_URL.saveForm}/share-form`,
    });
  const [
    updateGlobalTypeResponse,
    ,
    updateGlobalTypeLoading,
    updateGlobalType,
    clearUpdateGlobalType,
  ] = useCRUD({
    id: 'delete-form-category',
    type: REQUEST_METHOD.update,
    url: API_URL.updateMasters,
  });

  useEffect(() => {
    getMaster(isActive ? { isActive, limit: 300 } : { limit: 300 });
  }, [getMaster, updateGlobalTypeResponse]);

  useEffect(() => {
    if (type) {
      getForm({ formTypeCode: type, limit: 10000 });
    }
  }, [updateFormTypeResponse, type]);

  useEffect(() => {
    if (updateFormTypeResponse || updateGlobalTypeResponse) {
      let message;
      if (isDeleteAlertVisible) {
        message = successMessage.delete;
      } else {
        message = 'Updated successfully';
      }
      showSnackbar({
        message,
        severity: 'success',
      });
      triggerEvents(`REFRESH-TABLE-form-builder-list-${type}`);
      setDeleteAlertVisible(false);
      clearUpdateFormType();
      clearUpdateGlobalType();
    }
    if (shareFormResponse) {
      showSnackbar({
        message: 'Share successfully',
        severity: 'success',
      });
      clearShareForm(true);
    }
  }, [
    isDeleteAlertVisible,
    type,
    updateFormTypeResponse,
    updateGlobalTypeResponse,
    shareFormResponse,
  ]);

  const handleFormVisibility = useCallback((savedForm) => {
    setIsFormVisible(!isFormVisible);
    if (savedForm && savedForm.id && !savedForm.target) {
       if (!savedForm.formCategory && selectedCategory) {
          savedForm.formCategory = selectedCategory;
       }
       let newResults = getFormResponse?.results || [];
       const exists = newResults.some(item => item.id === savedForm.id);
       if (exists) {
          newResults = newResults.map(item => item.id === savedForm.id ? savedForm : item);
       } else {
          newResults = [...newResults, savedForm];
       }
       updateFormListData({ ...getFormResponse, results: newResults });
    }
  }, [isFormVisible, getFormResponse, updateFormListData, selectedCategory]);

  const handleEditorClose = useCallback((updatedForm) => {
    setSelectedFormConfig({});
    if (updatedForm && updatedForm.id && !updatedForm.target) {
       if (!updatedForm.formCategory && selectedCategory) {
          updatedForm.formCategory = selectedCategory;
       }
       let newResults = getFormResponse?.results || [];
       const exists = newResults.some(item => item.id === updatedForm.id);
       if (exists) {
          newResults = newResults.map(item => item.id === updatedForm.id ? updatedForm : item);
       } else {
          newResults = [...newResults, updatedForm];
       }
       updateFormListData({ ...getFormResponse, results: newResults });
    }
  }, [getFormResponse, updateFormListData, selectedCategory]);

  const handleCategoryFormVisibility = useCallback(() => {
    setIsFormCategoryVisible(true);
  }, []);

  const handleDeleteForm = useCallback(
    ({ data, close }) => {
      updateForm({ isDeleted: true }, `/${data?.id}`);
      setDeleteAlertVisible(true);
      close(false);
      setContextMenu(null);
    },
    [updateForm]
  );

  const handleCloseModal = useCallback(() => {
    setIsFormCategoryVisible(false);
  }, []);
  const handleActiveForm = useCallback(() => {
    updateForm({ isActive: !currentItem?.isActive }, `/${currentItem?.id}`);
    setContextMenu(null);
    setCurrentItem(null);
  }, [currentItem]);

  const handleShareForm = useCallback(() => {
    shareForm({}, `/${currentItem?.id}`);
    setContextMenu(null);
    setCurrentItem(null);
  }, [currentItem]);

  const handleActiveCategory = useCallback(() => {
    updateGlobalType(
      { isActive: !currentCategory?.isActive },
      `/${currentCategory?.id}`
    );
    setContextMenu(null);
    setCurrentItem(null);
  }, [currentCategory]);

  const handleClick = (category) => {
    setSelectedCategory(category);
  };

  const onBack = useCallback(() => {
    setSelectedCategory('');
  }, []);

  const handleClickFile = useCallback((item) => {
    setSelectedFormConfig(item);
  }, []);

  const handleClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleContextMenu = useCallback(
    (event, item) => {
      event.preventDefault();
      setCurrentItem(item);
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
            }
          : null
      );
    },
    [contextMenu]
  );

  const handleCategoryContextMenu = useCallback(
    (event, item) => {
      event.preventDefault();
      setCurrentCategory(item);
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
            }
          : null
      );
    },
    [contextMenu]
  );

  const handleDeleteFormItem = useCallback(() => {
    showConfirmDialog({
      data: currentItem,
      confirmAction: handleDeleteForm,
      message: 'Are you sure you want to delete?',
    });
  }, [currentItem, handleDeleteForm]);

  const handlePrint = (form) => {
    const path = generatePath(`/${UI_ROUTES.printForm}`, { formId: form.id });
    window.open(
      path,
      '_blank',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );
  };

  return (
    <Container
      className="form-builder-container"
      loading={updateFormLoading || getMasterResponseLoading}
    >
      <PageContent
        style={{
          overflow: 'auto',
          background: isEmpty(selectedFormConfig) ? '#fff' : 'none',
        }}
      >
        {isEmpty(selectedFormConfig) ? (
          <Box>
            {selectedCategory ? (
              <Box>
                <Box sx={{ display: 'flex', mb: '15px', alignItems: 'center' }}>
                  <IconButton
                    sx={{
                      boxShadow: 'none',
                      padding: 0,
                      minWidth: 'unset',
                      backgroundColor: 'transparent',
                      borderRadius: '50%',
                      width: '26px',
                      height: '25px',
                    }}
                    onClick={onBack}
                  >
                    <img
                      src={BackIcon}
                      alt=""
                      style={{ cursor: 'pointer', padding: '6px' }}
                    />
                  </IconButton>
                  <Typography sx={{ ml: 1, fontSize: '14px' }}>
                    {selectedCategory?.name}
                  </Typography>
                </Box>
                <Box>
                  <Grid container>
                    {getFormResponse?.results
                      ?.filter(
                        (item) =>
                          item?.formCategory?.name === selectedCategory?.name
                      )
                      ?.map((item, index) => (
                        <div
                          key={index}
                          onContextMenu={(event) =>
                            handleContextMenu(event, item)
                          }
                        >
                          <Grid
                            item
                            onClick={() => {
                              handleClickFile(item);
                            }}
                            sx={{ textAlign: 'center', mb: 2 }}
                          >
                            <Box
                              sx={{
                                width: '120px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Box
                                sx={{
                                  width: '70px',
                                  height: '70px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: `1px solid ${palette.grey[300]}`,
                                  cursor: 'pointer',
                                  borderRadius: '5px',
                                  backgroundColor: item?.isActive
                                    ? ''
                                    : palette.grey[300],
                                }}
                              >
                                <FormatAlignJustifyIcon
                                  sx={{
                                    fontSize: '40px',
                                    color: palette.grey[700],
                                  }}
                                />
                              </Box>

                              <Typography sx={{ fontSize: '12px', mt: '4px' }}>
                                {item?.name}
                              </Typography>
                            </Box>
                          </Grid>
                          <Menu
                            open={contextMenu !== null}
                            onClose={handleClose}
                            anchorReference="anchorPosition"
                            anchorPosition={
                              contextMenu !== null
                                ? {
                                    top: contextMenu.mouseY,
                                    left: contextMenu.mouseX,
                                  }
                                : undefined
                            }
                          >
                            <MenuItem
                              sx={{ fontSize: '12px' }}
                              onClick={handleActiveForm}
                            >
                              {currentItem && currentItem?.isActive
                                ? 'Mark in-Active'
                                : 'Mark active'}
                            </MenuItem>
                            <MenuItem
                              sx={{ fontSize: '12px' }}
                              onClick={() => handlePrint(item)}
                            >
                              Print Or Save
                            </MenuItem>
                            <MenuItem
                              onClick={handleDeleteFormItem}
                              sx={{ fontSize: '12px' }}
                            >
                              Delete
                            </MenuItem>
                            <MenuItem
                              onClick={handleShareForm}
                              sx={{ fontSize: '12px' }}
                            >
                              Share
                            </MenuItem>
                          </Menu>
                        </div>
                      ))}
                    <div>
                      {(addMoreForm ||
                        (!addMoreForm &&
                          getFormResponse?.results?.filter(
                            (item) =>
                              item?.formCategory?.name ===
                              selectedCategory?.name
                          )?.length === 0)) && (
                        <Grid item sx={{ textAlign: 'center' }}>
                          <Box
                            sx={{
                              width: '120px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Box
                              sx={{
                                width: '70px',
                                height: '70px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${palette.grey[300]}`,
                                cursor: 'pointer',
                                borderRadius: '5px',
                              }}
                            >
                              <AddIcon
                                onClick={handleFormVisibility}
                                sx={{
                                  fontSize: '40px',
                                  color: palette.grey[700],
                                }}
                              />
                            </Box>
                            <Typography sx={{ fontSize: '12px', mt: '4px' }}>
                              Add
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </div>
                  </Grid>
                </Box>
              </Box>
            ) : (
              !getMasterResponseLoading && (
                <Grid container>
                  {uniqueCategories?.map((category, index) => (
                    <div
                      onContextMenu={(event) =>
                        handleCategoryContextMenu(event, category)
                      }
                    >
                      <Grid
                        item
                        key={index}
                        onClick={() => handleClick(category)}
                        sx={{ textAlign: 'center', mb: 2 }}
                      >
                        <Box
                          sx={{
                            width: '120px',
                            backgroundColor: category?.isActive
                              ? ''
                              : palette.grey[300],
                          }}
                        >
                          <FolderIcon
                            sx={{ fontSize: '45px', cursor: 'pointer' }}
                            color="primary"
                          />
                          <Typography sx={{ fontSize: '12px' }}>
                            {category?.name}
                          </Typography>
                        </Box>
                      </Grid>
                      <Menu
                        open={contextMenu !== null}
                        onClose={handleClose}
                        anchorReference="anchorPosition"
                        anchorPosition={
                          contextMenu !== null
                            ? {
                                top: contextMenu.mouseY,
                                left: contextMenu.mouseX,
                              }
                            : undefined
                        }
                      >
                        <MenuItem
                          sx={{ fontSize: '12px' }}
                          onClick={handleActiveCategory}
                        >
                          {currentCategory && currentCategory?.isActive
                            ? 'Mark in-Active'
                            : 'Mark active'}
                        </MenuItem>
                      </Menu>
                    </div>
                  ))}
                  {addMoreAction && (
                    <Grid item sx={{ textAlign: 'center' }}>
                      <Box sx={{ width: '120px' }}>
                        <CreateNewFolderIcon
                          onClick={handleCategoryFormVisibility}
                          sx={{ fontSize: '45px', cursor: 'pointer' }}
                          color="primary"
                        />
                        <Typography sx={{ fontSize: '12px' }}>Add</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )
            )}
          </Box>
        ) : (
          <EditFormConfig
            selectedFormConfig={selectedFormConfig}
            setSelectedFormConfig={handleEditorClose}
          />
        )}
      </PageContent>
      {isFormVisible && (
        <FormConfiguration
          isFormVisible={isFormVisible}
          handleFormVisibility={handleFormVisibility}
          setSelectedFormConfig={setSelectedFormConfig}
          selectedFormType={type}
          selectedCategory={selectedCategory}
          isConfigAddForm
        />
      )}
      {isFormCategoryVisible && (
        <MasterFormPage
          isVisible={isFormCategoryVisible}
          setIsVisible={setIsFormCategoryVisible}
          selectedMaster={{
            code: 'form_category',
            name: 'Form Categories',
          }}
          handleCloseModal={handleCloseModal}
          parentMasterCodeType={type}
        />
      )}
    </Container>
  );
};

export default FormBuilder;
