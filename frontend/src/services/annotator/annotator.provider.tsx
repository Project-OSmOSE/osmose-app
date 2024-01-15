import { FC, ReactNode } from "react";
import { ProvideAudio } from "./audio";
import { ProvideTask } from "./task/task.reducer.tsx";
import { ProvideAnnotation } from "./annotation/annotation.reducer.tsx";
import { ProvideAnnotationTag } from "./annotation-tag/annotation-tag.reducer.tsx";

export const ProvideAnnotator: FC<{ children: ReactNode }> = ({ children }) => (
  <ProvideAudio>
    <ProvideTask>
        <ProvideAnnotation>
          <ProvideAnnotationTag>
            { children }
          </ProvideAnnotationTag>
        </ProvideAnnotation>
    </ProvideTask>
  </ProvideAudio>
)