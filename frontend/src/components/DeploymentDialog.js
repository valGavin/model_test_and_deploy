import { useState } from "react";
import { useSelector } from "react-redux";
import { selectLabels } from "../inferenceSlice";
import {
  Dialog,
  DialogContent,
  DialogTitle, Divider, FormControl, FormControlLabel, FormLabel,
  Grid,
  Paper, Radio, RadioGroup, TableCell,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow, TextField,
  Typography
} from "@mui/material";
import { CheckCircleOutlineRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import axios from "axios";

function DeploymentDialog(props) {
  const { onClose, open } = props;

  const labels = useSelector(selectLabels);

  const [funcName, setFuncName] = useState("");
  const [funcDesc, setFuncDesc] = useState("");
  const [server, setServer] = useState("http://10.5.63.38:8070");
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState("");

  const testNuclio = () => {
    let tmp = [];
    axios.get(server + "/api/projects", { headers: { 'x-nuclio-project-namespace': 'nuclio' } })
      .then(res => {
        Object.keys(res.data).forEach(function (key) { tmp.push(key); });
        setProjects(tmp);
        setProject(tmp[0]);
      });
  }

  return (
    <Dialog open={open} maxWidth="xl" fullWidth onClose={onClose}>
      <DialogTitle
        style={{ marginBottom: "2vh", backgroundColor: "darkblue", color: "white" }}>
        Deployment Settings
      </DialogTitle>
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
              label="Name" helperText="Example: Face Detection" />
            <TextField
              required fullWidth variant="standard" size="small"
              onChange={event => setFuncDesc(event.target.value)}
              label="Description" helperText="Example: Face Detection for VIA DMS" />
            <Divider variant="middle" style={{ marginTop: "3vh", marginBottom: "2vh", fontSize: ".8em" }}>
              Nuclio Settings
            </Divider>
            <Grid container spacing={3}>
              <Grid item xs>
                <TextField
                  fullWidth variant="standard" size="small"
                  onChange={event => setServer(event.target.value)}
                  defaultValue={server} label="Server Address" />
              </Grid>
              <Grid item xs={3} alignItems="flex-end">
                {projects.length > 0 ?
                  <CheckCircleOutlineRounded className="modelIcon" color="success" style={{ marginTop: "2vh" }} /> :
                  <LoadingButton variant="outlined" size="medium" onClick={testNuclio} style={{ marginTop: "1vh" }}>Test</LoadingButton>}
              </Grid>
            </Grid>
            {projects.length > 0 ?
              <FormControl style={{ marginTop: "2vh" }}>
                <FormLabel id="projects" style={{ fontSize: ".8em" }}>Project</FormLabel>
                <RadioGroup
                  aria-labelledby="projects" name="projects-radio-group" row defaultValue={project}
                  value={project} onChange={event => setProject(event.target.value)}>
                  {projects.map(prj => (
                    <FormControlLabel
                      control={<Radio key={prj + "_radio"} size="small" />}
                      label={prj} value={prj} key={prj} />
                  ))}
                </RadioGroup>
              </FormControl> :
              <Typography variant="caption" color="red">
                Test the connection to the nuclio server
              </Typography>}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default DeploymentDialog;