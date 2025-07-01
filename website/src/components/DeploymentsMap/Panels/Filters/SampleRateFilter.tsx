import React, {
  ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { RangeSlider } from "../../../Inputs/RangeSlider";
import { FilterRef } from "./FilterRef";
import { Deployment } from "../../../../pages/Projects/ProjectDetail/ProjectDetail";

export const SampleRateFilter = React.forwardRef<FilterRef, {
  deployments: Array<Deployment>,
  onUpdates: () => void;
}>(({ deployments, onUpdates }, ref) => {
  const minInput = useRef<HTMLInputElement | null>(null);
  const maxInput = useRef<HTMLInputElement | null>(null);

  const greatestSampleRate: number = useMemo(() => {
    const sampleRates = deployments.flatMap(d => d.channelConfigurations.edges.map(e => e?.node?.recorderSpecification?.samplingFrequency)).filter(f => f !== undefined) as number[];
    return Math.max(...sampleRates)
  }, [ deployments ]);

  const percentToSampleRate = useCallback((value: number): number => {
    return Math.trunc(Math.max(0, Math.min(100, value)) / 100 * greatestSampleRate);
  }, [ greatestSampleRate ])

  const sampleRateToPercent = useCallback((value: number): number => {
    return Math.max(0, Math.min(100, value * 100 / greatestSampleRate))
  }, [ greatestSampleRate ])

  const [ minSampleRate, setMinSampleRate ] = useState<number>(0);
  const [ maxSampleRate, setMaxSampleRate ] = useState<number>(0);
  useEffect(() => {
    setMaxSampleRate(greatestSampleRate)
  }, [ greatestSampleRate ])

  const minSampleRatePercent = useMemo(() => sampleRateToPercent(minSampleRate), [ minSampleRate, sampleRateToPercent ]);
  const setMinSampleRatePercent = useCallback((percent: number) => {
    setMinSampleRate(percentToSampleRate(percent))
  }, [ percentToSampleRate ])
  useEffect(() => {
    if (minInput.current) minInput.current.value = minSampleRate.toString();
    if (maxInput.current) maxInput.current.min = minSampleRate.toString();
    onUpdates()
  }, [ minSampleRate ])
  const inputSetMinSampleRate = useCallback((_: ChangeEvent) => {
    const value: string | undefined = minInput.current?.value;
    if (!value) setMinSampleRate(0);
    else setMinSampleRate(Math.min(maxSampleRate, Math.max(0, +value)));
  }, [ maxSampleRate ])

  const maxSampleRatePercent = useMemo(() => sampleRateToPercent(maxSampleRate), [ maxSampleRate, sampleRateToPercent ]);
  const setMaxSampleRatePercent = useCallback((percent: number) => {
    setMaxSampleRate(percentToSampleRate(percent))
  }, [ percentToSampleRate ])
  useEffect(() => {
    if (maxInput.current) maxInput.current.value = maxSampleRate.toString();
    if (minInput.current) minInput.current.max = maxSampleRate.toString();
    onUpdates()
  }, [ maxSampleRate ])
  const inputSetMaxSampleRate = useCallback((_: ChangeEvent) => {
    const value: string | undefined = maxInput.current?.value;
    if (!value) setMaxSampleRate(0);
    else setMaxSampleRate(Math.max(minSampleRate, Math.min(greatestSampleRate, +value)));
  }, [ greatestSampleRate, minSampleRate ])

  const forwardedRef = useMemo(() => ({
    filterDeployment: (d: Deployment) => {
      return !!d.channelConfigurations.edges
        .map(e => e?.node?.recorderSpecification?.samplingFrequency)
        .filter(f => f !== undefined)
        .find(f => minSampleRate <= f! && maxSampleRate >= f!);
    },
    reset: () => {
      setMinSampleRate(0);
      setMaxSampleRate(greatestSampleRate);
    },
    isFiltering: minSampleRate !== 0 || maxSampleRate !== greatestSampleRate,
  }), [ greatestSampleRate, maxSampleRate, minSampleRate ])

  useImperativeHandle(ref, () => forwardedRef)

  return <Fragment>
    <small>Sample rate:</small>
    <RangeSlider min={ minSampleRatePercent } setMin={ setMinSampleRatePercent }
                 max={ maxSampleRatePercent } setMax={ setMaxSampleRatePercent }>
      <span>
        <input type="number" ref={ minInput }
               style={ { width: '5rem', marginRight: '0.21rem' } }
               placeholder="0" min={ 0 }
               onChange={ inputSetMinSampleRate }/>Hz
      </span>
      <span>
        <input type="number" ref={ maxInput }
               style={ { width: '5rem', marginRight: '0.2rem' } }
               placeholder={ greatestSampleRate.toString() } max={ greatestSampleRate }
               onChange={ inputSetMaxSampleRate }/>Hz
      </span>
    </RangeSlider>
  </Fragment>
})