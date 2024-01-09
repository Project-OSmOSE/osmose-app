import { Subject } from "rxjs";

export class AuthService {
  public static shared: AuthService = new AuthService();


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