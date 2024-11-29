import { get, post, SuperAgentRequest } from "superagent";
import { v4 as uuidV4 } from "uuid";
import { OldAPIService } from "./api-service.util.tsx";
import { SpectrogramConfiguration } from "@/types/process-metadata/spectrograms.ts";

export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  files_type: string;
  start_date: string;
  end_date: string;
  files_count: number;
  type: string;
  spectros: Array<SpectrogramConfiguration>;
  created_at: string;
}
export type ListToImport = Array<ListToImportItem>
export type ListToImportItem = {
  dataset: string;
  name: string; // = dataset
  path: string;
  spectro_duration: string;
  dataset_sr: string;
  file_type: string;
}

class DatasetAPIService extends OldAPIService<ListItem, never> {
  URI = '/api/dataset';

  private listToImportRequest?: SuperAgentRequest;
  private importRequest?: SuperAgentRequest;

  list(filterFilesType?: string): Promise<List> {
    return super.list()
      .then((datasets: List) => {
        if (!filterFilesType) return datasets;
        return datasets.filter(d => d.files_type === filterFilesType)
      });
  }

  public listToImport(): Promise<ListToImport> {
    this.listToImportRequest = get(`${ this.URI }/list_to_import`).set("Authorization", 'bearer');
    return this.listToImportRequest.then(r => r.body.map((d: any) => ({
      ...d,
      id: uuidV4()
    })));
  }

  public importDatasets(data: ListToImport): Promise<ListToImport> {
    this.importRequest = post(`${ this.URI }/datawork_import/`)
      .set("Authorization", 'bearer')
      .set("Accept", "application/json")
      .send({ 'wanted_datasets': data });
    return this.importRequest.then(r => r.body);
  }

  public abort() {
    super.abort();
    this.listToImportRequest?.abort();
    this.importRequest?.abort();
  }

  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useDatasetsAPI = () => {
  return new DatasetAPIService('/api/dataset');
}
