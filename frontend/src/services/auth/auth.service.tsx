import { useAuthContext, useAuthDispatch } from "./auth.context.tsx";
import { Response } from "../../old/utils/requests.tsx";
import { post } from "superagent";

const _URI = '/api/token/';

export const useAuthService = () => {
  return {
    context: useAuthContext(),
    dispatch: useAuthDispatch(),
    login: (username: string, password: string): Response<string> => {
      const request = post(_URI).send({ username, password });
      const response = new Promise<string>((resolve, reject) => {
        request.then(r => resolve(r.body.access)).catch(reject);
      });
      return { request, response }
    }
  }
}