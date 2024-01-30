import { FC, ReactNode, useReducer } from "react";
import { AnnotatorCtxInit, AnnotatorContext, AnnotatorDispatchContext } from "./annotator.context.tsx";
import { annotatorReducer } from "./annotator.reducer.tsx";
import { ProvideAudio } from "./audio/audio.reducer.tsx";
import { ProvideSpectro } from "./spectro/spectro.reducer.tsx";

export const ProvideAnnotator: FC<{ children: ReactNode }> = ({ children }) => {
  const [context, dispatch] = useReducer(annotatorReducer, AnnotatorCtxInit);
  return (
    <ProvideAudio>
      <ProvideSpectro>
        <AnnotatorContext.Provider value={ context }>
          <AnnotatorDispatchContext.Provider value={ dispatch }>
            { children }
          </AnnotatorDispatchContext.Provider>
        </AnnotatorContext.Provider>
      </ProvideSpectro>
    </ProvideAudio>
  )
}