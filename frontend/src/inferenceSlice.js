import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  model: null,
  image: { name: "", path: "" },
  labels: [],
  shapes: ["Box"],
  annotations: [],
  threshold: .4,
  imgSize: { width: 0, height: 0 }};

export const inferenceSlice = createSlice({
  name: 'inference',
  initialState,
  reducers: {
    modelUpload: (state, action) => {
      state.model = action.payload;
    },
    imageUpload: (state, action) => {
      state.image = action.payload;
    },
    setLabels: (state, action) => {
      state.labels = action.payload;
    },
    setShapes: (state, action) => {
      state.shapes = action.payload;
    },
    setAnnotations: (state, action) => {
      state.annotations = action.payload;
    },
    setThreshold: (state, action) => {
      state.threshold = action.payload;
    },
    setImgSize : (state, action) => {
      state.imgSize = action.payload;
    }
  }
});

export const {
  modelUpload, imageUpload, setLabels, setShapes,
  setAnnotations, setThreshold, setImgSize } = inferenceSlice.actions;

export const selectModel = state => state.inference.model;
export const selectImage = state => state.inference.image;
export const selectLabels = state => state.inference.labels;
export const selectShapes = state => state.inference.shapes;
export const selectAnnotations = state => state.inference.annotations;
export const selectThreshold = state => state.inference.threshold;
export const selectImgSize = state => state.inference.imgSize;

export default inferenceSlice.reducer;
