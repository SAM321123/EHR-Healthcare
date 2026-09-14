/* eslint-disable no-unused-vars */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { decodeHtml } from 'src/lib/utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Editor as CustomEditor } from 'ckeditor5-custom-build/build/ckeditor';
import './editor.css';
import { useMediaQuery } from '@mui/material';
import { Controller } from 'react-hook-form';
import { UPLOAD_URL } from 'src/api/constants';
import { mobileWidth } from 'src/lib/constants';

const Editor = ({
  type,
  disabled,
  error,
  required,
  formVariant,
  InputProps,
  register,
  label,
  textLabel,
  dropDownOptions = '[]',
  minHeight = '200px',
  onChange = () => {},
  control,
  name,
  setValue,
  getValues,
  form,
  showInputField,
  gridProps,
  getEditorOnReady = () => {},
  ...restProps
} = {}) => {
  const { setError = () => {} } = form || {};
  const { maxWidth, width = '100%' } = gridProps || {};


  const isMobile = useMediaQuery(mobileWidth);

  const editorRef = useRef();

  useEffect(() => {
    if (error) {
      const { editor } = editorRef.current;
      if (editor) {
        const errorPlugin = editor.plugins.get('ErrorPlugin');
        setTimeout(() => {
          errorPlugin.setErrorClass(true);
        }, 0);
      }
    }
  }, [error, editorRef]);

  useEffect(() => {
    const { editor } = editorRef.current;
    if (editor) {
      const dropDownPlugin = editor.plugins.get('DropDownPlugin');
      if(dropDownOptions){
      dropDownPlugin.updateDropDownOptions(dropDownOptions);
      }
    }
  }, [editorRef, dropDownOptions]);

  const onReady = useCallback(
    (editor) => {
      getEditorOnReady(editor);
      const dropDownPlugin = editor.plugins.get('DropDownPlugin');
      dropDownPlugin.updateDropDownOptions(dropDownOptions);


      editor.editing.view.change((writer) => {
        writer.setStyle(
          'min-height',
          minHeight,
          editor.editing.view.document.getRoot()
        );
      });

      // Store the editor instance
      editorRef.current = { editor };
    },
    [ dropDownOptions, minHeight, getEditorOnReady]
  );

  const editorConfig = useMemo(
    () => ({
      customDropdown: {
        options: dropDownOptions,
      },
      showInputField,
      simpleUpload: {
        uploadUrl: `${UPLOAD_URL}?editorFile=true`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      },
    }),
    [dropDownOptions, showInputField]
  );


  return (
    <div
      style={{
        maxWidth: isMobile ? '100vw' : '50vw',
        ...(maxWidth ? { maxWidth } : {}),
        width,
      }}
    >
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <CKEditor
            ref={editorRef}
            editor={CustomEditor}
            config={editorConfig}
            onReady={(editor) => {
              onReady(editor);
              // Set the initial data
              if(value){
              editor.setData(decodeHtml(value || ''));
              }
            }}
            onChange={(event, editor) => {
              // handleOnChange(event, editor);
              onChange(editor.getData());
            }}
            onBlur={onBlur}
            data={value || ''}
          />
        )}
      />
    </div>
  );
};

export default React.memo(Editor);
