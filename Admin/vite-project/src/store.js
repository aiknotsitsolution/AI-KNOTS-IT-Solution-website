import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Pages/auth/authSlice";
import techReducer from "./Pages/technology/techslice/techslice.js";
import technologyReducer from "./Pages/TechNews/techSlice/techSlice.js";
import productReducer from "./Pages/Home/productSlice/productSlice.js";
import portfolioReducer from "./Pages/Portfolio/portfolioslice.js";
import jobReducer from "./Pages/createjob/jobSlice.js";
import { jobApplicationsApi } from "./Pages/createjob/jobApplicationsApi.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tech: techReducer,
    technology: technologyReducer,
    product: productReducer,
    portfolio: portfolioReducer,
    job: jobReducer,
    [jobApplicationsApi.reducerPath]: jobApplicationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(jobApplicationsApi.middleware),
});
