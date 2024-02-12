import { Auth, AuthAction, useAuthContext, useAuthDispatch } from "./auth.context.tsx";
import { Dispatch, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { History, LocationState } from "history";

export class AuthAPIService {
  private readonly URI = '/api/token/';
  private readonly controller = new AbortController();

  context?: Auth;

  get bearer(): string {
    return `Bearer ${ this.token }`
  }

  private get token(): string | undefined {
    if (this.context?.token) return this.context?.token;
    if (!document.cookie) return undefined;
    const value = document.cookie.split(';').filter((item) => item.trim().startsWith('token='))[0];
    const token = value?.split('=').pop()
    if (!token) return undefined;
    return token;
  }

  constructor(private dispatch: Dispatch<AuthAction>,
              private history: History<LocationState>) {
  }

  async login(username: string, password: string): Promise<void> {
    const response = await fetch(this.URI, {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({username, password}),
      signal: this.controller.signal,
    });
    if (response.status !== 200) throw (await response.json()).detail ?? response.statusText;
    const data = await response.json();
    this.dispatch({
      type: 'login',
      token: data.access
    });
  }

  isConnected(): boolean {
    if (this.context?.token) return true;
    const token = this.token;
    if (!token) return false;
    this.dispatch({type: 'login', token});
    return true;
  }

  logout() {
    this.dispatch({type: 'logout'});
    this.history.push('/login');
  }

  catch401(e: any) {
    if (e?.status !== 401) throw e;
    this.logout();
  }

  abort() {
    this.controller.abort('Abort requested by the user');
  }
}

export const useAuthService = () => {
  const dispatch = useAuthDispatch();
  const context = useAuthContext();
  const history = useHistory();

  const api = new AuthAPIService(dispatch!, history);

  useEffect(() => {
    api.context = context;
  }, [ context ])

  return api;
}
