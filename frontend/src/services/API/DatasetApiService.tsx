import { SuperAgentRequest, get, post } from "superagent";
import { Dataset } from "./ApiService.data.tsx";
import { v4 as uuidV4 } from "uuid";
import { ApiServiceParent } from "./ApiService.parent.tsx";

export class DatasetApiService extends ApiServiceParent {
  public static shared: DatasetApiService = new DatasetApiService();
  private URI = '/api/dataset';

  private listRequest: SuperAgentRequest = get(this.URI);
  private listNotImportedRequest: SuperAgentRequest = get(`${ this.URI }/list_to_import`);
  private importRequest: SuperAgentRequest = post(`${ this.URI }/datawork_import`);

  public async list(): Promise<Array<Dataset>> { // TODO: check type
    const response = await this.doRequest(this.listRequest)
    return response.body;
  }

  public async getNotImportedDatasets(): Promise<Array<Dataset>> { // TODO: check type
    const response = await this.doRequest(this.listRequest)
    return JSON.parse(response.text).map((data: Dataset) => ({
      ...data,
      id: uuidV4()
    }));
  }

  public async postImportDatasets(datasets: Array<Dataset>): Promise<any> { // TODO: check type
    const response = await this.doRequest(this.listRequest
      .set("Accept", "application/json")
      .send({ 'wanted_datasets': datasets }))
    return response.body;
  }

  public abortRequests(): void {
    this.listRequest.abort();
    this.listNotImportedRequest.abort();
    this.importRequest.abort();
  }
}