import Model from "./components/Model";
import Labels from "./components/Labels";
import Image from "./components/Image";
import Control from "./components/Control";
import Shapes from "./components/Shapes";

function App() {
  const formData = new FormData();

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="headContainer">
        <Model formData={formData} />
        <Shapes />
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Labels />
        <div className="viewerContainer">
          <Image formData={formData} />
          <Control formData={formData} />
        </div>
      </div>
    </div>
  );
}

export default App;
