import { useIonToast } from "@ionic/react";
import { closeCircle } from "ionicons/icons";
import { buildErrorMessage } from "@/services/utils/format.tsx";

export const useToast = () => {
  const [present, dismiss] = useIonToast();

  function presentError(e: any) {
    present({
      message: buildErrorMessage(e),
      color: 'danger',
      buttons: [
        {
          icon: closeCircle,
          handler: () => dismiss()
        }
      ],
    }).catch(console.warn);
  }

  return {
    presentError,
    dismiss: () => {
      dismiss().catch(console.warn)
    }
  }
}
