export namespace request {
  const fetchWrap = async (
    method: string,
    url: string,
    token?: string,
    body?: any
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
      return await response.json();
    } catch (err) {
      return "";
    }
  };

  export const get = async (url: string, token?: string): Promise<any> => {
    return fetchWrap("GET", url, token);
  };

  export const post = async (
    url: string,
    token?: string,
    body?: any
  ): Promise<any> => {
    return fetchWrap("POST", url, token, body);
  };
}
