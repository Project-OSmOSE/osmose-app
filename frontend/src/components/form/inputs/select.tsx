import React, { HTMLProps, ReactNode, useEffect, useMemo, useRef, useState, } from "react";
import {
  IonButton,
  IonIcon,
  IonNote,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonSpinner,
  RadioGroupChangeEventDetail,
  SearchbarInputEventDetail
} from "@ionic/react";
import { caretDown, caretUp } from "ionicons/icons";
import { Item } from '@/types/item.ts';
import { AUX_CLICK_EVENT, CLICK_EVENT, useEvent } from "@/service/events";
import { createPortal } from "react-dom";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui";
import styles from './inputs.module.scss'
import { IonRadioGroupCustomEvent } from "@ionic/core/dist/types/components";
import { Label } from "@/components/form/inputs/Label.tsx";
import { useSearchedData } from "@/service/ui/search.ts";
import { usePopover } from "@/service/ui/popover.ts";

export type SelectValue = number | string | undefined;

type SelectProperties = {
  label?: string;
  required?: boolean;
  placeholder: string;
  options: Array<Item>;
  optionsContainer: 'popover' | 'alert';
  value?: SelectValue;
  onValueSelected: (value: number | string | undefined) => void;
  children?: ReactNode,
  noneLabel?: string;
  noneFirst?: boolean;
  error?: string;
  isLoading?: boolean;
} & Omit<HTMLProps<HTMLDivElement>, 'id' | 'ref'>

export const Select: React.FC<SelectProperties> = ({
                                                     label,
                                                     placeholder,
                                                     required = false,
                                                     options: parentOptions,
                                                     value,
                                                     onValueSelected,
                                                     optionsContainer,
                                                     children,
                                                     noneLabel = 'None',
                                                     disabled = false,
                                                     className,
                                                     noneFirst = false,
                                                     error,
                                                     isLoading = false,
                                                     ...props
                                                   }) => {
  const { containerRef, top, right } = usePopover();

  const inputRef = useRef<HTMLDivElement | null>(null);
  const selectButtonRef = useRef<HTMLButtonElement | null>(null);
  const selectLabelRef = useRef<HTMLParagraphElement | null>(null);
  const selectImgRef = useRef<HTMLImageElement | null>(null);
  const iconRef = useRef<HTMLIonIconElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);

  const [ isOpen, setIsOpen ] = useState<boolean>(false);
  const [ hasSelectedItem, setHasSelectedItem ] = useState<boolean>(false);

  useEvent(CLICK_EVENT, blur);
  useEvent(AUX_CLICK_EVENT, blur);

  useEffect(() => {
    setHasSelectedItem(false)
  }, [])

  function blur(event: Event) {
    if (event.target === containerRef.current) return;
    if (event.target === inputRef.current) return;
    if (event.target === selectButtonRef.current) return;
    if (event.target === selectLabelRef.current) return;
    if (event.target === selectImgRef.current) return;
    if (event.target === iconRef.current) return;
    if (event.target === optionsRef.current) return;
    setIsOpen(false);
  }

  const getOptions = (): Array<Item> => {
    let values = [ ...parentOptions ];
    if (!required) {
      const none = {
        value: -9,
        label: noneLabel
      }
      if (noneFirst) values = [ none, ...values ]
      else values.push(none)
    }
    return values;
  }

  const buttonItem: Item = useMemo(() => {
    if (value === undefined || value === -9) {
      if (hasSelectedItem) return { value: -9, label: noneLabel };
      else return { value: -9, label: placeholder };
    }
    return getOptions().find(o => o.value === value) ?? { value: -9, label: placeholder }
  }, [ value, parentOptions, required, hasSelectedItem, placeholder ])
  const buttonId = useMemo(() => `button-${ placeholder.toLowerCase().replace(' ', '-') }`, [ placeholder ])

  const parentClasses = [ styles.select, className ]
  if (label) parentClasses.push(styles.hasLabel)

  return <div id="aplose-input"
              className={ [ styles.default, ...parentClasses, isLoading ? styles.loading : '' ].join(' ') }
              ref={ containerRef } { ...props }
              aria-invalid={ !!error }>
    <Label required={ required } label={ label }/>

    { isLoading && <IonSpinner/> }

    <div className={ [ styles.input, isOpen ? styles.open : '' ].join(' ') }
         ref={ inputRef }>
      <select required={ required }
              className={ styles.realInput }
              onChange={ () => {
              } }
              value={ value }>
        <option></option>
        { getOptions().map(o => <option value={ o.value === -9 ? undefined : value }
                                        key={ o.value }>{ o.label }</option>) }
      </select>

      <button id={ buttonId } type="button"
              ref={ selectButtonRef }
              aria-disabled={ disabled }
              disabled={ disabled }
              onClick={ () => !disabled && setIsOpen(!isOpen) }
              className={ !value && !hasSelectedItem ? styles.placeholder : '' }
              title={ buttonItem.label }>
        <p ref={ selectLabelRef }>{ buttonItem.img ?
          <img ref={ selectImgRef } src={ buttonItem.img } alt={ buttonItem.label }/> : buttonItem.label }</p>
        <IonIcon ref={ iconRef } icon={ isOpen ? caretUp : caretDown }/>
      </button>

      { optionsContainer === 'popover' && isOpen && createPortal(<div id="options"
                                                                      className={ styles.options }
                                                                      style={ { top: top + 8, right } }
                                                                      ref={ optionsRef }>
        { getOptions().map(v => <div className={ styles.item } onClick={ () => {
          onValueSelected(v.value === -9 ? undefined : v.value)
          setHasSelectedItem(true)
          setIsOpen(false)
        } } key={ v.value }>{ v.img && <img src={ v.img } alt={ v.label }/> } { v.label }</div>) }
      </div>, document.body) }

      { optionsContainer === 'alert' && isOpen &&
          <SelectModal header={ placeholder } options={ getOptions() } onClose={ option => {
            if (option !== undefined) {
              onValueSelected(option.value !== 9 ? option.value : undefined)
              setHasSelectedItem(true)
            }
            setIsOpen(false)
          } }/> }
    </div>

    { !!children && <div className={ styles.inner }>{ children }</div> }
    { error && <IonNote color="danger">{ error }</IonNote> }
  </div>
}

const SelectModal: React.FC<{
  header: string;
  options: Item[];
  onClose: (value?: Item) => void;
}> = ({ header, onClose, options }) => {
  const [ selected, setSelected ] = useState<Item | undefined>();
  const [ search, setSearch ] = useState<string | undefined>();

  const searchbar = useRef<HTMLIonSearchbarElement | null>(null)

  useEffect(() => {
    searchbar.current?.getInputElement().then(input => input.focus())
  }, [ searchbar.current ]);

  const searchedOptions = useSearchedData({
    items: options,
    search,
    fields: [ 'label' ]
  })

  function onSearchUpdated(event: CustomEvent<SearchbarInputEventDetail>) {
    setSearch(event.detail.value ?? undefined);
  }

  function onSearchCleared() {
    setSearch(undefined);
  }

  function onSelect(event: IonRadioGroupCustomEvent<RadioGroupChangeEventDetail>) {
    setSelected(options.find(o => o.value === (event.detail.value ?? undefined)))
  }

  return createPortal(<Modal className={ styles.selectAlert }>
    <ModalHeader title={ header } onClose={ onClose }/>

    <IonSearchbar ref={ searchbar } onIonInput={ onSearchUpdated } onIonClear={ onSearchCleared }/>

    <IonRadioGroup className={ styles.radioGroup }
                   value={ selected?.value }
                   onIonChange={ onSelect }>
      { searchedOptions.map((option, i) => (
        <IonRadio key={ i }
                  value={ option.value }
                  labelPlacement='end'>
          { option.label }
        </IonRadio>
      )) }
    </IonRadioGroup>

    <ModalFooter>
      <IonButton fill='clear' color='medium' onClick={ () => onClose() }>Cancel</IonButton>
      <IonButton fill='clear' onClick={ () => onClose(selected) }>Ok</IonButton>
    </ModalFooter>
  </Modal>, document.body)
}
