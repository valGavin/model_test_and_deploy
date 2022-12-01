import { useSelector } from "react-redux";
import { selectImgSize } from "../inferenceSlice";

function BBox(props) {
  const imgSize = useSelector(selectImgSize);
  const bbox = {
    x: imgSize.width * props.ltrb[0],
    y: imgSize.height * props.ltrb[1],
    width: imgSize.width * props.ltrb[2] - imgSize.width * props.ltrb[0],
    height: imgSize.height * props.ltrb[3]- imgSize.height * props.ltrb[1] };

  return (
    <div id="bbox" className="bboxContainer" style={{ width: imgSize.width }}>
      <svg style={{ width: imgSize.width, height: imgSize.height }}>
        <rect className="bbox" style={bbox} />
      </svg>
    </div>
  );
}

export default BBox;