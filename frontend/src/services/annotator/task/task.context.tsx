import { Context, createContext, Dispatch, useContext } from "react";
import { ToastMessage } from "../../../view/global-components";
import { AnnotationTask } from "../../../interface";


export interface TaskCtx {
  currentTask?: AnnotationTask;
  toast?: ToastMessage;
  isLoading: boolean;
  start?: Date;
  tagColors: Map<string, string>;
}
type TaskCtxActionType = 'update' | 'toast' | 'endLoading';

export interface TaskCtxAction {
  type: TaskCtxActionType;
  newTask?: AnnotationTask;
  toast?: ToastMessage;
}

export const TaskContext: Context<TaskCtx> = createContext<TaskCtx>({isLoading: true, tagColors: new Map<string, string>()});
export const TaskDispatchContext: Context<Dispatch<TaskCtxAction> | undefined> = createContext<Dispatch<TaskCtxAction> | undefined>(undefined);

export const useTaskContext = () => useContext(TaskContext);
export const useTaskDispatch = () => useContext(TaskDispatchContext);