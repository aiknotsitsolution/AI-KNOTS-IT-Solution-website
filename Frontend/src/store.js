import { configureStore } from "@reduxjs/toolkit";
import technologyReducer from "./Technology/technologyslice/technologySlice.js";
import techNewsReducer from "./Technology/techNewsSlice/techNewsSlice.js";
import contactReducer from "./Component/Redux/contact/contactSlice.js";
import queryReducer from "./Component/Redux/query/querySlice.js";
import blogReducer from "./Component/Redux/Blog/blogSlice.js";
import portfolioReducer from "./Component/Portfolio/portfolioslice.js";
import cartReducer from "./Component/Redux/cart/cartSlice.js";
import { publicApi } from "./Component/Redux/publicApi.js";

export const store = configureStore({
  reducer: {
    technology: technologyReducer,
    techNews: techNewsReducer,
    contact: contactReducer,
    query: queryReducer,
    blog: blogReducer,
    portfolio: portfolioReducer,
    cart: cartReducer,
    [publicApi.reducerPath]: publicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(publicApi.middleware),
});

export default store;
