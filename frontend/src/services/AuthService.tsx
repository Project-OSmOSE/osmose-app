import { SuperAgentRequest, post } from 'superagent';
import { Subject } from "rxjs";

export class AuthService {
  public static shared: AuthService = new AuthService();
  private static LOGIN_URI = '/api/token/';


  private loginRequest?: SuperAgentRequest;
  private _token?: string;
  public tokenUpdate = new Subject<string | undefined>();

  get token(): string | undefined {
    return this._token;
  }

  set token(value: string | undefined) {
    if (this._token === value) return;
    this._token = value;
    this.tokenUpdate.next(value);
  }

  get bearer(): string {
    return `Bearer ${this.token}`;
  }

  public async login(username: string, password: string) {
    this.loginRequest = post(AuthService.LOGIN_URI);
    const response = await this.loginRequest.send({
      username,
      password
    });
    this.token = response.body.access;
    // Cookie is set to expire a bit before 8 hours
    document.cookie = `token=${ this.token };max-age=28000;path=/`;
  }

  public abortLogin() {
    this.loginRequest?.abort();
  }

  public logout() {
    document.cookie = 'token=;max-age=0;path=/';
    this.token = undefined;
  }

  public checkToken() {
    if (!document.cookie) return;
    const value = document.cookie.split(';').filter((item) => item.trim().startsWith('token='))[0];
    if (!value) return;
    this.token = value.split('=').pop()
  }
}