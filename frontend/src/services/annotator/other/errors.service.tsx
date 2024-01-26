import { buildErrorMessage } from "../format/format.util.tsx";
import { useAnnotatorDispatch } from "../annotator.context.tsx";

export interface ErrorService {
  set: (error: any) => void;
}

export const useErrors = () => {
  const dispatch = useAnnotatorDispatch();

  const set = (error: any) => {
    dispatch!([
      { type: 'setError', error: buildErrorMessage(error) },
      { type: 'setLoading', state: false }
    ]);
  }

  return { set };
}