export namespace request {
  const fetchWrap = async (
    method: string,
    url: string,
    token?: string,
    body?: any,
    responseType: "JSON" | "TEXT" = "JSON"
  ): Promise<any> => {
    const headers = new Headers();
    headers.set("Accept", "application/json");
    headers.set("Content-Type", "application/json");
    if (token && token !== "") {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // TODO come back here to build the same error format (status, response, response.body)
    const responseStatus = response.status.toFixed();
    if (responseStatus.startsWith("4") || responseStatus.startsWith("5")) {
      const rawError = await response.text();
      let errorMsg = rawError;
      try {
        const errJson = JSON.parse(rawError);
        errorMsg = errJson.error;
      } catch (_) {}
      throw { message: errorMsg, status: response.status };
    }

    try {
      const body = (responseType === "TEXT") ? await response.text() : await response.json();
      return { body };
    } catch (err) {
      return { body: '' };
    }
  };

  export const get = async (
    url: string,
    token?: string,
    responseType: "JSON" | "TEXT" = "JSON"
  ): Promise<any> => {
    return fetchWrap("GET", url, token, undefined, responseType);
  };

  export const post = async (
    url: string,
    token?: string,
    body?: any,
    responseType: "JSON" | "TEXT" = "JSON"
  ): Promise<any> => {
    return fetchWrap("POST", url, token, body, responseType);
  };
}
