import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";
import { CollectionsRounded } from "@mui/icons-material";
import { selectImage, imageUpload, selectThreshold, selectAnnotations, setImgSize } from "../inferenceSlice";
import ImagesDialog from "./ImagesDialog";
import BBox from "./BBox";

ImagesDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedImage: PropTypes.string.isRequired
};

function Image(props) {
  const [dialog, setDialog] = useState(false);
  const dispatch = useDispatch();
  const image = useSelector(selectImage);
  const threshold = useSelector(selectThreshold);
  const annotations = useSelector(selectAnnotations);

  let objectArray = [];  // Annotation components placeholder to render
  let objectDict = {};  // Annotation dictionary comprises the score, shape, and points
  const [objects, setObjects] = useState([]);

  const ref = useRef(null);
  const size = useWindowSize();

  /**
   * Close the ImageDialog and set the selected image's information at the global state.
   *
   * @param img The chosen image file
   */
  const handleClose = (img) => {
    setDialog(false);
    props.formData.append("file", img);
    const imgNameArray = img.name.split("/");
    dispatch(imageUpload({
      name: imgNameArray[imgNameArray.length - 1],
      path: URL.createObjectURL(img) }));
  }

  useEffect(() => {
    dispatch(setImgSize({ width: ref.current.clientWidth, height: ref.current.clientHeight }));
  }, [size]);

  useEffect(() => {
    annotations.forEach(({ score, shape, points }) => {
      shape in objectDict ?
        objectDict[shape].push({ "score": score, "points": points }) :
        objectDict[shape] = [{ "score": score, "points": points }];
    });
    Object.keys(objectDict).forEach(shape => {
      for (let i = 0; i < objectDict[shape].length; i++) {
        if (objectDict[shape][i].score >= threshold && shape === "Box") {
          objectArray.push(
            <BBox key={shape + "_" + i} ltrb={objectDict[shape][i].points} />
          );
        }  // TODO: Prepare conditions for other shapes
      }
    });

    setObjects(objectArray);
  }, [threshold, annotations]);

  return (
    <div className="imageContainer">
      {image.path ?
        <img className="image" src={image.path} alt={image.name} ref={ref} /> :
        <div ref={ref}>
          <IconButton
            aria-label="Select Image" className="imageButton"
            sx={{ borderRadius: 10 }} onClick={() => setDialog(true)}>
            <CollectionsRounded color="action" sx={{ height: "40vh", width: "40vw", opacity: "30%" }} />
          </IconButton>
          <ImagesDialog selectedImage={image.path} open={dialog} onClose={handleClose} />
        </div>}
      {objects}
      {/* TODO: Create an array as the annotations (bounding box) placeholder. */}
    </div>
  );
}

function useWindowSize() {
  const [size, setSize] = useState({ width: undefined, height: undefined });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

export default Image;