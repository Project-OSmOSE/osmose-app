import { useHistory, useLocation } from "react-router-dom";
import { Parser } from "html-to-react";

export const API_FETCH_INIT = {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  }
}

export const useFetchDetail = <T>(listPageURL: string, apiURL: string) => {
  const history = useHistory();

  return async (id: string): Promise<T | undefined> => {
    const url = `${ apiURL }/${ id }`;
    try {
      const response = await fetch(url, API_FETCH_INIT);
      if (!response.ok) throw response;
      return await response.json();
    } catch (e: any) {
      if (e?.status === 404) {
        history.push(listPageURL);
        return;
      }
      console.error(`Cannot fetch ${ url }, got error:`, e)
    }
  }
}

export const useFetchArray = <T>(apiUrL: string) => {
  const history = useHistory();
  const location = useLocation();

  return async (params?: { page: number, page_size: number } & any): Promise<T | undefined> => {
    let composedURL = apiUrL;
    if (params) composedURL = `${ apiUrL }?${ Object.entries(params).map(([ key, value ]) => [ key, value ].join('=')).join('&') }`
    try {
      const response = await fetch(composedURL, API_FETCH_INIT);
      if (!response.ok) throw response;
      return await response.json();
    } catch (e: any) {
      if (e?.status === 404) {
        history.push(location.pathname);
        return;
      }
      console.error(`Cannot fetch ${ composedURL }, got error:`, e);
    }
  }
}

export const useFetchGql = <T>(query: string) => {
  const history = useHistory();
  const location = useLocation();

  return async (): Promise<T | undefined> => {
    try {
      const body = JSON.stringify({query})
      const response = await fetch('/api/graphql', {
        method: 'POST',
        body,
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (!response.ok) throw response;
      return (await response.json()).data;
    } catch (e: any) {
      if (e?.status === 404) {
        history.push(location.pathname);
        return;
      }
      console.error(`Cannot fetch gql, got error:`, e);
    }
  }
}

export const getFormattedDate = (date?: string) => {
  if (!date) return;
  return Intl.DateTimeFormat('en-US', {
    dateStyle: 'long'
  }).format(new Date(date)).replaceAll('/', '-');
}

export const getYear = (date?: string) => {
  if (!date) return;
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric'
  }).format(new Date(date));
}

export const parseHTML = (body: string) => {
  const pImgContainer: Array<string> | null = body.match(/<p([\s\w="]*?)>(<img([\w\W]+?)\/>)+<\/p>/g);
  if (!pImgContainer) return Parser().parse(body ?? "");
  for (const pContainer of pImgContainer) {
    const div = document.createElement('div');
    div.className = "figure-container";
    const imgData: Array<string> | null = pContainer.match(/<img(.+?)\/>/g);
    if (!imgData) continue;
    for (const img of imgData) {
      const figure = getFigureFromImgHTML(img);
      if (!figure) continue;
      div.appendChild(figure);
    }
    body = body.replace(pContainer, div.outerHTML);
  }
  return Parser().parse(body ?? "");
}

export const getFigureFromImgHTML = (img: string): HTMLElement | undefined => {
  const figure = document.createElement('figure');
  figure.innerHTML = img;
  const imgTag = figure.children[0] as HTMLImageElement;
  if (!imgTag) return;

  if (imgTag.alt) {
    const caption = document.createElement('figcaption');
    caption.innerText = imgTag.alt;
    caption.className = "text-muted";
    figure.appendChild(caption);
  }

  return figure;
}