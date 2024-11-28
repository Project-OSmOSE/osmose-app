import { useHistory, useLocation } from "react-router-dom";

export const API_FETCH_INIT = {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    }
}



export const useFetchArray = <T>(apiUrL: string) => {
    const history = useHistory();
    const location = useLocation();

    return async (pageOptions?: { currentPage: number, pageSize: number }): Promise<T | undefined> => {
        let composedURL = apiUrL;
        if (pageOptions) composedURL = `${ apiUrL }?page=${ pageOptions.currentPage }&page_size=${ pageOptions.pageSize }`
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


