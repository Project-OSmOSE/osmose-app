import { useAnnotatorDispatch } from "../annotator.context.tsx";


export const useShortcuts = () => {
  const dispatch = useAnnotatorDispatch();

  return {
    enable: () => dispatch!([{ type: 'enableShortcut', state: true }]),
    disable: () => dispatch!([{ type: 'enableShortcut', state: false }]),
  }
}