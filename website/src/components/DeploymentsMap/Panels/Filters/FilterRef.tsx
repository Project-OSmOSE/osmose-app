import { DeploymentNode } from "../../../../../../../metadatax-ts/src";

export interface FilterRef {
  /**
   * Check if the deployment can be visible or not, depending on the filter configuration
   * @param deployment {DeploymentNode} the deployment to check
   */
  filterDeployment: (deployment: DeploymentNode) => boolean;

  /**
   * Reset filter to default values
   */
  reset: () => void;

  /**
   * Filtering state
   */
  isFiltering: boolean;
}