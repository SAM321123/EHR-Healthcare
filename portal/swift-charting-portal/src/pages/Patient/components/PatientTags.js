import Chip from '@mui/material/Chip';
import Box from 'src/components/Box';
import palette from 'src/theme/palette';

const PatientTags = ({ tags, onDelete }) => (
  <Box sx={{ justifyContent: 'center' }}>
    {tags?.map((tag, index) => {
      if (tag?.isDeleted) return null;
      const metaData = JSON.parse((tag?.tags?.metaData || tag?.metaData || '{}'));
      const showDelete = onDelete ? { onDelete: () => onDelete(index) } : null;
      return (
        <Chip
          key={tag?.tags?.name || tag?.name}
          size="small"
          label={tag?.tags?.name || tag?.name}
          sx={{
            backgroundColor: metaData?.color || palette.primary.main,
            ml: 1,
            fontSize: '11px',
            height: '20px',
            color: palette.common.white,
          }}
          {...showDelete}
        />
      );
    })}
  </Box>
);

export default PatientTags;
