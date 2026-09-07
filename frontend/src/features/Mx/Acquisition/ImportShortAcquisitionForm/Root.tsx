import React, {
    createContext,
    type Dispatch,
    Fragment,
    type HTMLProps,
    type MutableRefObject,
    type SetStateAction,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Button,
    ButtonGroup,
    Form,
    type InputFileRef,
    Note,
    Spinner,
    SpreadsheetFormData,
    type SpreadsheetHandler,
    Toast,
    useSpreadsheetHandler,
} from '@/components/base';
import { type ContactInput, ContactTypeEnum, type VisualObservationInput } from '@/api/types.gql-generated';
import { useMutation } from '@tanstack/react-query';
import * as API from '../api';
import { type Key, KEYS, useFormatKey } from './keys'
import { Alert } from '@/components/base/Alert';
import { getErrorMessage } from '@/service/function';

type Data = { [key in Key]?: string; }

type ImportShortAcquisitionContext = {
    inputFileRef: MutableRefObject<InputFileRef | null>;
    hasRecorderSpecification: boolean, setHasRecorderSpecification: Dispatch<SetStateAction<boolean>>,
    hasDetectorSpecification: boolean, setHasDetectorSpecification: Dispatch<SetStateAction<boolean>>,
    onFileChange: (file: File) => void,
    isReadingFile: boolean,

    getContactTypeForRaw: (raw: string) => ContactTypeEnum | undefined,
    setContactTypeForRaw: (raw: string, type: ContactTypeEnum) => void,

    onReset: () => void,

    setVisualObservationIndex: (raw: string, index: number) => void,
    getVisualObservationIndex: (raw: string, key: Key) => number | null,
} & Omit<SpreadsheetHandler<Data, Key>, 'reset'>

const ImportShortAcquisitionContext = createContext<ImportShortAcquisitionContext>({
    inputFileRef: { current: null },
    hasRecorderSpecification: false, setHasRecorderSpecification: () => null,
    hasDetectorSpecification: false, setHasDetectorSpecification: () => null,
    onFileChange: () => null,
    isReadingFile: false,

    onReset: () => null,
    rows: null,
    loadFile: async () => ({ rows: [], headers: [] }),
    getDefaultValue: () => undefined,
    setDefaultValue: () => undefined,

    getContactTypeForRaw: () => undefined,
    setContactTypeForRaw: () => undefined,
    getVisualObservationIndex: () => null,
    setVisualObservationIndex: () => null,

    header: {
        allRaws: [],
        unselectRaw: () => null,
        selectRaw: () => null,
        selectRaws: () => null,
        availableRaws: [],
        selectedRaws: [],
        selectedKeys: [],
        availableKeys: [],
        getKeyForRaw: () => undefined,
        setKeyForRaw: () => null,
        mapRawToKey: new Map(),
    },
})

export const useImportShortAcquisitionContext = () => {
    const context = useContext(ImportShortAcquisitionContext);
    if (!context) {
        throw new Error('useImportShortAcquisitionContext must be used within a Root');
    }
    return context;
}

export const Root: React.FC<Pick<HTMLProps<HTMLDivElement>, 'children'>> = ({ children }) => {
    const toastManager = Toast.useToastManager()
    const alertManager = Alert.useManager()
    const formatKey = useFormatKey()
    const inputFileRef = useRef<InputFileRef | null>(null);
    const [ hasRecorderSpecification, setHasRecorderSpecification ] = useState(false);
    const [ hasDetectorSpecification, setHasDetectorSpecification ] = useState(false);
    const [ visualObservationIndex, _setVisualObservationIndex ] = useState<Map<string, number>>(new Map());
    const [ contactTypeForRaw, _setContactTypeForRaw ] = useState<Map<string, ContactTypeEnum>>(new Map());
    const [ isReadingFile, setIsReadingFile ] = useState<boolean>(false);

    const allHeaders = useMemo(() => {
        const headers = [ ...KEYS.allForBase ]
        if (hasRecorderSpecification) headers.push(...KEYS.allForRecording)
        if (hasDetectorSpecification) headers.push(...KEYS.allForDetection)
        return headers
    }, [ hasRecorderSpecification, hasDetectorSpecification ]);

    const spreadsheetHandler = useSpreadsheetHandler<Data, Key>(allHeaders, KEYS.multiple)

    const onFileChange = useCallback(async (file: File) => {
        setIsReadingFile(true)
        try {
            await spreadsheetHandler.loadFile(file)
        } catch (error) {
            toastManager.addError({ title: 'Fail reading file', error })
            spreadsheetHandler.reset()
            inputFileRef.current?.reset()
        } finally {
            setIsReadingFile(false)
        }
    }, [ toastManager, spreadsheetHandler ])

    const onReset = useCallback(() => {
        spreadsheetHandler.reset()
    }, [ spreadsheetHandler ])

    const onResetForm = useCallback(() => {
        spreadsheetHandler.reset()
        inputFileRef.current?.reset()
    }, [ spreadsheetHandler ])

    const { mutateAsync, isPending } = useMutation(API.importShortAcquisitions)

    const submit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const sheetFormData = new SpreadsheetFormData<Key | `${ Key }-${ number }`>(event.currentTarget);
        if (!spreadsheetHandler.rows) return;

        // Confirmation
        const shouldContinue = await alertManager.present({
            message: 'Make sure all you cells are mapped with actual data before submitting.',
            buttons: [ {
                text: 'Cancel',
                type: 'Cancel',
            }, {
                text: 'Submit form',
                type: 'Confirm',
                confirmData: true,
            } ],
        })
        if (!shouldContinue) return;

        // Check missing columns
        const keys = spreadsheetHandler.header.selectedKeys
        const missingRequiredKeys = KEYS.required.filter((key) => !keys.includes(key))
        if (hasDetectorSpecification) {
            missingRequiredKeys.push(...KEYS.detectionRequired.filter(key => !keys.includes(key)))
        }
        if (hasRecorderSpecification) {
            missingRequiredKeys.push(...KEYS.recordingRequired.filter(key => !keys.includes(key)))
            if (!keys.includes('recorderSpec-recorderAndHydrophone')
                && !keys.includes('recorderSpec-hydrophone')
                && !keys.includes('recorderSpec-recorder')) {
                missingRequiredKeys.push('recorderSpec-recorder', 'recorderSpec-hydrophone')
            }
        }
        if (missingRequiredKeys.length > 0) {
            toastManager.add({
                type: 'danger',
                title: 'Required fields missing',
                description: <Fragment>
                    The following fields are missing:
                    <ul>
                        { missingRequiredKeys.map(key => <li key={ key } children={ formatKey(key) }/>) }
                    </ul>
                </Fragment>,
                timeout: 0,
            })
            return;
        }

        // Actual send
        const inputData = spreadsheetHandler.rows.map((_row, index) => {
            const contactTypes = formData.getAll(`contacts-contactType`) as string[];
            const roles = formData.getAll(`contacts-role`) as string[];
            const contactIds = sheetFormData.getAll(`${ index }-contacts-contactId`);
            const contacts = Array.from(new Array(contactIds.length)).map((_, index) => ({
                role: roles[index],
                contactId: contactIds[index],
                contactType: contactTypes[index],
            } as ContactInput))

            const recordStartDate = sheetFormData.getUTCDate(`${ index }-recordStartDate`);
            const recordEndDate = sheetFormData.getUTCDate(`${ index }-recordEndDate`);

            const visualObsIndexes = [ ...new Set(visualObservationIndex.values()) ]

            const visualObservations = visualObsIndexes.map((obsIndex) => {
                const source = sheetFormData.get(`${ index }-visualObservations-source-${ obsIndex }`)
                if (!source) return null
                return {
                    source,
                    // Specific to source
                    startDatetime: (sheetFormData.getUTCDate(`${ index }-visualObservations-startDatetime-${ obsIndex }`) ?? recordStartDate)!,
                    endDatetime: (sheetFormData.getUTCDate(`${ index }-visualObservations-endDatetime-${ obsIndex }`) ?? recordEndDate)!,
                    countMin: sheetFormData.getNumber(`${ index }-visualObservations-countMin-${ obsIndex }`),
                    countMax: sheetFormData.getNumber(`${ index }-visualObservations-countMax-${ obsIndex }`),
                    startDistanceMin: sheetFormData.getNumber(`${ index }-visualObservations-startDistanceMin-${ obsIndex }`),
                    startDistanceMax: sheetFormData.getNumber(`${ index }-visualObservations-startDistanceMax-${ obsIndex }`),
                    endDistanceMin: sheetFormData.getNumber(`${ index }-visualObservations-endDistanceMin-${ obsIndex }`),
                    endDistanceMax: sheetFormData.getNumber(`${ index }-visualObservations-endDistanceMax-${ obsIndex }`),
                    behaviors: sheetFormData.getAll(`${ index }-visualObservations-behaviors-${ obsIndex }`),
                    reactionsToBoat: sheetFormData.getAll(`${ index }-visualObservations-reactionsToBoat-${ obsIndex }`),
                    youngPresence: sheetFormData.getBoolean(`${ index }-visualObservations-youngPresence-${ obsIndex }`),
                    // Specific to source & global to all observations
                    additionalInformation: sheetFormData.getAllJoined(
                        `${ index }-visualObservations-additionalInformation`,
                        `${ index }-visualObservations-additionalInformation-${ obsIndex }`,
                    ),
                    // Global to all observations
                    otherHumanActivityPresence: sheetFormData.getBoolean(`${ index }-visualObservations-otherHumanActivityPresence`),
                } satisfies VisualObservationInput
            }).filter(info => info !== null)
            return {
                continuous: sheetFormData.getBoolean(`${ index }-continuous`),
                dutyCycleOff: sheetFormData.getNumber(`${ index }-dutyCycleOff`),
                dutyCycleOn: sheetFormData.getNumber(`${ index }-dutyCycleOn`),
                instrumentDepth: sheetFormData.getNumber(`${ index }-instrumentDepth`),
                extraInformation: sheetFormData.getAllJoined(`${ index }-extraInformation`),
                isLost: sheetFormData.getBoolean(`${ index }-isLost`),
                recordStartDate, recordEndDate,
                timezone: sheetFormData.get(`${ index }-timezone`),
                storages: sheetFormData.getAll(`${ index }-storages`),
                deployment: {
                    project: formData.get('project') as string,
                    bathymetricDepth: sheetFormData.getNumber(`${ index }-deployment-bathymetricDepth`),
                    campaign: sheetFormData.get(`${ index }-deployment-campaign`),
                    site: sheetFormData.get(`${ index }-deployment-site`),
                    deploymentDate: sheetFormData.get(`${ index }-deployment-deploymentDate`),
                    deploymentVessel: sheetFormData.get(`${ index }-deployment-deploymentVessel`),
                    recoveryDate: sheetFormData.get(`${ index }-deployment-recoveryDate`),
                    recoveryVessel: sheetFormData.get(`${ index }-deployment-recoveryVessel`),
                    description: sheetFormData.getAllJoined(`${ index }-deployment-description`),
                    name: sheetFormData.get(`${ index }-deployment-name`),
                    platform: sheetFormData.get(`${ index }-deployment-platform`),
                    latitude: sheetFormData.getNumber(`${ index }-deployment-latitude`)!,
                    longitude: sheetFormData.getNumber(`${ index }-deployment-longitude`)!,
                    contacts,
                    visualObservations,
                },
                recorderSpecification: hasRecorderSpecification ? {
                    channelName: sheetFormData.get(`${ index }-recorderSpec-channelName`),
                    gain: sheetFormData.getNumber(`${ index }-recorderSpec-gain`),
                    sampleDepth: sheetFormData.getNumber(`${ index }-recorderSpec-sampleDepth`)!,
                    samplingFrequency: sheetFormData.getNumber(`${ index }-recorderSpec-samplingFrequency`)!,
                    hydrophone: sheetFormData.getAll(`${ index }-recorderSpec-hydrophone`).filter(data => !!data)[0],
                    recorder: sheetFormData.getAll(`${ index }-recorderSpec-recorder`).filter(data => !!data)[0],
                    recordingFormats: sheetFormData.getAll(`${ index }-recorderSpec-recordingFormats`),
                } : undefined,
                detectorSpecification: hasDetectorSpecification ? {
                    configuration: sheetFormData.get(`${ index }-detectorSpec-configuration`),
                    filter: sheetFormData.get(`${ index }-detectorSpec-filter`),
                    detector: sheetFormData.get(`${ index }-detectorSpec-detector`)!,
                    labels: sheetFormData.getAll(`${ index }-detectorSpec-labels`),
                    outputFormats: sheetFormData.getAll(`${ index }-detectorSpec-outputFormats`),
                    maxFrequency: sheetFormData.getNumber(`${ index }-detectorSpec-maxFrequency`),
                    minFrequency: sheetFormData.getNumber(`${ index }-detectorSpec-minFrequency`),
                } : undefined,
            }
        })
        try {
            const data = await mutateAsync(inputData)
            if (data.importShortAcquisition?.ok) {
                toastManager.add({ type: 'success', title: 'Channel configuration import succeed', timeout: 0 })
            } else if (data.importShortAcquisition?.errors && data.importShortAcquisition.errors.length > 0) {
                alertManager.present({
                    color: 'danger',
                    title: 'Channel configuration import failed',
                    message: <Fragment>
                        Following errors occurred:
                        <ul>
                            { data.importShortAcquisition!.errors!
                                .map((error, key) => <li key={ key }>
                                    <Note>{ error?.field }</Note>: { error?.messages.join(' ') }
                                </li>) }
                        </ul>
                    </Fragment>,
                })
            }
        } catch (error) {
            console.debug('catch', error)
            alertManager.present({
                color: 'danger',
                title: 'Channel configuration import failed',
                message: getErrorMessage(error) || 'unknown',
            })
        }
    }, [ mutateAsync, spreadsheetHandler, toastManager, hasRecorderSpecification, hasDetectorSpecification ])

    const getContactTypeForRaw = useCallback((raw: string) => {
        return contactTypeForRaw.get(raw)
    }, [ contactTypeForRaw ])
    const setContactTypeForRaw = useCallback((raw: string, type: ContactTypeEnum) => {
        _setContactTypeForRaw(prev => {
            prev.set(raw, type)
            return new Map(prev)
        })
    }, [ _setContactTypeForRaw ])

    const getVisualObservationIndex = useCallback((raw: string, key: Key) => {
        switch (key) {
            // These fields of visual obs are related to a specific source
            case 'visualObservations-startDistanceMin':
            case 'visualObservations-startDistanceMax':
            case 'visualObservations-endDistanceMin':
            case 'visualObservations-endDistanceMax':
            case 'visualObservations-countMin':
            case 'visualObservations-countMax':
            case 'visualObservations-behaviors':
            case 'visualObservations-reactionsToBoat':
            case 'visualObservations-startDatetime':
            case 'visualObservations-endDatetime':
            case 'visualObservations-source':
            case 'visualObservations-youngPresence':
            case 'visualObservations-additionalInformation':
                return visualObservationIndex.get(raw) ?? null

            // Human activities are shared acros all visual obs of the deployment
            case 'visualObservations-otherHumanActivityPresence':
            default:
                return null
        }
    }, [ spreadsheetHandler, visualObservationIndex ])
    const setVisualObservationIndex = useCallback((raw: string, index: number) => {
        _setVisualObservationIndex(prev => {
            prev.set(raw, index)
            return new Map(prev)
        })
    }, [ _setVisualObservationIndex ])

    return <ImportShortAcquisitionContext.Provider value={ {
        inputFileRef,
        hasDetectorSpecification, setHasDetectorSpecification,
        hasRecorderSpecification, setHasRecorderSpecification,
        isReadingFile, onFileChange,
        onReset,
        getContactTypeForRaw, setContactTypeForRaw,
        getVisualObservationIndex,
        setVisualObservationIndex,
        ...spreadsheetHandler,
    } }>
        <Form center onReset={ onResetForm } onSubmit={ submit }>
            { children }

            <ButtonGroup spaceBetween>
                <Button type="reset">Reset</Button>
                { isPending && <Spinner/> }
                <Button type="submit" color="primary">Submit</Button>
            </ButtonGroup>
        </Form>
    </ImportShortAcquisitionContext.Provider>
}
