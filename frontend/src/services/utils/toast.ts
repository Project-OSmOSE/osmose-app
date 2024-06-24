import { useIonToast } from "@ionic/react";
import { closeCircle } from "ionicons/icons";
import { buildErrorMessage } from "@/services/utils/format.tsx";
import { ToastButton } from "@ionic/core/dist/types/components/toast/toast-interface";

export const useToast = () => {
  const [present, dismiss] = useIonToast();

  function presentError(e: any, canForce: boolean = false): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const buttons: Array<ToastButton> = [];
      if (canForce) {
        buttons.push({
          text: 'Create anyway',
          handler: () => resolve(true)
        })
      }
      buttons.push({
        icon: closeCircle, handler: () => {
          resolve(false)
          dismiss();
        }
      });
      present({
        message: buildErrorMessage(e),
        color: 'danger',
        buttons,
      }).catch(console.warn);
    });
  }

  return {
    presentError,
    dismiss: () => {
      dismiss().catch(console.warn)
    }
  }
}
