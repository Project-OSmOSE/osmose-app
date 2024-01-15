import { Context, createContext, Dispatch, FC, ReactNode, Reducer, useContext, useReducer } from "react";
import { ToastMessage } from "../../view/global-components";

interface Task {
  instructions_url?: string;
  campaignId: string;
  audioUrl: string;
  duration: number;
  prevAndNextAnnotation: {
    prev: string;
    next: string;
  }
  // TODO
}

interface Task {
  endTime: number;
  startTime: number;
}

interface TaskCtx {
  currentTask?: Task;
  playedAnnotation?: Task;
  toast?: ToastMessage;
}

type TaskCtxActionType = 'update' | 'toast';

interface TaskCtxAction {
  type: TaskCtxActionType;
  newTask?: Task;
  newToastMessage?: ToastMessage;
}

const TaskContext: Context<TaskCtx> = createContext<TaskCtx>({});
const TaskDispatchContext: Context<Dispatch<TaskCtxAction> | undefined> = createContext<Dispatch<TaskCtxAction> | undefined>(undefined);

const taskReducer: Reducer<TaskCtx, TaskCtxAction> = (currentContext: TaskCtx, action: TaskCtxAction): TaskCtx => {
  switch (action.type) {
    case 'update':
      return {
        ...currentContext,
        currentTask: action.newTask
      }
    case 'toast':
      return {
        ...currentContext,
        toast: action.newToastMessage
      }
    default:
      return currentContext;
  }
}

export const ProvideTask: FC<{ children?: ReactNode }> = ({ children }) => {
  const [task, dispatch] = useReducer(taskReducer, {});

  return (
    <TaskContext.Provider value={ task }>
      <TaskDispatchContext.Provider value={ dispatch }>
        { children }
      </TaskDispatchContext.Provider>
    </TaskContext.Provider>
  )
}

export const useTask = () => useContext(TaskContext);
export const useTaskDispatch = () => useContext(TaskDispatchContext);
