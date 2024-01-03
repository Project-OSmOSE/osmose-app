import { SuperAgentRequest, get, post } from "superagent";
import { Dataset } from "./ApiService.data.tsx";
import { AuthService } from "./AuthService.tsx";
import { v4 as uuidV4 } from "uuid";

export class DatasetApiService {
  public static shared: DatasetApiService = new DatasetApiService();
  private URI = '/api/dataset';

  private getDatasetsRequest: SuperAgentRequest = get(this.URI);
  private getNotImportedDatasetsRequest: SuperAgentRequest = get(`${ this.URI }/list_to_import`);
  private postImportDatasetRequest: SuperAgentRequest = post(`${ this.URI }/datawork_import`);

  public async getDatasets(): Promise<Array<Dataset>> { // TODO: check type
    try {
      const response = await this.getDatasetsRequest.set("Authorization", AuthService.shared.bearer);
      return response.body;
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  }

  public abortGetDatasets(): void {
    this.getDatasetsRequest.abort();
  }

  public async getNotImportedDatasets(): Promise<Array<Dataset>> { // TODO: check type
    try {
      const response = await this.getNotImportedDatasetsRequest
        .set("Authorization", AuthService.shared.bearer);
      return JSON.parse(response.text).map((data: Dataset) => ({
        ...data,
        id: uuidV4()
      }));
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  }

  public abortGetNotImportedGetDatasets(): void {
    this.getNotImportedDatasetsRequest.abort();
  }

  public async postImportDatasets(datasets: Array<Dataset>): Promise<any> { // TODO: check type
    try {
      const response = await this.postImportDatasetRequest
        .set("Authorization", AuthService.shared.bearer)
        .send({ 'wanted_datasets': datasets })
        .set("Accept", "application/json");
      return response.body
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  }

  public abortPostImportDatasets(): void {
    this.postImportDatasetRequest.abort();
  }

  private handleError(error: any) {
    if (error?.status === 401) AuthService.shared.logout();
  }
}