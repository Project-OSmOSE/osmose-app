import { useCallback, useEffect } from 'react';
import { Toast } from '@/components/base/Toast';
import { useLoaderData, useNavigate } from '@tanstack/react-router';
import { useOpenAnnotator } from '@/features/Annotator/Navigation';
import { convertAnnotationsToPost, selectAllAnnotations } from '@/features/Annotator/Annotation';
import { convertCommentsToPost, selectTaskComments } from '@/features/Annotator/Comment';
import { useAppSelector } from '@/features/App';
import { selectAllFileIsSeen, selectStart } from '@/features/Annotator/UX';
import {
    Route,
} from '@/routes/_authenticated/annotation-campaign/$campaignID/phase.$phaseType/spectrogram/$spectrogramID'
import { useMutation } from '@tanstack/react-query';
import { TaskAPI } from '../AnnotationTask';
import { useHotkey } from '@tanstack/react-hotkeys';

export const useAnnotatorSubmit = () => {
    const {
        campaign,
    } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID' })
    const {
        phase,
    } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType' })
    const {
        spectrogram,
        info,
        isEditionAuthorized,
    } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID' })
    const openAnnotator = useOpenAnnotator()
    const toastManager = Toast.useToastManager()
    const navigate = useNavigate()
    const allAnnotations = useAppSelector(selectAllAnnotations)
    const taskComments = useAppSelector(selectTaskComments)
    const { mutate: submitTask, isSuccess, error, ...submitInfo } = useMutation(TaskAPI.submitMutation)

    const params = Route.useParams();
    const search = Route.useSearch();
    const allFileIsSeen = useAppSelector(selectAllFileIsSeen)
    const start = useAppSelector(selectStart)

    const realSubmit = useCallback(() => {
        if (!isEditionAuthorized) return;
        submitTask({
            campaignID: campaign.id,
            spectrogramID: spectrogram.id,
            phase: phase.phase,
            annotations: convertAnnotationsToPost(allAnnotations),
            taskComments: convertCommentsToPost(taskComments),
            startedAt: start.toISOString(),
            endedAt: new Date().toISOString(),
        })
    }, [ isEditionAuthorized, allAnnotations, submitTask, start, taskComments, campaign, phase, spectrogram ])
    const submit = useCallback(() => {
        if (!isEditionAuthorized) return;
        if (!allFileIsSeen) {
            const id = toastManager.add({
                title: 'File unseen',
                description: 'Be careful, you haven\' see all of the file yet. Try scrolling to the end or changing the zoom level',
                type: 'warning',
                actionProps: {
                    children: 'Submit anyway',
                    onClick: () => {
                        toastManager.close(id)
                        realSubmit()
                    },
                },
            })
            return;
        }
        realSubmit()
    }, [ toastManager, realSubmit, isEditionAuthorized, allFileIsSeen ])
    useHotkey('Enter', () => submit())

    useEffect(() => {
        if (!isSuccess) return;
        if (info?.nextSpectrogramId) {
            openAnnotator(info.nextSpectrogramId, { replace: true });
        } else {
            navigate({
                to: '/annotation-campaign/$campaignID/phase/$phaseType',
                params, search,
            })
        }
    }, [ isSuccess, navigate ]);

    useEffect(() => {
        if (error) toastManager.addError({ title: 'Submission failed', error })
    }, [ error ]);

    return { submit, isSuccess, error, ...submitInfo }
}