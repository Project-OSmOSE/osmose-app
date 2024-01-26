import { FC, ReactNode, useReducer } from "react";
import { AnnotatorCtxInit, AnnotatorContext, AnnotatorDispatchContext } from "./annotator.context.tsx";
import { annotatorReducer } from "./annotator.reducer.tsx";
import { ProvideAudio } from "./audio";

export const ProvideAnnotator: FC<{ children: ReactNode }> = ({ children }) => {
  const [context, dispatch] = useReducer(annotatorReducer, AnnotatorCtxInit);
  return (
    <AnnotatorContext.Provider value={ context }>
      <AnnotatorDispatchContext.Provider value={ dispatch }>
        <ProvideAudio>
          { children }
        </ProvideAudio>
      </AnnotatorDispatchContext.Provider>
    </AnnotatorContext.Provider>
  )
}