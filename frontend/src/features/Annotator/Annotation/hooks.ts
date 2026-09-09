import { useAppDispatch, useAppSelector } from '@/features/App';
import { useCallback } from 'react';
import { addAnnotation, type Annotation, blur, focusAnnotation, removeAnnotation, updateAnnotation } from './slice';
import { selectAllAnnotations } from './selectors'
import { getNewItemID } from '@/service/function';
import { AnnotationType } from '@/api';
import { selectDefaultConfidence } from '@/features/Annotator/Confidence';
import { useLoaderData, useParams } from '@tanstack/react-router';
import { Alert } from '@/components/base';

type AnnotationEqualsType = Pick<Annotation, 'label' | 'confidence' | 'startTime' | 'endTime' | 'startFrequency' | 'endFrequency'>


const useGetNewAnnotationID = () => {
    const allAnnotations = useAppSelector(selectAllAnnotations);

    return useCallback(() => {
        return getNewItemID([ ...allAnnotations, ...allAnnotations.filter(a => !!a.update).map(a => a.update!) ])
    }, [ allAnnotations ])
}

const useAnnotationEquals = () => {
    return useCallback((a: AnnotationEqualsType, b: AnnotationEqualsType): boolean => {
        return a.label === b.label
            && a.confidence === b.confidence
            && a.startTime === b.startTime
            && a.endTime === b.endTime
            && a.startFrequency === b.startFrequency
            && a.endFrequency === b.endFrequency
    }, [])
}

const useUpdateValidation = () => {
    return useCallback((isValid: boolean, validation?: Annotation['validation']): Annotation['validation'] => {
        return validation ? { ...validation, isValid } : { isValid }
    }, [])
}


export const useFilterAnnotations = () => {
    return useCallback((annotation: Annotation, properties: Partial<Annotation>): boolean => {
        let result = true;
        for (const [ key, value ] of Object.entries(properties)) {
            result = result && annotation[key as keyof Annotation] === value
        }
        return result
    }, [])
}

export const useGetAnnotations = () => {
    const allAnnotations = useAppSelector(selectAllAnnotations);
    const _filterAnnotations = useFilterAnnotations()

    return useCallback((properties: Partial<Annotation>) => {
        return allAnnotations.filter(a => _filterAnnotations(a, properties));
    }, [ allAnnotations, _filterAnnotations ])
}

export const useGetAnnotation = () => {
    const allAnnotations = useAppSelector(selectAllAnnotations);
    const _filterAnnotations = useFilterAnnotations()

    return useCallback((properties: Partial<Annotation>) => {
        return allAnnotations.find(a => _filterAnnotations(a, properties));
    }, [ allAnnotations, _filterAnnotations ])
}


export const useAddAnnotation = () => {
    const getNewID = useGetNewAnnotationID()
    const { user } = useLoaderData({ from: '/_authenticated' })
    const { phase } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType' })
    const dispatch = useAppDispatch();

    return useCallback((annotation: Omit<Annotation, 'id' | 'analysis' | 'annotationPhase'>) => {
        const addedAnnotation = dispatch(addAnnotation({
            ...annotation,
            annotationPhase: phase.id,
            id: getNewID(),
            annotator: user.id,
        })).payload as Annotation
        dispatch(focusAnnotation(addedAnnotation))
    }, [ dispatch, getNewID, user, phase ])
}

export const useValidateAnnotation = () => {
    const allAnnotations = useAppSelector(selectAllAnnotations);
    const _updateValidation = useUpdateValidation()
    const dispatch = useAppDispatch();

    return useCallback((annotation: Annotation): Annotation => {
        annotation = dispatch(updateAnnotation({
            id: annotation.id,
            validation: _updateValidation(true, annotation.validation),
            update: undefined,
        })).payload as Annotation
        const otherStrongValidAnnotations = allAnnotations.filter(a => {
            if (a.type === AnnotationType.Weak) return false;
            if (a.label !== annotation.label) return false;
            return a.validation?.isValid
        });
        const weakAnnotation = allAnnotations.find(a => a.type === AnnotationType.Weak && a.label === annotation.label);
        if (annotation.type !== AnnotationType.Weak && otherStrongValidAnnotations.length === 0 && weakAnnotation) {
            dispatch(updateAnnotation({
                id: weakAnnotation.id,
                validation: _updateValidation(true, weakAnnotation.validation),
                update: undefined,
            }))
        }
        dispatch(focusAnnotation(annotation))
        return annotation
    }, [ dispatch, allAnnotations, _updateValidation ])
}

export const useInvalidateAnnotation = () => {
    const allAnnotations = useAppSelector(selectAllAnnotations);
    const _updateValidation = useUpdateValidation()
    const dispatch = useAppDispatch();

    return useCallback((annotation: Annotation): Annotation => {
        annotation = dispatch(updateAnnotation({
            id: annotation.id,
            validation: _updateValidation(false, annotation.validation),
        })).payload as Annotation
        if (annotation.type === AnnotationType.Weak) {
            const strongAnnotations = allAnnotations.filter(a => a.type !== AnnotationType.Weak && a.label === annotation.label);
            for (const a of strongAnnotations) {
                dispatch(updateAnnotation({
                    id: a.id,
                    validation: _updateValidation(false, a.validation),
                }))
            }
            dispatch(blur())
        } else {
            dispatch(focusAnnotation(annotation))
        }
        return annotation
    }, [ dispatch, allAnnotations, _updateValidation ])
}

export const useUpdateAnnotation = () => {
    const { phaseType } = useParams({ strict: false });
    const { user } = useLoaderData({ from: '/_authenticated' })
    const { phase } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType' })
    const allAnnotations = useAppSelector(selectAllAnnotations);
    const defaultConfidence = useAppSelector(selectDefaultConfidence);
    const getNewID = useGetNewAnnotationID()
    const add = useAddAnnotation()
    const _equals = useAnnotationEquals()
    const validate = useValidateAnnotation()
    const invalidate = useInvalidateAnnotation()
    const dispatch = useAppDispatch();

    return useCallback((annotation: Annotation, update: Partial<Annotation>) => {
        if (!phase) return;
        if (annotation.type === AnnotationType.Weak && 'label' in update) return;
        if (phaseType === 'Annotation' || annotation.annotator === user.id) {
            annotation = dispatch(updateAnnotation({ id: annotation.id, ...update })).payload as Annotation
        } else {
            // Verification mode
            const annotationUpdate: Annotation = {
                ...annotation, // Base is initial annotation
                ...(annotation.update ?? { id: getNewID() }), // Add existing update info if exist
                ...update, // Update according provided info
                annotator: user.id, // Current user is this update creator
                detectorConfiguration: undefined, // Detector is no longer the creator of this update
                validation: undefined,
                annotationPhase: phase.id,
            }
            if (_equals(annotation, annotationUpdate)) {
                annotation = validate(annotation)
            } else {
                annotation = dispatch(updateAnnotation({
                    id: annotation.id,
                    update: annotationUpdate,
                })).payload as Annotation
                annotation = invalidate(annotation)
            }
        }
        if (update.label && !allAnnotations.find(a => a.label === update.label && a.type === AnnotationType.Weak)) {
            // Add missing weak when changing label of an annotation
            add({ type: AnnotationType.Weak, label: update.label, confidence: update.confidence ?? defaultConfidence })
        }
        dispatch(focusAnnotation(annotation))
    }, [ dispatch, phaseType, allAnnotations, add, focus, _equals, validate, invalidate, user, getNewID, defaultConfidence, phase ])
}

export const useRemoveAnnotation = () => {
    const { phaseType } = useParams({ strict: false });
    const { user } = useLoaderData({ from: '/_authenticated' })
    const allAnnotations = useAppSelector(selectAllAnnotations);

    const getAnnotations = useGetAnnotations()
    const invalidate = useInvalidateAnnotation()
    const dispatch = useAppDispatch();
    const alert = Alert.useManager()

    const actualRemove = useCallback((annotation: Annotation) => {
        if (phaseType === 'Annotation' || annotation.annotator === user.id) {
            dispatch(removeAnnotation(annotation))
        } else {
            invalidate(annotation)
        }
    }, [phaseType, dispatch, invalidate, user])

    const remove = useCallback(async (annotation: Annotation, focusWeak: boolean = true, mustConfirm: boolean = true) => {
        if (annotation.type === 'Weak' && mustConfirm) {
            const annotationsForLabel = getAnnotations({ label: annotation.label })
            const confirmRemove = await alert.present({
                color: 'warning',
                message: `You are about to remove ${ annotationsForLabel.length } annotations using "${ annotation.label }" label. Are you sure?`,
                buttons: [
                    { type: 'Cancel' },
                    {
                        type: 'Confirm',
                        confirmData: true,
                        text: `Remove "${ annotation.label }" annotations`,
                    },
                ],
            })
            if (confirmRemove) {
                for (const a of annotationsForLabel) actualRemove(a)
                dispatch(blur())
            }
        } else {
            actualRemove(annotation)
            const weak = allAnnotations.find(a => a.type === AnnotationType.Weak && a.label === annotation.label && a.id !== annotation.id);
            if (weak && focusWeak && annotation.annotator === user.id) dispatch(focusAnnotation(weak))
            else dispatch(blur())
        }
    }, [ phaseType, allAnnotations, actualRemove, alert, getAnnotations, user, dispatch ])

    return useCallback((annotation: Annotation) => remove(annotation), [ remove ])
}

export const useUpdateAnnotationFeatures = () => {
    const dispatch = useAppDispatch();

    return useCallback((annotation: Annotation, update: Partial<Annotation['acousticFeatures']>) => {
        if (annotation.type === AnnotationType.Weak) return;
        const acousticFeatures = {
            ...(annotation.acousticFeatures ?? {}),
            ...update,
        }
        annotation = dispatch(updateAnnotation({ id: annotation.id, acousticFeatures })).payload as Annotation
        dispatch(focusAnnotation(annotation))
    }, [ dispatch ])
}

