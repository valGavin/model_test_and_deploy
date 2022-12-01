import { useDispatch, useSelector } from "react-redux";
import { modelUpload, selectModel } from "../inferenceSlice";
import { Button } from "@mui/material";
import { CheckCircleOutlineRounded, FileUploadRounded } from "@mui/icons-material";
import "./components.css";

function Model(props) {
  // Initialization
  const dispatch = useDispatch();
  const modelLoaded = useSelector(selectModel);

  return (
    modelLoaded ?
      <div className="modelInput">
        <span style={{ color: "green", marginLeft: ".7vw" }}>MODEL SELECTED</span>
        <CheckCircleOutlineRounded className="modelIcon" color="success" />
      </div> :
      <div className="modelInput">
        <Button
          variant="text" component="label"
          onChange={event => {
            props.formData.append("file", event.target.files[0]);
            dispatch(modelUpload(event.target.files[0].name)); }}
          endIcon={<FileUploadRounded color="action" />}>
          <span style={{ color: "red" }}>No Model Selected</span>
          <input type="file" accept={".zip, .pb"} hidden />
        </Button>
      </div>
  );
}

export default Model;