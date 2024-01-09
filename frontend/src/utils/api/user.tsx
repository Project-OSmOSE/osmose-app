import { Response } from "../requests.tsx";
import { get } from "superagent";

const URI = '/api/user';

export type List = Array<ListItem>
export type ListItem = {
  id: number;
  username: string;
  email: string;
}

export function list(bearer: string): Response<List> {
  const request = get(URI).set("Authorization", bearer);
  return {
    request,
    response: request.then(r => r.body)
  }
}

export function isStaff(bearer: string): Response<boolean> {
  const request = get(`${ URI }/is_staff`).set("Authorization", bearer);
  return {
    request,
    response: request.then(r => r.body.is_staff)
  }
}