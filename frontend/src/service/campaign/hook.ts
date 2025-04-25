import { useMemo } from "react";
import { UserAPI } from "@/service/user";
import { AnnotationCampaign } from "./type.ts";

export const useHasAdminAccessToCampaign = (campaign?: AnnotationCampaign) => {
  const { data: currentUser } = UserAPI.useGetCurrentUserQuery();

  return useMemo(() => {
    if (!currentUser) return false;
    return currentUser?.is_staff || currentUser?.is_superuser || campaign?.owner?.id === currentUser?.id
  }, [ currentUser, campaign?.owner ]);
}