import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import styles from './ontology.module.scss'
import { DetailedSource, SourceAPI } from "./source";
import { DetailedSound, SoundAPI } from "./sound";
import { IonSpinner } from "@ionic/react";
import { Input } from "@/components/form";
import { Label } from "@/components/form/inputs/Label.tsx";
import { useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui";

export const Panel: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const location = useLocation()

  const type = useMemo(() => {
    if (location.pathname.includes('source')) return 'source';
    if (location.pathname.includes('sound')) return 'sound';
  }, [ location ]);

  const {
    data: source,
    isFetching: isFetchingSource
  } = SourceAPI.endpoints.getDetailedSourceByID.useQuery({ id: id ?? '' }, { skip: !id || type !== 'source' });

  const {
    data: sound,
    isFetching: isFetchingSound
  } = SoundAPI.endpoints.getDetailedSoundByID.useQuery({ id: id ?? '' }, { skip: !id || type !== 'sound' });

  const isFetching = useMemo(() => isFetchingSound || isFetchingSource, [ isFetchingSource, isFetchingSound ])

  if (!type) return <Fragment/>
  return <div className={ styles.panel }>
    { isFetching && <IonSpinner/> }
    { !isFetching && source && type === 'source' && <Item data={ source } type='source' key={ source.id }/> }
    { !isFetching && sound && type === 'sound' && <Item data={ sound } type='sound' key={ sound.id }/> }
  </div>
}

const Item: React.FC<{ data: DetailedSource, type: 'source' } | { data: DetailedSound, type: 'sound' }> = ({
                                                                                                             data,
                                                                                                             type
                                                                                                           }) => {
  const [ updateSource ] = SourceAPI.endpoints.updateSource.useMutation()
  const [ updateSound ] = SoundAPI.endpoints.updateSound.useMutation()

  const [ englishName, setEnglishName ] = useState<string>(data.englishName);
  const [ frenchName, setFrenchName ] = useState<string | undefined>(data.frenchName ?? undefined);
  const [ latinName, setLatinName ] = useState<string | undefined>(type === 'source' ? (data.latinName ?? undefined) : undefined);
  const [ codeName, setCodeName ] = useState<string | undefined>(data.codeName ?? undefined);
  const [ taxon, setTaxon ] = useState<string | undefined>(data.taxon ?? undefined);

  useEffect(() => {
    reset()
  }, [ data ]);

  const update = useCallback(() => {
    switch (type) {
      case "source":
        return updateSource({
          id: +data.id,
          englishName,
          latinName,
          frenchName,
          codeName,
          taxon,
        }).unwrap()
      case "sound":
        return updateSound({
          id: +data.id,
          englishName,
          frenchName,
          codeName,
          taxon,
        }).unwrap()
    }
  }, [ updateSource, updateSound, data, englishName, latinName, frenchName, codeName, taxon ])

  const reset = useCallback(() => {
    setEnglishName(data.englishName);
    setFrenchName(data.frenchName ?? undefined);
    if (type === 'source') setLatinName(data.latinName ?? undefined);
    setCodeName(data.codeName ?? undefined);
    setTaxon(data.taxon ?? undefined);
  }, [ data ])

  return <div className={ styles.item }>
    <h5>ID: { data.id }</h5>
    <div>
      <Label required label='English name'/>
      <Input value={ englishName }
             onChange={ e => setEnglishName(e.currentTarget.value) }/>
    </div>
    { type === 'source' && <div>
        <Label required label='Latin name'/>
        <Input value={ latinName }
               onChange={ e => setLatinName(e.currentTarget.value) }/>
    </div> }
    <div>
      <Label required label='French name'/>
      <Input value={ frenchName }
             onChange={ e => setFrenchName(e.currentTarget.value) }/>
    </div>
    <div>
      <Label required label='Code name'/>
      <Input value={ codeName }
             onChange={ e => setCodeName(e.currentTarget.value) }/>
    </div>
    <div>
      <Label required label='Taxon'/>
      <Input value={ taxon }
             onChange={ e => setTaxon(e.currentTarget.value) }/>
    </div>

    <div className={ styles.buttons }>
      <Button color="medium" fill='clear' onClick={ reset }>Reset changes</Button>
      <Button onClick={ update }>Save</Button>
    </div>
  </div>
}