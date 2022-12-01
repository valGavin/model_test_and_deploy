import { useSelector, useDispatch } from "react-redux";
import { selectShapes, setShapes } from "../inferenceSlice";
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from "@mui/material";

const MenuProps = { PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: 250 } } };

function Shapes() {
  const dispatch = useDispatch();
  const shapes = useSelector(selectShapes);

  const availableShapes= ["Box", "Points", "Polyline", "Polygon", "Cuboid", "Ellipse"];
  const handleChange = event => {
    const { target: { value } } = event;
    dispatch(setShapes(typeof value === "string" ? value.split(",") : value));
  }

  return (
    <div className="shapesContainer">
      <FormControl sx={{ width: "25vw" }} size="small" error={shapes.length < 1} required={shapes.length < 1}>
        <InputLabel id="shapes-opts-lbl">Shapes</InputLabel>
        <Select
          labelId="shapes-opts-lbl" value={shapes} onChange={handleChange}
          input={<OutlinedInput label="Shapes" />} MenuProps={MenuProps}
          renderValue={selected => selected.join(", ")} multiple>
          {availableShapes.map(shape => (
            // TODO: Update the "MenuItem disabled" for the newly supported shapes.
            <MenuItem key={shape} value={shape} disabled={shape !== "Box"}>
              <Checkbox checked={shapes.indexOf(shape) > -1} />
              <ListItemText primary={shape} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default Shapes;