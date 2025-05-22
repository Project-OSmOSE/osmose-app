import { configureStore } from "@reduxjs/toolkit";

import { useDispatch, useSelector } from "react-redux";
import { EventSlice } from "@/service/events";
import { API } from "@/service/api";
import { getUserOnLoginMiddleware } from "@/service/api/user.ts";
import { logoutOn401Listener } from "@/service/api/auth.ts";
import { AuthSlice } from "@/service/slices/auth.ts";
import { FilterSlice } from "@/service/slices/filter.ts";
import { AnnotatorSlice } from "@/service/slices/annotator.ts";
import { ImportAnnotationsSlice } from "@/service/slices/import-annotations.ts";

export const AppStore = configureStore({
  reducer: {
    [EventSlice.reducerPath]: EventSlice.reducer,
    [AnnotatorSlice.reducerPath]: AnnotatorSlice.reducer,
    [ImportAnnotationsSlice.reducerPath]: ImportAnnotationsSlice.reducer,

    [API.reducerPath]: API.reducer,
    auth: AuthSlice.reducer,
    filter: FilterSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(API.middleware)
      .concat(getUserOnLoginMiddleware.middleware)
      .concat(logoutOn401Listener.middleware)
})

export type AppState = ReturnType<typeof AppStore.getState>;

export type AppDispatch = typeof AppStore.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<AppState>()
