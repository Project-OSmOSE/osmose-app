import { APIService } from "../requests.tsx";
import { get, post, SuperAgentRequest } from "superagent";
import { v4 as uuidV4 } from "uuid";
import { useAuth, useAuthDispatch } from "../auth.tsx";
import { useEffect } from "react";

export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  files_type: string;
  start_date: Date;
  end_date: Date;
  files_count: number;
  type: string;
  spectros: Array<ListItemSpectros>;
  created_at: Date;
}
export type ListItemSpectros = {
  id: number;
  name: string;
  desc: string;
  nfft: number;
  window_size: number;
  overlap: number;
  zoom_level: number;
  spectro_normalization: string;
  data_normalization: string;
  zscore_duration: string;
  hp_filter_min_freq: number;
  colormap: string;
  dynamic_min: number;
  dynamic_max: number;
  frequency_resolution: number;
  time_resolution_zoom_0: number;
  time_resolution_zoom_1: number;
  time_resolution_zoom_2: number;
  time_resolution_zoom_3: number;
  time_resolution_zoom_4: number;
  time_resolution_zoom_5: number;
  time_resolution_zoom_6: number;
  time_resolution_zoom_7: number;
  time_resolution_zoom_8: number;
  window_type: number;
  dataset: number;
}
export type ListToImport = Array<ListToImportItem>
export type ListToImportItem = {
  id: string;
  name: string;
  folder_name: string;
  conf_folder: string;
  dataset_type_name: string;
  dataset_type_desc: string;
  files_type: string;
  location_name: string;
  location_desc: string;
  location_lat: string;
  location_lon: string;
  audio_file_dataset_duration: string;
}
export const useDatasetsAPI = () => {

  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    service.setAuth(auth)
  }, [auth])

  const service = new class DatasetAPIService extends APIService<List, never, never> {
    URI = '/api/dataset';

    private listToImportRequest?: SuperAgentRequest;
    private importRequest?: SuperAgentRequest;

    list(filterFilesType?: string): Promise<List> {
      return super.list()
        .then(r => r.map(d => ({
          ...d,
          start_date: new Date(d.start_date),
          end_date: new Date(d.end_date),
          created_at: new Date(d.created_at),
        }))).then((datasets: List) => {
          if (!filterFilesType) return datasets;
          return datasets.filter(d => d.files_type === filterFilesType)
        });
    }

    public listToImport(): Promise<ListToImport> {
      this.listToImportRequest = get(`${ this.URI }/list_to_import`).set("Authorization", this.auth.bearer!);
      return this.listToImportRequest.then(r => r.body.map((d: any) => ({
        ...d,
        id: uuidV4()
      }))).catch(this.catch401);
    }

    public importDatasets(data: ListToImport): Promise<ListToImport> {
      this.importRequest = post(`${ this.URI }/datawork_import/`)
        .set("Authorization", this.auth.bearer!)
        .set("Accept", "application/json")
        .send({ 'wanted_datasets': data });
      return this.importRequest.then(r => r.body).catch(this.catch401);
    }

    public abort() {
      super.abort();
      this.listToImportRequest?.abort();
      this.importRequest?.abort();
    }
  }(auth, authDispatch!);

  return service;
}
