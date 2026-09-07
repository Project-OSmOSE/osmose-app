import type {
    ChannelConfigurationDetectorSpecificationInput,
    ChannelConfigurationInput,
    ChannelConfigurationRecorderSpecificationInput,
    ContactInput,
    DeploymentInput,
    VisualObservationInput,
} from '@/api/types.gql-generated';
import { useCallback } from 'react';

export type Key = keyof ChannelConfigurationInput
    | `deployment-${ keyof DeploymentInput }`
    | `visualObservations-${ keyof VisualObservationInput }`
    // | `visualObservations-${ keyof VisualObservationInput }-${ number }`
    | `contacts-${ keyof ContactInput }`
    | `detectorSpec-${ keyof ChannelConfigurationDetectorSpecificationInput }`
    | `recorderSpec-${ keyof ChannelConfigurationRecorderSpecificationInput }`
    | 'recorderSpec-recorderAndHydrophone';

type KeyType =
    'required'
    | 'multiple'
    | 'allForBase'
    | 'allForRecording'
    | 'allForDetection'
    | 'recordingRequired'
    | 'detectionRequired'
export const KEYS: Record<KeyType, Key[]> = {
    required: [
        'deployment-latitude',
        'deployment-longitude',
    ],
    multiple: [
        'contacts-contactType',
        'contacts-contactId',
        'contacts-role',
        'storages',
        'recorderSpec-recordingFormats',
        'detectorSpec-outputFormats',
        'detectorSpec-labels',
        'deployment-description',
        'extraInformation',
        'visualObservations-additionalInformation',
        'visualObservations-countMax',
        'visualObservations-countMin',
        'visualObservations-startDatetime',
        'visualObservations-endDatetime',
        'visualObservations-startDistanceMin',
        'visualObservations-startDistanceMax',
        'visualObservations-endDistanceMin',
        'visualObservations-endDistanceMax',
        'visualObservations-youngPresence',
        'visualObservations-otherHumanActivityPresence',
        'visualObservations-behaviors',
        'visualObservations-reactionsToBoat',
        'visualObservations-source',
    ],
    allForBase: [
        'continuous',
        'dutyCycleOff',
        'dutyCycleOn',
        'extraInformation',
        'instrumentDepth',
        'isLost',
        'recordEndDate',
        'recordStartDate',
        'storages',
        'timezone',
        'deployment-bathymetricDepth',
        'deployment-campaign',
        'deployment-deploymentDate',
        'deployment-deploymentVessel',
        'deployment-description',
        'deployment-latitude',
        'deployment-longitude',
        'deployment-name',
        'deployment-platform',
        'deployment-project',
        'deployment-recoveryDate',
        'deployment-recoveryVessel',
        'deployment-site',
        'visualObservations-additionalInformation',
        'visualObservations-countMax',
        'visualObservations-countMin',
        'visualObservations-startDatetime',
        'visualObservations-endDatetime',
        'visualObservations-startDistanceMin',
        'visualObservations-startDistanceMax',
        'visualObservations-endDistanceMin',
        'visualObservations-endDistanceMax',
        'visualObservations-youngPresence',
        'visualObservations-otherHumanActivityPresence',
        'visualObservations-behaviors',
        'visualObservations-reactionsToBoat',
        'visualObservations-source',
        'contacts-contactId',
    ],
    recordingRequired: [
        'recorderSpec-sampleDepth',
        'recorderSpec-samplingFrequency',
    ],
    allForRecording: [
        'recorderSpec-channelName',
        'recorderSpec-gain',
        'recorderSpec-hydrophone',
        'recorderSpec-recorder',
        'recorderSpec-recorderAndHydrophone',
        'recorderSpec-recordingFormats',
        'recorderSpec-sampleDepth',
        'recorderSpec-samplingFrequency',
    ],
    detectionRequired: [
        'detectorSpec-detector',
    ],
    allForDetection: [
        'detectorSpec-configuration',
        'detectorSpec-detector',
        'detectorSpec-filter',
        'detectorSpec-labels',
        'detectorSpec-maxFrequency',
        'detectorSpec-minFrequency',
        'detectorSpec-outputFormats',
    ],
}

export const useFormatKey = () => useCallback((value: Key) => {
    if (value === 'contacts-contactId') return 'contacts'
    return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replaceAll('-', ': ').toLocaleLowerCase()
}, [])
