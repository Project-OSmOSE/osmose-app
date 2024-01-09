import { Response } from "../requests.tsx";
import { get } from "superagent";

const URI = '/api/annotation-set';

export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  desc: string;
  tags: Array<string>;
}

export function list(bearer: string): Response<List> {
  const request = get(URI).set("Authorization", bearer);
  const response = new Promise<List>((resolve, reject) => {
    request.then(r => r.body).then(resolve).catch(reject);
  });
  return { request, response }
}