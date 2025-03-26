import { AlertOptions, useIonAlert } from "@ionic/react";
import { useAppDispatch } from "@/service/app.ts";
import { EventSlice } from "@/service/events";
import { HookOverlayOptions } from "@ionic/react/dist/types/hooks/HookOverlayOptions";

export const useAlert = () => {
  const [_present, _dismiss] = useIonAlert();
  const dispatch = useAppDispatch();

  async function present(options: AlertOptions & HookOverlayOptions): Promise<void> {
    dispatch(EventSlice.actions.disableShortcuts())
    await _present(options)
    dispatch(EventSlice.actions.enableShortcuts())
  }

  function dismiss(): void {
    _dismiss().catch(console.warn)
    dispatch(EventSlice.actions.enableShortcuts())
  }

  return { present, dismiss }
}