import React, { HTMLProps, ReactNode, useEffect, useMemo, useRef, useState, } from "react";
import { IonAlert, IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { caretDown, caretUp } from "ionicons/icons";
import { Item } from '@/types/item.ts';
import './inputs.css';
import { useClickEvents } from "@/service/events";

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
                                                     disabled,
                                                     className,
                                                     noneFirst = false,
                                                     error,
                                                     isLoading = false,
                                                     ...props
                                                   }) => {
  const click = useClickEvents();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const selectButtonRef = useRef<HTMLButtonElement | null>(null);
  const selectLabelRef = useRef<HTMLParagraphElement | null>(null);
  const iconRef = useRef<HTMLIonIconElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);

  const [ isOpen, setIsOpen ] = useState<boolean>(false);
  const [ hasSelectedItem, setHasSelectedItem ] = useState<boolean>(false);

  useEffect(() => {
    setHasSelectedItem(false)

    click.click.add(blur)
    click.aux.add(blur)
    return () => {
      click.click.remove(blur)
      click.aux.add(blur)
    }
  }, [])

  function blur(event: Event) {
    if (event.target === containerRef.current) return;
    if (event.target === inputRef.current) return;
    if (event.target === selectButtonRef.current) return;
    if (event.target === selectLabelRef.current) return;
    if (event.target === iconRef.current) return;
    if (event.target === optionsRef.current) return;
    setIsOpen(false);
  }

  const getOptions = (): Array<Item> => {
    let values = [ ...parentOptions ];
    if (!required) {
      const none = {
        value: -1,
        label: noneLabel
      }
      if (noneFirst) values = [ none, ...values ]
      else values.push(none)
    }
    return values;
  }

  const buttonLabel = useMemo(() => {
    if (value === undefined || value === -1) {
      if (hasSelectedItem) return noneLabel;
      else return placeholder;
    }
    return getOptions().find(o => o.value === value)?.label ?? placeholder
  }, [ value, parentOptions, required, hasSelectedItem, placeholder ])
  const buttonId = useMemo(() => `button-${ placeholder.toLowerCase().replace(' ', '-') }`, [ placeholder ])

  const parentClasses = [ "select", className ]
  if (label) parentClasses.push("has-label")

  return <div id="aplose-input" className={ [ ...parentClasses, isLoading ? 'loading' : '' ].join(' ') }
              ref={ containerRef } { ...props }
              aria-invalid={ !!error }>
    { label && <div id="label"
                    aria-disabled={ disabled }
                    className={ required ? 'required' : '' }>{ label }{ required && '*' }</div> }

    { isLoading && <IonSpinner/> }

    <div id="input" ref={ inputRef }
         className={ isOpen ? 'open' : '' }>
      <select required={ required }
              className="hide-real-input"
              onChange={ () => {
              } }
              value={ value }>
        <option></option>
        { getOptions().map(o => <option value={ o.value === -1 ? undefined : value }
                                        key={ o.value }>{ o.label }</option>) }
      </select>

      <button id={ buttonId } type="button"
              ref={ selectButtonRef }
              aria-disabled={ disabled }
              disabled={ disabled }
              onClick={ () => !disabled && setIsOpen(!isOpen) }
              className={ !value && !hasSelectedItem ? ' placeholder' : '' }>
        <p ref={ selectLabelRef }>{ buttonLabel }</p>
        <IonIcon ref={ iconRef } icon={ isOpen ? caretUp : caretDown }/>
      </button>

      { optionsContainer === 'popover' && <div id="options" ref={ optionsRef }>
        { getOptions().map(v => <div className="item" onClick={ () => {
          onValueSelected(v.value === -1 ? undefined : v.value)
          setHasSelectedItem(true)
          setIsOpen(false)
        } } key={ v.value }>{ v.label }</div>) }
      </div> }

      { optionsContainer === 'alert' && <IonAlert
          trigger={ buttonId }
          header={ placeholder }
          buttons={ [ 'OK' ] }
          inputs={ getOptions().map(o => ({
            type: 'radio',
            ...o,
            checked: value === o.value
          })) }
          onWillDismiss={ data => {
            const value = data.detail.data?.values
            if (value !== undefined) {
              onValueSelected(value !== -1 ? value : undefined)
              setHasSelectedItem(true)
            }
            setIsOpen(false)
          } }
      ></IonAlert> }
    </div>

    { !!children && <div id="inner-content">{ children }</div> }
    { error && <IonNote color="danger">{ error }</IonNote> }
  </div>
}
