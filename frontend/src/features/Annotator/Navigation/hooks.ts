import { useCallback } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useAppSelector } from '@/features/App';
import { selectUpdated } from '@/features/Annotator/UX';
import { Alert } from '@/components/base';

// TODO: useTanstack <Block/> or useBlock()
export const useAnnotatorCanNavigate = () => {
    const isUpdated = useAppSelector(selectUpdated);
    const alert = Alert.useManager()

    return useCallback(async (): Promise<boolean | null> => {
        if (!isUpdated) return true;
        return await alert.present({
            color: 'warning',
            message: `You have unsaved changes. Are you sure you want to forget all of them?`,
            buttons: [ {
                type: 'Cancel',
            }, {
                type: 'Confirm',
                text: 'Forget my changes',
                confirmData: true,
            } ],
        })
    }, [ alert, isUpdated ])
}

export const useOpenAnnotator = () => {
    const routeParams: any = useParams({ strict: false })
    const search: any = useSearch({ strict: false });
    const navigate = useNavigate()

    return useCallback((spectrogramID: string, options?: { resume?: boolean }) => {
        const _search = { ...search }
        if (options?.resume) _search.onlyAssigned = true
        navigate({
            to: '/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID',
            params: { ...routeParams, spectrogramID },
            search: _search,
            replace: true,
        });
    }, [ routeParams, search, navigate ])
}