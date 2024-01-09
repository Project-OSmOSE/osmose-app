import { Response } from "../requests.tsx";
import { get } from "superagent";

const URI = '/api/confidence-indicator';

export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  desc: string;
  confidenceIndicators: Array<{
    id: number;
    label: string;
    level: number;
    isDefault: boolean;
  }>;
}

export function list(bearer: string): Response<List> {
  const request = get(URI).set("Authorization", bearer);
  return {
    request,
    response: request.then(r => r.body)
  }
}