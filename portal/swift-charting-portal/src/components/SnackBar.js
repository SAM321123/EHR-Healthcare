import Snackbar from "@mui/material/Snackbar";
import SnackbarContent from "@mui/material/SnackbarContent";
import Button from "@mui/material/Button";
import makeStyles from "@mui/styles/makeStyles";
import Slide from "@mui/material/Slide";

const useStyles = makeStyles({
  success: {
    backgroundColor: "#3A7D33",
  },
  error: {
    backgroundColor: "#b00020",
  },
  snackbarButton: {
    color: "white",
  },
});

const SnackBar = (props) => {
  const classes = useStyles();
  const {
    type = "success",
    message = "",
    button = "",
    callback = () => {},
    hideSnackbar = () => {},
  } = props;

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={!!(type && message)}
      autoHideDuration={3000}
      onClose={hideSnackbar}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'down' }}
    >
      <SnackbarContent
        className={classes[type]}
        message={message}
        action={
          !!button && [
            <Button
              className={classes.snackbarButton}
              key="button"
              size="small"
              onClick={callback}
            >
              {button}
            </Button>,
          ]
        }
      />
    </Snackbar>
  );
};

export default SnackBar;
