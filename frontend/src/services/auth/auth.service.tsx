import { AuthAction, useAuthContext, useAuthDispatch } from "./auth.context.tsx";
import { Dispatch } from "react";

class AuthAPIService {
  private readonly URI = '/api/token/';
  private readonly controller = new AbortController();

  constructor(private dispatch: Dispatch<AuthAction>) {
  }

  async login(username: string, password: string): Promise<void> {
    const response = await fetch(this.URI, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: this.controller.signal,
    });
    if (response.status !== 200) throw (await response.json()).detail ?? response.statusText
    const data = await response.json();
    this.dispatch({
      type: 'login',
      token: data.access
    });
  }

  abort() {
    this.controller.abort('Abort requested by the user');
  }
}

export const useAuthService = () => {
  const dispatch = useAuthDispatch();

  const api = new AuthAPIService(dispatch!);

  return {
    context: useAuthContext(),
    dispatch,
    login: api.login.bind(api),
    catch401: (e: any) => {
      if (e?.status !== 401) throw e;
      dispatch!({ type: 'logout' });
    },
    abort: api.abort.bind(api)
  }
}