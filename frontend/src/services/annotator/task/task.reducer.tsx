import { FC, ReactNode, Reducer, useReducer } from "react";
import { TaskCtx, TaskCtxAction, TaskContext, TaskDispatchContext } from "./task.context.tsx";
import { COLORS } from "../../../consts/colors.const.tsx";


const taskReducer: Reducer<TaskCtx, TaskCtxAction> = (currentContext: TaskCtx, action: TaskCtxAction): TaskCtx => {
  switch (action.type) {
    case 'update':
      return {
        currentTask: action.newTask,
        toast: undefined,
        isLoading: false,
        start: new Date(),
        tagColors: new Map(action.newTask?.annotationTags.map((t, i) => [t, COLORS[i % COLORS.length]]))
      }
    case 'toast':
      return {
        ...currentContext,
        toast: action.toast
      }
    case 'endLoading':
      return {
        ...currentContext,
        isLoading: false
      }
    default:
      return currentContext;
  }
}

export const ProvideTask: FC<{ children?: ReactNode }> = ({ children }) => {
  const [task, dispatch] = useReducer(taskReducer, {isLoading: true, tagColors: new Map<string, string>()});

  return (
    <TaskContext.Provider value={ task }>
      <TaskDispatchContext.Provider value={ dispatch }>
        { children }
      </TaskDispatchContext.Provider>
    </TaskContext.Provider>
  )
}