import { SuperAgentRequest } from "superagent";

export interface Response<T> {
  request: SuperAgentRequest,
  response: Promise<T>
}