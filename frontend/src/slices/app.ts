import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { createCampaignReducer } from "@/slices/create-campaign";
import authReducer from "@/slices/auth";
import globalAnnotatorReducer from "@/slices/annotator/global-annotator";
import annotationsReducer from "@/slices/annotator/annotations";
import audioReducer from "@/slices/annotator/audio";
import spectroReducer from "@/slices/annotator/spectro";
import { useDispatch, useSelector } from "react-redux";
import { importAnnotationsReducer } from "@/slices/create-campaign/import-annotations.ts";

export const AppStore = configureStore({
  reducer: {
    createCampaignForm: combineReducers({
      global: createCampaignReducer,
      importAnnotations: importAnnotationsReducer
    }),
    auth: authReducer,
    annotator: combineReducers({
      global: globalAnnotatorReducer,
      annotations: annotationsReducer,
      audio: audioReducer,
      spectro: spectroReducer
    })
  }
})

export type AppState = ReturnType<typeof AppStore.getState>;

export type AppDispatch = typeof AppStore.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<AppState>()
