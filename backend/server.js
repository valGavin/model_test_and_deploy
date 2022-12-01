const express = require("express");
const multer = require("multer");
const helmet = require("helmet");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(helmet());

let subDir;

/**
 * Multer instance; setting up the destination directory.
 *
 * @type {DiskStorage}
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, subDir); },
  filename: function (req, file, cb) { cb(null, file.originalname); }
});

// Upload instance to allow receiving multiple files.
const upload = multer({ storage: storage }).array("file");

// POST route to upload a file
app.post("/upload", function (req, res) {
  // Create a new subdirectory to store the incoming file(s)
  const dateOB = new Date();
  subDir = "./backend/tmp/" + dateOB.getFullYear() +
    ("0" + (dateOB.getMonth() + 1)).slice(-2) +
    ("0" + dateOB.getDate()).slice(-2) + "_" +
    dateOB.getHours().toString().padStart(2, "0") +
    dateOB.getMinutes().toString().padStart(2, "0") +
    dateOB.getSeconds().toString().padStart(2, "0");
  if (!fs.existsSync(subDir))
    fs.mkdirSync(subDir);

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError)
      return res.status(500).json(err);
    else if (err)
      return res.status(500).json(err);

    return res.status(200).send(subDir);
  });
});

/**
 * Promise-based function to test the machine-learning model.
 *
 * @param data The argument to pass to the script
 * @returns {Promise<unknown>}
 */
const pythonPromise = (data) => {
  return new Promise(resolve => {
    const python = spawn("./backend/python/tester/python.exe", ["./backend/python/test_tf.py", ...data]);
    python.stdout.on("data", data => { resolve(data.toString()); });
    python.stderr.on("data", data => { console.log(data.toString()); });
  });
}

// GET route to test the machine-learning model and return the detection result
app.get("/test/:config", async (req, res) => {
  const cfg = eval("(" + atob(req.params["config"]) + ")");
  const detResults = await pythonPromise([cfg["dir"], cfg["img"], cfg["mdl"], cfg["shp"]]);
  res.send(detResults);
});

// GET route to deploy the machine-learning model and create the nuclio function
app.get("/deploy/:config", async (req, res) => {
  const cfg = eval("(" + atob(req.params["config"]) + ")");
  // TODO: Add a nuclio microservice deploy command
})

// Listen to port 3600
app.listen(3600, function () {
  console.log("Server is running on port 3600");
});