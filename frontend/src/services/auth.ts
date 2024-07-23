import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { History, LocationState } from "history";

import { AuthSlice, login, logout } from "@/slices/auth.ts";
import { useAppSelector, useAppDispatch, AppDispatch } from "@/slices/app";

export class AuthAPIService {
  private readonly URI = '/api/token/';
  private readonly controller = new AbortController();

  context?: AuthSlice;

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

  constructor(private dispatch: AppDispatch,
              private history: History<LocationState>) {
  }

  async login(username: string, password: string): Promise<void> {
    const response = await fetch(this.URI, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: this.controller.signal,
    });
    if (response.status !== 200) {
      let data = response.statusText
      try {
        data = (await response.json()).detail
      } catch {
        // Do not handle
      }
      throw data;
    }
    const data = await response.json();
    this.dispatch(login(data.access))
  }

  isConnected(): boolean {
    if (this.context?.token) return true;
    const token = this.token;
    if (!token) return false;
    this.dispatch(login(token))
    return true;
  }

  logout() {
    this.dispatch(logout())
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
  const dispatch = useAppDispatch();
  const context = useAppSelector(state => state.auth);
  const history = useHistory();

  const api = new AuthAPIService(dispatch, history);

  useEffect(() => {
    api.context = context;
  }, [context])

  return api;
}
