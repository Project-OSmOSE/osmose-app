import { useHistory } from "react-router-dom";
import { Parser } from "html-to-react";

export const API_FETCH_INIT = {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    }
}

export const useCatch404 = (): (e: any, fallback: string) => void => {
    const history = useHistory();
    return (e: any, fallback: string) => {
        console.debug('catch404', e.status, e)
        if (e?.status !== 404) throw e;
        history.push(fallback);
    }
}

export const getFormattedDate = (date: string) => {
    return Intl.DateTimeFormat('en-US', {
        dateStyle: 'long'
    }).format(new Date(date)).replaceAll('/', '-');
}

export const parseHTML = (body: string) => {
    const pImgContainer: Array<string> | null = body.match(/<p>(<img([\w\W]+?)\/>)+<\/p>/g);
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