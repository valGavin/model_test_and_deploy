import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectModel, selectImage, selectLabels, selectShapes, selectThreshold, setThreshold, setAnnotations } from "../inferenceSlice";
import { Slider, Backdrop, CircularProgress, Stack, Typography } from "@mui/material";
import axios from "axios";
import PropTypes from "prop-types";
import "./components.css";
import DeploymentDialog from "./DeploymentDialog";
import TestDeployGroup from "./TestDeployGroup";

DeploymentDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
};

TestDeployGroup.propTypes = {
  menuItemClick: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  fold: PropTypes.func.isRequired,
  setDialog: PropTypes.func.isRequired,
  click: PropTypes.func.isRequired,
  btn: PropTypes.object.isRequired
}

function Control(props) {
  const serverURL = "http://localhost:3600";

  const dispatch = useDispatch();
  const model = useSelector(selectModel);
  const image = useSelector(selectImage);
  const labels = useSelector(selectLabels);
  const shapes = useSelector(selectShapes);
  const threshold = useSelector(selectThreshold);

  // Components properties
  const [btnProps, setBtnProps] = useState({ opt: 0, collapsed: false });  // ButtonGroup
  const [bar, setBar] = useState({ loading: false, status: "" });  // Loading screen
  const [deployDialog, setDeployDialog] = useState(false);  // Deployment dialog

  const handleMenuItemClick = (event, id) => { setBtnProps({ opt: id, collapsed: false }); }

  const handleToggle = () => { setBtnProps({ opt: btnProps["opt"], collapsed: !btnProps["collapsed"] }); }

  const handleDialog = state => { setDeployDialog(state); }

  const handleFold = () => { setBtnProps({ opt: btnProps["opt"], collapsed: false }); }

  const handleClick = () => {
    let config, subDir;

    setBar({ loading: true, status: "Uploading files" });
    axios.post(serverURL + "/upload", props.formData, {})
      .then(res => {
        const subDirArray = res.data.split("/");
        subDir = subDirArray[subDirArray.length - 1];

        config = btoa(JSON.stringify({
          "img": image.name, "mdl": model, "dir": subDir, "lbl": labels, "shp": shapes }));
        if (btnProps["opt"] === 0) {
          setBar({ loading: true, status: "Running detection" });
          axios.get(serverURL + "/test/" + config)
            .then(res => {
              dispatch(setAnnotations(JSON.parse(res.data.replace(/'/g, '"'))));
              setBar({ loading: true, status: "Rendering results" }); })
            .then(() => { setBar({ loading: false, status: "DONE" }); });
        } else if (btnProps["opt"] === 1) {
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
      <TestDeployGroup
        menuItemClick={handleMenuItemClick} toggle={handleToggle} fold={handleFold}
        setDialog={handleDialog} click={handleClick} btn={btnProps} />
      <Backdrop open={bar["loading"]}>
        {btnProps["opt"] === 0 ?
          <Stack spacing={10} justifyContent="center" alignItems="center">
            <CircularProgress size="10rem" style={{ color: "white" }} />
            <Typography
              variant="h5" display="block" style={{ color: "white" }}>
              {bar["status"]}
            </Typography>
          </Stack> :
          <Stack spacing={10} justifyContent="center" alignItems="center">
            <CircularProgress size="10rem" style={{ color: "white" }} />
            <Typography
              variant="h5" display="block" style={{ color: "white" }}>
              {bar["status"]}
            </Typography>
          </Stack>}
      </Backdrop>
      <DeploymentDialog onClose={() => setDeployDialog(false)} open={deployDialog} />
    </div>
  );
}

export default Control;