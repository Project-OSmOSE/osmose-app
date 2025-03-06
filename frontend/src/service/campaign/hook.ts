import { AnnotationCampaign } from "@/service/campaign/type.ts";
import { UserAPI } from "@/service/user";
import { useMemo } from "react";

export const useHasAdminAccessToCampaign = (campaign?: AnnotationCampaign) => {
  const { data: currentUser } = UserAPI.useGetCurrentUserQuery();

  const hasAdminAccess = useMemo(() => {
    if (!currentUser) return false;
    return currentUser?.is_staff || currentUser?.is_superuser || campaign?.owner === currentUser?.username
  }, [ currentUser, campaign?.owner ]);

  return { hasAdminAccess }
}