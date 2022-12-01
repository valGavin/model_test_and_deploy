import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Autocomplete, Chip, TextField, Button } from "@mui/material";
import { FileUploadRounded } from "@mui/icons-material";
import { setLabels, selectLabels } from "../inferenceSlice";
import "./components.css"

function Labels() {
  const [uploaded, setUploaded] = useState(false);
  const dispatch = useDispatch();
  const labels = useSelector(selectLabels);

  const readLabelFile = (labelFile) => {
    let labelArray = [];
    const reader = new FileReader();
    reader.readAsText(labelFile);
    reader.onload = () => {
      reader.result.split(/\r?\n/).forEach(line => {
        if (line.includes("display_name")) {
          labelArray.push(line.trim().split("display_name: ")[1]
            .replace(/'/g, "").replace(/"/g, ""));
        } else if (line.includes("name")) {
          if (!reader.result.includes("display_name")) {
            labelArray.push(line.trim().split("name: ")[1]
              .replace(/'/g, "").replace(/"/g, ""));
          }
        }
      });
      setUploaded(true);
      dispatch(setLabels([...labels, ...labelArray.filter(label => labels.indexOf(label) === -1)]));
    }
  }

  return (
    <div className="labelContainer">
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Button
          variant="text" component="label" size="small" disabled={uploaded}
          onChange={event => readLabelFile(event.target.files[0])}
          sx={{ marginLeft: "auto", marginRight: 0, color: "grey", fontSize: ".7em" }}
          endIcon={<FileUploadRounded color="action" />}>
          {uploaded ? "Label Uploaded" : "Upload Label"}
          <input type="file" accept={".pbtxt, .txt"} hidden />
        </Button>
      </div>
      <Autocomplete
        value={labels} sx={{ overflowY: "auto", paddingTop: "1vh", paddingBottom: ".5vh" }}
        multiple freeSolo options={[]} className="labelList"
        onChange={(event, newLabel) => { dispatch(setLabels(newLabel)); }}
        renderTags={(tagValue, getTagProps) => tagValue.map((lbl, index) => (
          <Chip
            key={lbl} label={lbl}
            {...getTagProps({ index })} />
        ))}
        renderInput={(params) => (
          <TextField {...params} label="Labels" />
        )} />
    </div>
  );
}

export default Labels;