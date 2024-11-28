export class APIService {
  static API_FETCH_INIT = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  }

  protected static _url: string;

  protected static _get<T>(url: string): Promise<T> {
    return fetch(url, this.API_FETCH_INIT)
      .then(r => r.json());
  }
}
