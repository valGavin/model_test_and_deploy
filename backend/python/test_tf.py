import os
import sys
import cv2
import numpy as np
import tensorflow as tf
from zipfile import ZipFile

subDir = None
shapes = None


def get_session(mdl: str) -> tuple:
  """
  Prepare the session and detection graph from the given .PB file.

  :param mdl: The frozen inference graph
  :return: The input/output tensors and the TF Session
  """
  # Prepare the tensors
  det_graph = tf.Graph()
  with det_graph.as_default():
    graph_def = tf.compat.v1.GraphDef()
    with tf.compat.v1.gfile.GFile(mdl, "rb") as gf:
      graph_def.ParseFromString(gf.read())
      tf.import_graph_def(graph_def, name="")

  # Get the tensors
  img_tensor = det_graph.get_tensor_by_name("image_tensor:0")
  scores = det_graph.get_tensor_by_name("detection_scores:0") if "Box" in shapes else None
  boxes = det_graph.get_tensor_by_name("detection_boxes:0") if "Box" in shapes else None
  # TODO: Create options for other shapes as well

  return [img_tensor, scores, boxes], tf.compat.v1.Session(graph=det_graph)


def get_function(model_zip: str):
  """
  Extract the given .ZIP file and get the detection function from the saved_model.

  :param model_zip: A .ZIP file comprises the saved_model
  :return: A detection function
  """
  # Extract the .ZIP file
  with ZipFile(model_zip) as zipObject:
    zipObject.extractall(subDir)

  return tf.saved_model.load(os.path.join(subDir, "saved_model"))


def run_detection(img: str, mdl: str) -> list:
  """
  Run an object detection on the given image using the given model.

  :param img: The path of an image on which the detection will be performed
  :param mdl: The path of a .PB file or .ZIP file containing the saved_model
  :return: A list comprises the dictionaries of the detection results
  """
  # Detection results placeholders
  scores, boxes = [], []
  # TODO: Prepare placeholders for the other annotation shapes

  # Prepare the frame for detection
  frame = np.expand_dims(np.asarray(cv2.cvtColor(cv2.imread(img), cv2.COLOR_BGR2RGB)), axis=0)

  # Prepare the TF session (TF1) or model (TF2) and run the detection
  mdl_ext = mdl.split(".")[-1]
  if mdl_ext == "pb":
    tensors, sess = get_session(mdl)
    # TODO: Fetch the detection results for the other annotation shapes (PB)
    (scores, boxes) = sess.run([tensors[1], tensors[2]], feed_dict={tensors[0]: frame}) if "Box" in shapes else ([], [])
    scores, boxes = np.squeeze(scores), np.squeeze(boxes)
  elif mdl_ext == "zip":
    img_tensor = tf.convert_to_tensor(frame)
    det_fn = get_function(mdl)
    det_res = det_fn(img_tensor)
    n_dets = int(det_res.pop("num_detections"))
    det_res = {key: value[0, :n_dets].numpy() for key, value in det_res.items()}
    scores, boxes = det_res["detection_scores"], det_res["detection_boxes"]
    # TODO: Fetch the detection results for the other annotation shapes (saved_model)

  results = []
  if "Box" in shapes:
    for score, box in zip(scores, boxes):
      box = tuple(box.tolist())
      y0, x0, y1, x1 = box
      results.append({
        "score": round(float(score), 2),
        "shape": "Box",
        "points": np.around([x0, y0, x1, y1], decimals=2).tolist()})
  elif "Points" in shapes:
    pass  # TODO: Prepare the iteration for points annotation
  elif "Polyline" in shapes:
    pass  # TODO: Prepare the iteration for polyline annotation
  elif "Polygon" in shapes:
    pass  # TODO: Prepare the iteration for polygon annotation
  elif "Cuboid" in shapes:
    pass  # TODO: Prepare the iteration for cuboid annotation
  elif "Ellipse" in shapes:
    pass  # TODO: Prepare the iteration for ellipse annotation

  return results


if __name__ == '__main__':
  subDir = os.path.join(os.getcwd(), "backend", "tmp", sys.argv[1])
  imgPath = os.path.join(subDir, sys.argv[2])
  modelPath = os.path.join(subDir, sys.argv[3])
  shapes = sys.argv[4]

  data = run_detection(imgPath, modelPath)
  print(data)
