import { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectModel, selectImage, selectLabels, selectShapes, selectThreshold, setThreshold, setAnnotations } from "../inferenceSlice";
import {
  Slider,
  ButtonGroup,
  Button,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Backdrop,
  CircularProgress,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  List,
  ListItem,
  ListItemText, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, Divider
} from "@mui/material";
import {ArrowDropDown, CheckCircleOutlineRounded} from "@mui/icons-material";
import "./components.css";
import axios from "axios";
import {LoadingButton} from "@mui/lab";

function Control(props) {
  const serverURL = "http://localhost:3600";

  const dispatch = useDispatch();
  const model = useSelector(selectModel);
  const image = useSelector(selectImage);
  const labels = useSelector(selectLabels);
  const shapes = useSelector(selectShapes);
  const threshold = useSelector(selectThreshold);

  // GroupButton (TEST and DEPLOY) properties
  const buttonOpts = ["TEST", "DEPLOY"];
  const anchorRef = useRef(null);
  const [selectedOpt, setSelectedOpt] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  // Progress bar
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Deployment dialog
  const [deployDialog, setDeployDialog] = useState(false);
  const [funcName, setFuncName] = useState("");
  const [funcDesc, setFuncDesc] = useState("");
  const [server, setServer] = useState("http://10.5.63.38:8070");
  const [serverTested, setServerTested] = useState(false);

  const handleMenuItemClick = (event, id) => {
    setSelectedOpt(id);
    setCollapsed(false);
  }

  const handleToggle = () => {
    setCollapsed((prevState) => !prevState);
  }

  const handleFold = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;
    setCollapsed(false);
  }

  const handleClick = () => {
    let config, subDir;

    setStatus("Uploading files");
    setLoading(true);
    axios.post(serverURL + "/upload", props.formData, {})
      .then(res => {
        const subDirArray = res.data.split("/");
        subDir = subDirArray[subDirArray.length - 1];

        config = btoa(JSON.stringify({
          "img": image.name, "mdl": model, "dir": subDir, "lbl": labels, "shp": shapes }));
        if (selectedOpt === 0) {
          setStatus("Running detection");
          axios.get(serverURL + "/test/" + config)
            .then(res => {
              dispatch(setAnnotations(JSON.parse(res.data.replace(/'/g, '"'))));
              setStatus("Rendering results"); })
            .then(() => {
              setStatus("DONE");
              setLoading(false);
            });
        } else if (selectedOpt === 1) {
          axios.get(serverURL + "/deploy/" + config)
            .then(res => console.log(res));
        }
      });
  }

  const testNuclio = () => {
    // TODO: Check Nuclio API to fix this test.
    setServerTested(true);
    axios.get(server + "/projects", {
      headers: {
        'x-nuclio-project-namespace': 'nuclio',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'} })
      .then(res => {
        console.log(res.data);
      });
  }

  return (
    <div className="controlContainer">
      <span style={{ marginRight: "1.5vw", fontStyle: "bold" }}>Threshold: </span>
      <Slider
        size="small" value={threshold} valueLabelDisplay="auto" key="box_slider"
        min={0} max={1} step={.01} sx={{ width: "40vw", marginRight: "2vw" }}
        onChange={(event, newValue) => { dispatch(setThreshold(newValue)); }}/>
      <div className="buttonGroupContainer">
        <ButtonGroup
          disabled={!(model && image.path && labels.length > 0  && shapes.length > 0)}
          variant="contained" ref={anchorRef} aria-label="split button">
          <Button
            onClick={selectedOpt === 0 ? handleClick : () => setDeployDialog(true)}
            size="small" disableElevation>
            {buttonOpts[selectedOpt]}
          </Button>
          <Button
            size="small" aria-label="select merge strategy" aria-haspopup="menu"
            aria-controls={collapsed ? "split-button-menu" : undefined}
            aria-expanded={collapsed ? "true" : undefined}
            onClick={handleToggle} disableElevation>
            <ArrowDropDown />
          </Button>
        </ButtonGroup>
        {/* TODO: Move this Popper into a component. */}
        <Popper
          sx={{ zIndex: 1 }} open={collapsed} anchorEl={anchorRef.current}
          role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === "bottom" ? "center top" : "center bottom" }}>
              <Paper>
                <ClickAwayListener onClickAway={handleFold}>
                  <MenuList id="split-button-menu" autoFocusItem>
                    {buttonOpts.map((buttonOpt, id) => (
                      <MenuItem
                        sx={{ fontSize: ".8em" }} key={buttonOpt}
                        selected={id === selectedOpt}
                        onClick={(event) => handleMenuItemClick(event, id)}>
                        {buttonOpt}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
      {/* TODO: Move this Backdrop into a component. */}
      <Backdrop open={loading}>
        {selectedOpt === 0 ?
          <Stack spacing={10} justifyContent="center" alignItems="center">
            <CircularProgress size="10rem" style={{ color: "white" }} />
            <Typography
              variant="h5" display="block" style={{ color: "white" }}>
              {status}
            </Typography>
          </Stack> :
          <Stack spacing={10} justifyContent="center" alignItems="center">
            <CircularProgress size="10rem" style={{ color: "white" }} />
            <Typography
              variant="h5" display="block" style={{ color: "white" }}>
              {status}
            </Typography>
          </Stack>}
      </Backdrop>
      <Dialog open={deployDialog} maxWidth="xl" fullWidth onClose={() => setDeployDialog(false)}>
        <DialogTitle
          style={{ marginBottom: "2vh", backgroundColor: "darkblue", color: "white" }}>
          Deployment Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={5} style={{ marginRight: "2vw" }}>
              <Typography variant="h6" style={{ marginBottom: "1vh" }}>Labels</Typography>
              <Paper sx={{ width: "100%", overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: "80vh" }}>
                  <Table stickyHeader size="small" aria-label="sticky table" sx={{ minWidth: "25vw" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell key="id" align="center" style={{ minWidth: "2vw" }}>ID</TableCell>
                        <TableCell key="label" align="left" style={{ minWidth: "20vw" }}>Label</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {labels.map((label, id) => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={id}>
                          <TableCell key={id + 1} align="center">{id + 1}</TableCell>
                          <TableCell key={label} align="left">{label}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Divider orientation="vertical" variant="middle" flexItem></Divider>
            <Grid item xs>
              <Typography variant="h6" style={{ marginBottom: "1vh" }}>Config</Typography>
              <TextField
                required fullWidth variant="standard" size="small"
                onChange={event => setFuncName(event.target.value)}
                label="Name" helperText="Example: Face Detection"/>
              <TextField
                required fullWidth variant="standard" size="small"
                onChange={event => setFuncDesc(event.target.value)}
                label="Description" helperText="Example: Face Detection for VIA ADAS" />
              <Divider variant="middle" style={{ marginTop: "3vh", marginBottom: "2vh", fontSize: ".8em" }}>
                Nuclio Settings
              </Divider>
              <Grid container spacing={3}>
                <Grid item xs>
                  <TextField
                    fullWidth variant="standard" size="small" onChange={event => setServer(event.target.value)}
                    defaultValue={server} label="Server Address" />
                </Grid>
                <Grid item xs={3} alignItems="flex-end">
                  {serverTested ?
                    <CheckCircleOutlineRounded className="modelIcon" color="success" /> :
                    <LoadingButton variant="outlined" size="medium" onClick={testNuclio}>Test</LoadingButton>}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Control;