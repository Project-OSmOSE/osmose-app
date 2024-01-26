import {
  AnnotationTaskAPIService,
  UpdateResult,
} from "../../api/annotation-task-api.service.tsx";
import { buildErrorMessage } from "../format/format.util.tsx";
import { ErrorService } from "./errors.service.tsx";
import { ToastService } from "./toast.service.tsx";
import { AnnotationsService } from "./annotations.service.tsx";
import { useAnnotatorContext } from "../annotator.context.tsx";

export interface TasksService {
  save: () => Promise<void | UpdateResult>;
}

export const useTasks = (toasts: ToastService,
                         errors: ErrorService,
                         annotations: AnnotationsService,
                         taskAPI: AnnotationTaskAPIService): TasksService => {
  const context = useAnnotatorContext();

  const save = async (): Promise<void | UpdateResult> => {
    try {
      annotations.check(context.annotations.array);
    } catch (e) {
      return toasts.setDanger(buildErrorMessage(e));
    }

    try {
      const now = new Date().getTime();
      return await taskAPI.update(context.task!.id, {
        annotations: context.annotations.array.sort((a, b) => a.startTime - b.startTime).map(annotations.prepare),
        task_start_time: Math.floor((context.start ?? now) / 1000),
        task_end_time: Math.floor(new Date().getTime() / 1000)
      })
    } catch (e) {
      errors.set(e);
    }
  }

  return { save }
}