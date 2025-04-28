import { useRetrieveAnnotatorQuery } from "@/service/annotator/api.ts";
import { useAppSelector } from "@/service/app.ts";
import { useEffect, useRef } from "react";
import { useAlert } from "@/service/ui";

export const useAnnotatorFile = () => {
  const { data } = useRetrieveAnnotatorQuery();
  return data?.file
}

export const useCanNavigate = () => {
  const {
    hasChanged: _hasChanged,
  } = useAppSelector(state => state.annotator);
  const hasChanged = useRef<boolean>(_hasChanged);
  useEffect(() => {
    hasChanged.current = _hasChanged
  }, [ _hasChanged ]);
  const alert = useAlert();

  async function canNavigate(): Promise<boolean> {
    if (!hasChanged.current) return true;
    return new Promise<boolean>((resolve) => {
      alert.showAlert({
        type: 'Warning',
        message: `You have unsaved changes. Are you sure you want to forget all of them?`,
        actions: [ {
          label: 'Forget my changes',
          callback: () => resolve(true)
        } ],
        onCancel: () => resolve(false)
      })
    })
  }

  return canNavigate;
}
