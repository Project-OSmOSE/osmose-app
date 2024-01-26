import { Reducer } from "react";
import { AnnotatorCtx, AnnotatorCtxAction } from "./annotator.context.tsx";

type Item = string | { id?: number | string };

function isSame(a: Item, b: Item) {
  const compareA = typeof a === 'string' ? a : a.id;
  const compareB = typeof b === 'string' ? b : b.id;
  return compareA === compareB;
}

export const annotatorReducer: Reducer<AnnotatorCtx, AnnotatorCtxAction> = (currentContext: AnnotatorCtx, actions: AnnotatorCtxAction): AnnotatorCtx => {
  let context = { ...currentContext };
  for (const action of actions) {
    let scope: any | undefined;
    switch (action.type) {
      case 'setTask':
        context = { ...context, task: action.task }
        break;
      case 'setTaskComment':
        context = { ...context, comments: { ...context.comments, taskComment: action.comment } }
        break;
      case 'setTagColors':
        context = { ...context, tagColors: action.map }
        break;
      case 'updateList':
        context = {
          ...context, [action.scope]: {
            array: action.array,
            focus: undefined
          }
        }
        break;
      case 'add':
        if (action.scope === 'comments') break;
        scope = context[action.scope];
        context = {
          ...context, [action.scope]: {
            array: [...(scope.array ?? []), action.item],
            focus: action.item
          }
        }
        break;
      case 'remove':
        if (action.scope === 'comments') break;
        scope = context[action.scope];
        context = {
          ...context, [action.scope]: {
            array: scope.array.filter((i: any) => !isSame(i, action.item)),
            focus: isSame(scope.focus.id, action.item) ? undefined : focus
          }
        }
        break;
      case 'update':
        if (action.scope === 'comments') break;
        scope = context[action.scope];
        context = {
          ...context, [action.scope]: {
            array: scope.array.map((i: any) => !isSame(i, action.item) ? i : action.item),
            focus: isSame(scope.focus.id, action.item) ? action.item : focus
          }
        }
        break;
      case 'changeItemID':
        scope = context[action.scope];
        context = {
          ...context, [action.scope]: {
            array: scope.array.map((a: { id: any }) => {
              if (a.id === action.newID) return { ...a, id: action.newID + 1000 };
              if (a.id === action.currentID) return { ...a, id: action.newID }
              return a
            }),
            focus: scope.focus.id === action.newID ?
              { ...scope.focus, id: action.newID + 1000 } :
              (scope.focus.id === action.currentID ?
                { ...scope.focus, id: action.newID } :
                scope.focus)
          }
        }
        break;
      case 'focus':
        scope = context[action.scope];
        context = { ...context, [action.scope]: { ...scope, focus: action.item } }
        break;
      case 'blur':
        scope = context[action.scope];
        context = { ...context, [action.scope]: { ...scope, focus: undefined } }
        break;
      case 'setLoading':
        context = { ...context, isLoading: action.state }
        break;
      case 'setStart':
        context = { ...context, start: action.start?.getTime() }
        break;
      case 'setError':
        context = { ...context, error: action.error }
        break;
      case 'setToast':
        context = { ...context, toast: action.toast }
        break;
      case 'enableShortcut':
        context = { ...context, areShortcutsEnabled: action.state }
        break;
    }
  }
  return context;
}