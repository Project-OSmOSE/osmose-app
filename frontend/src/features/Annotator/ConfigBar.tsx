import React from 'react';
import { AnalysisComponent } from '../SpectrogramAnalysis';
import { useLoaderData } from '@tanstack/react-router';
import { useAnnotatorAnalysis } from '@/features/Annotator/Analysis';
import { ButtonGroup, Note } from '@/components/base';
import { CalendarMinimalistic, Target } from '@solar-icons/react';
import { Zoom } from '@/features/Annotator/Zoom';
import { usePointer } from '@/features/Annotator/Pointer';
import { formatTime } from '@/service/function';
import { ImageSettings } from './ImageSettings';

export const ConfigBar: React.FC = () => {
    const {
        analysis: allAnalysis,
    } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID' })
    const { spectrogram } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType/spectrogram/$spectrogramID' })

    // Spectrogram analysis
    const {
        selectedAnalysis, setSelectedAnalysis,
    } = useAnnotatorAnalysis()

    // Pointer
    const pointer = usePointer()

    return <ButtonGroup spaceBetween>

        <ButtonGroup>
            <AnalysisComponent.Select items={ allAnalysis }
                                      value={ selectedAnalysis }
                                      onValueChange={ setSelectedAnalysis }/>

            <ImageSettings.ColormapButtons/>
            <ImageSettings.ImageTuningButtons/>

            <Zoom.Buttons/>

            <ImageSettings.UpdateSpinner/>
        </ButtonGroup>

        { pointer.position && <ButtonGroup>
            <Note color="medium" flex><Target weight="BoldDuotone" size={ 16 }/></Note>
            <Note data color="dark">{ pointer.position.frequency.toFixed(2) }Hz
                / { formatTime(pointer.position.time, (spectrogram?.duration ?? 0) < 60) }</Note>
        </ButtonGroup> }

        <ButtonGroup>
            <Note color="medium" flex><CalendarMinimalistic weight="BoldDuotone" size={ 16 }/></Note>
            <Note color="dark">{ new Date(spectrogram.start).toUTCString() }</Note>
        </ButtonGroup>

    </ButtonGroup>
}