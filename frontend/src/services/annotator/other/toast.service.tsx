import { useAnnotatorDispatch } from "../annotator.context.tsx";

export interface ToastService {
  setDanger: (message: string) => void;
  setSuccess: (message: string) => void;
  setPrimary: (message: string) => void;
  remove: () => void;
}

export const useToasts = () => {
  const dispatch = useAnnotatorDispatch();

  const setDanger = (message: string) => {
    dispatch!([{
      type: 'setToast',
      toast: { level: 'danger', messages: [message] }
    }]);
  }
  const setSuccess = (message: string) => {
    dispatch!([{
      type: 'setToast',
      toast: { level: 'success', messages: [message] }
    }]);
  }
  const setPrimary = (message: string) => {
    dispatch!([{
      type: 'setToast',
      toast: { level: 'primary', messages: [message] }
    }]);
  }
  const remove = () => {
    dispatch!([{ type: 'setToast', toast: undefined }]);
  }

  return { setDanger, setSuccess, setPrimary, remove };
}