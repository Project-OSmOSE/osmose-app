import React, { type FormEvent, Fragment, useCallback, useState } from 'react';
import { AnnotationPhaseType } from '@/api';
import { ConfidenceComponent } from '@/features/Confidence';
import { LabelComponent } from '@/features/Labels';
import { DetectorComponent } from '@/features/Detector';
import { UserComponent } from '@/features/User';
import { Route } from '@/routes/_authenticated/annotation-campaign/$campaignID/_detailLayout/phase.$phaseType';
import { useLoaderData, useNavigate } from '@tanstack/react-router';
import { Dialog } from '@/components/base/Dialog';
import { Form } from '@/components/base/Form';
import type { AllSpectrogramsFilters } from '@/features/AnnotationSpectrogram';
import type { BaseUIEvent } from '@base-ui/react';
import { Field } from '@/components/base/Field';
import { Toggle } from '@/components/base/Toggle';
import { ButtonGroup } from '@/components/base/Button';
import { cleanGqlList } from '@/api/utils';


export const AnnotationsFilterModal: React.FC = () => {
    const {
        withAnnotations,
        annotationLabel,
        annotationAnnotator,
        annotationDetector,
        annotationConfidence,
        withAcousticFeatures,
    } = Route.useSearch({
        select: ({
                     withAnnotations,
                     annotationLabel,
                     annotationAnnotator,
                     annotationDetector,
                     annotationConfidence,
                     withAcousticFeatures,
                 }) => ({
            withAnnotations,
            annotationLabel,
            annotationAnnotator,
            annotationDetector,
            annotationConfidence,
            withAcousticFeatures,
        }),
    });
    const routeParams = Route.useParams()
    const navigate = useNavigate();
    const { campaign, labels, confidences } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID' })

    const [ tmpWithAnnotations, setTmpWithAnnotations ] = useState<boolean | null>(withAnnotations ?? null);

    const update = useCallback((data: Pick<AllSpectrogramsFilters, 'withAnnotations' | 'withAcousticFeatures' | 'annotationLabel' | 'annotationConfidence' | 'annotationDetector' | 'annotationAnnotator'>) => {
        navigate({
            to: Route.to,
            params: routeParams,
            search: (prev) => ({
                ...prev,
                ...data,
                page: 1,
            }),
            replace: true,
        })
    }, [ navigate, routeParams ])

    const onSubmit = useCallback((event: BaseUIEvent<FormEvent<HTMLFormElement>>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        console.debug([...formData.entries()])
        if (tmpWithAnnotations == true) {
            const withAcousticFeatures = formData.get('withAcousticFeatures') as string || undefined
            update({
                withAnnotations: true,
                withAcousticFeatures: withAcousticFeatures === undefined ? undefined : withAcousticFeatures === 'true',
                annotationLabel: formData.get('annotationLabel') as string,
                annotationConfidence: formData.get('annotationConfidence') as string,
                annotationDetector: formData.get('annotationDetector') as string,
                annotationAnnotator: formData.get('annotationAnnotator') as string,
            })
        } else {
            update({
                withAnnotations: tmpWithAnnotations,
                withAcousticFeatures: undefined,
                annotationLabel: undefined,
                annotationConfidence: undefined,
                annotationDetector: undefined,
                annotationAnnotator: undefined,
            })
        }
    }, [ update, labels, tmpWithAnnotations, confidences ])

    const onReset = useCallback((event: BaseUIEvent<FormEvent<HTMLFormElement>>) => {
        event.preventDefault();
        update({
            withAnnotations: undefined,
            withAcousticFeatures: undefined,
            annotationLabel: undefined,
            annotationConfidence: undefined,
            annotationDetector: undefined,
            annotationAnnotator: undefined,
        })
    }, [ update ])

    return <Dialog.Content>
        <Form onSubmit={ onSubmit } onReset={ onReset }>

            <Field.Root name="withAnnotations" horizontal>
                <Field.Label>With annotations</Field.Label>
                <Toggle.Group defaultValue={ withAnnotations ?? null }
                              onValueChange={ setTmpWithAnnotations }
                              value={ tmpWithAnnotations }>
                    <Toggle.Item color="medium" value={ null }>Unset</Toggle.Item>
                    <Toggle.Item value={ true }>With</Toggle.Item>
                    <Toggle.Item value={ false }>Without</Toggle.Item>
                </Toggle.Group>
            </Field.Root>

            <Field.Root name="annotationLabel" horizontal>
                <Field.Label>Filter by label</Field.Label>
                <LabelComponent.Select items={ labels }
                                       disabled={ tmpWithAnnotations !== true }
                                       defaultValueString={ annotationLabel ?? undefined }/>
            </Field.Root>

            { campaign.confidenceSet && <Field.Root name="annotationConfidence" horizontal>
                <Field.Label>Filter by confidence</Field.Label>
                <ConfidenceComponent.Select items={ confidences }
                                            disabled={ tmpWithAnnotations !== true }
                                            defaultValueString={ annotationConfidence ?? undefined }/>
            </Field.Root> }


            { routeParams.phaseType === AnnotationPhaseType.Verification && <Fragment>

                <Field.Root name="annotationDetector" horizontal>
                    <Field.Label>Filter by detector</Field.Label>
                    <DetectorComponent.Select items={ cleanGqlList(campaign.detectors) }
                                              disabled={ tmpWithAnnotations !== true }
                                              defaultValueString={ annotationDetector ?? undefined }/>
                </Field.Root>

                <Field.Root name="annotationAnnotator" horizontal>
                    <Field.Label>Filter by annotator</Field.Label>
                    <UserComponent.Select items={ cleanGqlList(campaign.annotators) }
                                          disabled={ tmpWithAnnotations !== true }
                                          defaultValueString={ annotationAnnotator ?? undefined }/>
                </Field.Root>

            </Fragment> }

            <Field.Root name="withAcousticFeatures" horizontal>
                <Field.Label>Acoustic features</Field.Label>
                <Toggle.Group defaultValue={ withAcousticFeatures ?? null }
                              disabled={ tmpWithAnnotations !== true }>
                    <Toggle.Item color="medium" value={ null }>Unset</Toggle.Item>
                    <Toggle.Item value={ true }>With</Toggle.Item>
                    <Toggle.Item value={ false }>Without</Toggle.Item>
                </Toggle.Group>
            </Field.Root>

            <ButtonGroup spaceBetween>
                <Dialog.Close type="reset">Reset</Dialog.Close>
                <Dialog.Close type="submit" color="primary">Filter</Dialog.Close>
            </ButtonGroup>
        </Form>
    </Dialog.Content>
}