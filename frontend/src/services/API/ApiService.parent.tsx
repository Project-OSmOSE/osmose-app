import { AuthService } from "./AuthService.tsx";
import { SuperAgentRequest, Response } from "superagent";


export class ApiServiceParent {
  protected currentRequestedUrl?: string;

  protected async doRequest(request: SuperAgentRequest, bearer: string): Promise<Response> {
    try {
      return await request.set("Authorization", bearer)
    } catch (error: any) {
      if (error?.status === 401) AuthService.shared.logout();
      throw error
    }
  }

  protected async downloadRequest(request: SuperAgentRequest, filename: string): Promise<void> {
    if (this.currentRequestedUrl) URL.revokeObjectURL(this.currentRequestedUrl);
    const response = await this.doRequest(request);
    this.currentRequestedUrl = URL.createObjectURL(new File([response.text], filename, { type: response.header['content-type'] }));
    // Using <a>-linking trick https://stackoverflow.com/a/19328891/2730032
    const a = document.createElement('a');
    a.style.display = "none";
    a.href = this.currentRequestedUrl;
    a.type = response.header['content-type'];
    a.download = filename;
    if (!document.body) throw new Error("Unexpectedly missing <body>");
    document.body.appendChild(a);
    a.click();
  }
}