import { configureStore } from "@reduxjs/toolkit";

import { useDispatch, useSelector } from "react-redux";
import { AnnotatorAPI, AnnotatorSlice } from '@/service/annotator';
import { EventSlice } from "@/service/events";
import { UISlice } from "@/service/ui";
import { ResultImportSlice } from "@/service/campaign/result/import/slice.ts";
import { API } from "@/service/api";
import { getUserOnLoginMiddleware } from "@/service/api/user.ts";
import { logoutOn401Listener } from "@/service/api/auth.ts";
import { AuthSlice } from "@/service/slices/auth.ts";

export const AppStore = configureStore({
  reducer: {
    [UISlice.reducerPath]: UISlice.reducer,
    [EventSlice.reducerPath]: EventSlice.reducer,
    [AnnotatorSlice.reducerPath]: AnnotatorSlice.reducer,
    [ResultImportSlice.reducerPath]: ResultImportSlice.reducer,

    [API.reducerPath]: API.reducer,
    auth: AuthSlice.reducer,

    [AnnotatorAPI.reducerPath]: AnnotatorAPI.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(API.middleware)
      .concat(getUserOnLoginMiddleware.middleware)
      .concat(logoutOn401Listener.middleware)

      .concat(AnnotatorAPI.middleware)
})

export type AppState = ReturnType<typeof AppStore.getState>;

export type AppDispatch = typeof AppStore.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<AppState>()
