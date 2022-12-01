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
  Backdrop, CircularProgress, Stack, Typography
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import "./components.css";
import axios from "axios";

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
  const [status, setStatus] = useState("Uploading files");

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
            });
        } else if (selectedOpt === 1) {
          axios.get(serverURL + "/deploy/" + config)
            .then(res => console.log(res));
        }
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
          <Button size="small" onClick={handleClick}>{buttonOpts[selectedOpt]}</Button>
          <Button
            size="small" aria-label="select merge strategy" aria-haspopup="menu"
            aria-controls={collapsed ? "split-button-menu" : undefined}
            aria-expanded={collapsed ? "true" : undefined}
            onClick={handleToggle}>
            <ArrowDropDown />
          </Button>
        </ButtonGroup>
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
    </div>
  );
}

export default Control;