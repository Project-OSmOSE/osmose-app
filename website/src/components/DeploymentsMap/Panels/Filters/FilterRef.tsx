import { DeploymentAPI } from "@pam-standardization/metadatax-ts";

export interface FilterRef {
  /**
   * Check if the deployment can be visible or not, depending on the filter configuration
   * @param deployment {DeploymentAPI} the deployment to check
   */
  filterDeployment: (deployment: DeploymentAPI) => boolean;

  /**
   * Reset filter to default values
   */
  reset: () => void;

  /**
   * Filtering state
   */
  isFiltering: boolean;
}