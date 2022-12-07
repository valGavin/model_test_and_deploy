import { useRef } from "react";
import { useSelector } from "react-redux";
import { selectImage, selectLabels, selectModel, selectShapes } from "../inferenceSlice";
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";

function TestDeployGroup(props) {
  const { menuItemClick, toggle, fold, setDialog, click, btn } = props

  const model = useSelector(selectModel);
  const image = useSelector(selectImage);
  const labels = useSelector(selectLabels);
  const shapes = useSelector(selectShapes);

  // GroupButton (TEST and DEPLOY) properties
  const buttonOpts = ["TEST", "DEPLOY"];
  const anchorRef = useRef(null);

  return (
    <div className="buttonGroupContainer">
      <ButtonGroup
        disabled={!(model && image.path && labels.length > 0 && shapes.length > 0)}
        variant="contained" ref={anchorRef} aria-label="split button">
        <Button
          onClick={() => { btn["opt"] === 0 ? click() : setDialog(true); }} size="small" disableElevation>
          {buttonOpts[btn["opt"]]}
        </Button>
        <Button
          size="small" aria-label="select merge strategy" aria-haspopup="menu" disableElevation
          aria-controls={btn["collapsed"] ? "split-button-menu" : undefined}
          aria-expanded={btn["collapsed"] ? "true" : undefined}
          onClick={toggle}>
          <ArrowDropDown />
        </Button>
      </ButtonGroup>
      <Popper
        open={btn["collapsed"]} sx={{ zIndex: 1 }} anchorEl={anchorRef.current}
        role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps} style={{ transformOrigin: placement === "bottom" ? "center top" : "center bottom" }}>
            <Paper>
              <ClickAwayListener onClickAway={event => {
                if (anchorRef.current && anchorRef.current.contains(event.target)) return;
                fold(); }}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {buttonOpts.map((buttonOpt, id) => (
                    <MenuItem
                      sx={{ fontSize: ".8em" }} key={buttonOpt} selected={id === btn["opt"]}
                      onClick={event => {menuItemClick(event, id)}}>
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
  );
}

export default TestDeployGroup;