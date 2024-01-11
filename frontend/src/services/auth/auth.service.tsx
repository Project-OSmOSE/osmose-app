import { useAuthContext, useAuthDispatch } from "./auth.context.tsx";
import { post, SuperAgentRequest } from "superagent";
import { useState } from "react";

const _URI = '/api/token/';

export const useAuthService = () => {
  const [request, setRequest] = useState<SuperAgentRequest | undefined>();
  const dispatch = useAuthDispatch();
  return {
    context: useAuthContext(),
    dispatch,
    login: async (username: string, password: string): Promise<void> => {
      const request = post(_URI).send({ username, password });
      setRequest(request);
      const token = await request.then(r => r.body.access);
      dispatch!({
        type: 'login',
        token
      });
    },
    catch401: (e: any) => {
      if (e?.status !== 401) throw e;
      dispatch!({ type: 'logout' });
    },
    abort: () => {
      request?.abort();
    }
  }
}