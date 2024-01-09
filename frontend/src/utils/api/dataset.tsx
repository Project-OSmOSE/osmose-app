import { Response } from "../requests.tsx";
import { get, post } from "superagent";
import { v4 as uuidV4 } from "uuid";

const URI = '/api/dataset';

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

export function list(bearer: string, filterFilesType?: string): Response<List> {
  const request = get(URI).set("Authorization", bearer);
  return {
    request,
    response: request.then(r => r.body.map((d: any) => ({
      ...d,
      start_date: new Date(d.start_date),
      end_date: new Date(d.end_date),
      created_at: new Date(d.created_at),
    })))
      .then((datasets: List) => {
        if (!filterFilesType) return datasets;
        return datasets.filter(d => d.files_type === filterFilesType)
      })
  }
}

export function listToImport(bearer: string): Response<ListToImport> {
  const request = get(`${ URI }/list_to_import`).set("Authorization", bearer);
  return {
    request,
    response: request.then(r => r.body.map((d: any) => ({
      ...d,
      id: uuidV4()
    })))
  }
}

export function importDatasets(data: ListToImport, bearer: string): Response<ListToImport> {// TODO: check type
  const request = post(`${ URI }/datawork_import/`)
    .set("Authorization", bearer)
    .set("Accept", "application/json")
    .send({ 'wanted_datasets': data });
  return {
    request,
    response: request.then(r => r.body)
  }
}