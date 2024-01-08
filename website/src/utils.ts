import { useHistory } from "react-router-dom";

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