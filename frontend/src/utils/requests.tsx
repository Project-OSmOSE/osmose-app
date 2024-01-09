import { SuperAgentRequest } from "superagent";

export interface Request {
  abort(): void;
}
export interface Response<T> {
  request: Request,
  response: Promise<T>
}

export async function download(request: SuperAgentRequest, filename: string): Promise<string> {
  const result = await request
  const url = URL.createObjectURL(new File([result.text], filename, { type: result.header['content-type'] }));
  // Using <a>-linking trick https://stackoverflow.com/a/19328891/2730032
  const a = document.createElement('a');
  a.style.display = "none";
  a.href = url;
  a.type = result.header['content-type'];
  a.download = filename;
  if (!document.body) throw new Error("Unexpectedly missing <body>");
  document.body.appendChild(a);
  a.click();
  return url;
}