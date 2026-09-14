import React from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import palette from "src/theme/palette";

export const Categories = [
  { label: "medicalMarijuana", value: "Medical Marijuana" },
  { label: "weightLossProgram", value: "Weight Loss Program" },
];

const Category = ({ handleCategory }) => (
  <Box
    sx={{
      border: `1px solid ${palette.common.white}`,
      backgroundColor: `${palette.common.white}`,
    }}
  >
    <Grid container sx={{ width: '60%', margin: '20px auto 60px' }}>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: '24px', margin: '10px 0px' }}>
          Choose a category
        </Typography>
        <Divider />
        <Stack direction="row-reverse">
          <Typography
            sx={{
              fontSize: '14px',
              margin: '10px 0px',
              color: palette.primary.main,
            }}
          >
            Manage Appointments
          </Typography>
        </Stack>
      </Grid>
      {Categories.map((category,index) => (
        <Grid item xs={12} key={index} sx={{ padding: '0px 15px' }}>
          <Card
            onClick={() => handleCategory(category.label)}
            sx={{
              padding: '10px',
              margin: '10px',
              border: `1px solid ${palette.secondary.main}`,
            }}
          >
            <Typography sx={{ padding: '10px', color: palette.common.black }}>
              {category.value}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default Category;
