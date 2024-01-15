import { get, post, SuperAgentRequest } from "superagent";
import { Dispatch } from "react";
import { Auth, AuthAction } from "../../services/auth";

export interface Request {
  abort(): void;
}
export interface Response<T> {
  request: Request,
  response: Promise<T>
}

export class APIService<List, Retrieve, Create>{

  protected auth: Auth;
  private authDispatch: Dispatch<AuthAction>;

  protected URI = '/api';

  private listRequest?: SuperAgentRequest;
  private retrieveRequest?: SuperAgentRequest;
  private createRequest?: SuperAgentRequest;
  private downloadRequests: Map<string, SuperAgentRequest> = new Map();
  private downloadURL: Map<string, string> = new Map();

  constructor(auth: Auth,
              authDispatch: Dispatch<AuthAction>) {
    this.auth = auth;
    this.authDispatch = authDispatch;
  }

  public setAuth(auth: Auth): void {
    this.auth = auth;
  }

  public list(url?: string): Promise<List> {
    this.listRequest = get(url ?? this.URI).set("Authorization", this.auth.bearer!);
    return this.listRequest.then(r => r.body).catch(this.catch401)
  }

  public retrieve(id: string): Promise<Retrieve> {
    this.retrieveRequest = get(`${ this.URI }/${ id }`).set("Authorization", this.auth.bearer!);
    return this.retrieveRequest.then(r => r.body).catch(this.catch401)
  }

  public create(data: object, url?: string): Promise<Create> {
    this.createRequest = post(url ?? `${ this.URI }/`).set("Authorization", this.auth.bearer!).send(data);
    return this.createRequest.then(r => r.body).catch(this.catch401)
  }

  public abort(): void {
    this.listRequest?.abort();
    this.retrieveRequest?.abort();
    this.createRequest?.abort();
    this.downloadURL.forEach(url => URL.revokeObjectURL(url));
    this.downloadURL = new Map<string, string>();
    this.downloadRequests.forEach(r => r.abort());
    this.downloadRequests = new Map<string, SuperAgentRequest>();
  }

  protected catch401(e: any) {
    if (e?.status !== 401) throw e;
    this.authDispatch({ type: 'logout' });
  }

  protected async download(requestURL: string, filename: string) {
    const formerURL= this.downloadURL.get(requestURL);
    if (formerURL) URL.revokeObjectURL(formerURL);

    const request = get(requestURL).set("Authorization", this.auth.bearer!);
    this.downloadRequests.set(requestURL, request);

    const result = await request
    const url = URL.createObjectURL(new File([result.text], filename, { type: result.header['content-type'] }));
    // Using <a>-linking trick https://stackoverflow.com/a/19328891/2730032
    const a = document.createElement('a');
    a.style.display = "none";
    a.href = url;
    this.downloadURL.set(requestURL, url);
    a.type = result.header['content-type'];
    a.download = filename;
    if (!document.body) throw new Error("Unexpectedly missing <body>");
    document.body.appendChild(a);
    a.click();
  }
}
