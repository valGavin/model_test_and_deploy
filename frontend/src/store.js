import { configureStore } from "@reduxjs/toolkit";
import inferenceReducer from "./inferenceSlice";

export const store = configureStore({
  reducer: { inference: inferenceReducer }
});