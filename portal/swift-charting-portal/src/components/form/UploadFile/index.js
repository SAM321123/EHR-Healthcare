/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import CloseIcon from '@mui/icons-material/Close';

import Box from 'src/components/Box';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import {
  downloadFile,
  downloadPdf,
  getImageUrl,
  showSnackbar,
  uploadImage,
} from 'src/lib/utils';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import pdfIcon from 'src/assets/images/pdf.png';

const UploadFile = ({
  textLabel,
  register,
  control,
  gridProps,
  setValue,
  showPreview = true,
  accept,
  getValues,
  form,
  fileInfo,
  buttonStyle={},
}) => {
  const values = getValues(register?.name) || {};
  const [file, setFile] = useState();
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (data, onChange) => {
    if(!data) return;
    try {
      if (data?.type) {
        setContentType(data?.type?.split?.('/')[0]);
      }

      if (data?.size > 10 * 1024 * 1024) {
        showSnackbar({
          message: 'File size exceeds 10MB',
          severity: 'error',
        });
        return;
      }
      data.fileInfo = fileInfo;

      setLoading((prev) => !prev);
      const response = await uploadImage(data);

      if (response?.id) {
        setLoading((prev) => !prev);
        form.setError(register?.name, '');
      }
      setFile(response);
      onChange(response);
    } catch (error) {
      setLoading(false);
      showSnackbar({
        message: error,
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    const data = getValues(register?.name);
    if (data?.id) {
      setFile(data);
    }
  }, [values?.file]);

  return (
    <Controller
      control={control}
      {...register}
      render={({ field, fieldState: { error } }) => {
        const { ref, onChange } = field;
        return (
          <Grid item xs={12} md={12} {...gridProps}>
            <Stack direction="row" flexWrap="wrap">
              <FormControl error={error}>
                <Input
                  type="file"
                  id={register?.name}
                  name={register?.name}
                  style={{ display: 'none' }}
                  inputProps={{
                    accept: accept || '.jpg,.jpeg,.png,.pdf,.doc,.docx',
                  }}
                  onChange={(data) =>
                    handleUpload(data.target.files?.[0], onChange)
                  }
                  ref={ref}
                />
                 {showPreview && file ? (
              <img
                src={ file?.mimetype==='application/pdf' ? pdfIcon : getImageUrl(file?.name)}
                alt="logo"
                style={{maxWidth:189,...(file?.mimetype==='application/pdf'? {width:24,height:24}:{})}}
              />
            ) :  <LoadingButton
            variant="outlined"
            component="label"
            htmlFor={register?.name}
            label={textLabel}
            loading={loading}
            sx={{
              border: error?.message
                ? `1px solid ${palette.error.main}`
                :  `1px solid ${palette.border.main} !important`,
              color: error?.message ? `${palette.error.main}` : palette.text.offWhite,
              ...buttonStyle,
            }}
          />}
                {error && <FormHelperText>{error?.message}</FormHelperText>}
              </FormControl>

              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  maxWidth:189,
                  marginTop:'5px'
                }}
              >
                <Link
                  component="button"
                  variant="body2"
                  sx={{ m: '0px 10px' }}
                  onClick={() =>file?.mimetype==='application/pdf'?downloadPdf(getImageUrl(file?.name)) : downloadFile(file?.file, file?.name)}
                >
                 <Typography  style={{maxWidth:150}} noWrap> {file?.name}</Typography>
                </Link>
                {file && (
                  <CloseIcon
                    size="small"
                    style={{
                      cursor: 'pointer',
                      color: palette.primary.main,
                      fontSize: '18px',
                    }}
                    onClick={() => {
                      setFile();
                      setValue(register?.name, null);
                    }}
                  />
                )}
              </Box>
            </Stack>
          </Grid>
        );
      }}
    />
  );
};

UploadFile.defaultProps = {
  type: 'text',
  error: '',
  required: false,
  formVariant: 'outlined-basic',
  variant: 'outlined',
  register: {},
};

UploadFile.propTypes = {
  type: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  formVariant: PropTypes.string,
  variant: PropTypes.string,
  register: PropTypes.instanceOf(Object),
};

export default UploadFile;
