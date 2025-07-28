import React, { useCallback } from "react";
import { Button } from "@/components/ui";
import { IonIcon } from "@ionic/react";
import { helpOutline } from "ionicons/icons";

export const DatasetImportHelpButton: React.FC = () => {

  const open = useCallback(() => window.open('/doc/user/campaign-creator/generate-dataset', '_blank'), [])
  return <Button fill='clear' color='warning' onClick={ open }>
    Help
    <IonIcon icon={ helpOutline } slot='end'/>
  </Button>
}