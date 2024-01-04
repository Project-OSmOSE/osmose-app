import { SuperAgentRequest, get, post } from "superagent";
import { Dataset } from "./ApiService.data.tsx";
import { v4 as uuidV4 } from "uuid";
import { ApiServiceParent } from "./ApiService.parent.tsx";

export class DatasetApiService extends ApiServiceParent {
  public static shared: DatasetApiService = new DatasetApiService();
  private URI = '/api/dataset';

  private listRequest?: SuperAgentRequest;
  private listNotImportedRequest?: SuperAgentRequest;
  private importRequest?: SuperAgentRequest;

  public async list(): Promise<Array<Dataset>> { // TODO: check type
    this.listRequest = get(this.URI);
    const response = await this.doRequest(this.listRequest)
    delete this.listRequest;
    return response.body;
  }

  public async getNotImportedDatasets(): Promise<Array<Dataset>> { // TODO: check type
    this.listNotImportedRequest = get(`${ this.URI }/list_to_import`);
    const response = await this.doRequest(this.listNotImportedRequest)
    delete this.listNotImportedRequest;
    return JSON.parse(response.text).map((data: Dataset) => ({
      ...data,
      id: uuidV4()
    }));
  }

  public async postImportDatasets(datasets: Array<Dataset>): Promise<any> { // TODO: check type
    this.importRequest = post(`${ this.URI }/datawork_import/`);
    const response = await this.doRequest(this.importRequest
      .set("Accept", "application/json")
      .send({ 'wanted_datasets': datasets }))
    delete this.importRequest;
    return response.body;
  }

  public abortRequests(): void {
    this.listRequest?.abort();
    this.listNotImportedRequest?.abort();
    this.importRequest?.abort();
  }
}