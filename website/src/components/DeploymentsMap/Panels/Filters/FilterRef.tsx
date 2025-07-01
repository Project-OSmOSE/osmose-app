import { Deployment } from "../../../../pages/Projects/ProjectDetail/ProjectDetail";

export interface FilterRef {
  /**
   * Check if the deployment can be visible or not, depending on the filter configuration
   * @param deployment {Deployment} the deployment to check
   */
  filterDeployment: (deployment: Deployment) => boolean;

  /**
   * Reset filter to default values
   */
  reset: () => void;

  /**
   * Filtering state
   */
  isFiltering: boolean;
}