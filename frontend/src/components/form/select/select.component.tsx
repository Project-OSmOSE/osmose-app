import React, { HTMLProps, ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { IonAlert, IonIcon } from "@ionic/react";
import { caretDown, caretUp } from "ionicons/icons";
import { InputRef } from "../interface.tsx";
import './select.component.css';

interface Props {
  label?: string;
  required?: boolean;
  placeholder: string;
  options: Array<Item>;
  optionsContainer: 'popover' | 'alert';
  value?: number | string;
  onValueSelected: (value: number | string | undefined) => void;
  children?: ReactNode,
  noneLabel?: string;
}

interface Item {
  id: number | string;
  label: string;
}

export const Select = React.forwardRef<InputRef, Props & Omit<HTMLProps<HTMLDivElement>, 'id' | 'ref'>>(({
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
                                                                                                           ...props
                                                                                                         }, ref) => {
  const selectRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasSelectedItem, setHasSelectedItem] = useState<boolean>(false);

  useEffect(() => {
    setHasSelectedItem(false)
  }, [])

  const getOptions = (): Array<Item> => {
    const values = [...parentOptions];
    if (!required) values.push({
      id: -1,
      label: noneLabel
    })
    return values;
  }

  const buttonLabel = useMemo(() => {
    if (value === undefined || value === -1) {
      if (hasSelectedItem) return noneLabel;
      else return placeholder;
    }
    return getOptions().find(o => o.id === value)?.label ?? placeholder
  }, [value, parentOptions, required, hasSelectedItem, placeholder])
  const buttonId = useMemo(() => 'button-' + placeholder.toLowerCase().replace(' ', '-'), [placeholder])

  const _ref: InputRef = {
    blur: (e) => {
      const x = e.offsetX;
      const y = e.offsetY;
      if (!selectRef.current || !optionsRef.current) return;
      const select = {
        x: selectRef.current.offsetLeft,
        y: selectRef.current.offsetTop,
        w: selectRef.current.offsetWidth,
        h: selectRef.current.offsetHeight
      }
      const options = {
        x: optionsRef.current.offsetLeft,
        y: optionsRef.current.offsetTop,
        w: optionsRef.current.offsetWidth,
        h: optionsRef.current.offsetHeight
      }
      if (x < (select.x + select.w) && x > select.x &&
        y < (select.y + select.h) && y > select.y) return;
      if (x < (options.x + options.w) && x > options.x &&
        y < (options.y + options.h) && y > options.y) return;
      setIsOpen(false)
    },
    get isValid() {
      if (required) return value !== undefined;
      return true;
    }
  }
  useImperativeHandle(ref, () => _ref);

  return (
    <div id="aplose-select" ref={ selectRef } { ...props }>
      { label && <div id="label" className={ required ? 'required' : '' }>{ label }{ required && '*' }</div> }

      <div id="select"
           aria-disabled={ disabled }
           className={ isOpen ? 'open' : '' }>
        <div id={ buttonId }
             onClick={ () => !disabled && setIsOpen(!isOpen) }
             className={ 'button' + (!value && !hasSelectedItem ? ' placeholder' : '') }>
          <p>{ buttonLabel }</p>
          { !isOpen && <IonIcon icon={ caretDown }/> }
          { isOpen && <IonIcon icon={ caretUp }/> }
        </div>

        { optionsContainer === 'popover' && <div id="options" ref={ optionsRef }>
          { getOptions().map(v => (
            <div className="item" onClick={ () => {
              onValueSelected(v.id === -1 ? undefined : v.id)
              setHasSelectedItem(true)
              setIsOpen(false)
            } } key={ v.id }>{ v.label }</div>
          )) }
        </div> }

        { optionsContainer === 'alert' && <IonAlert
            trigger={ buttonId }
            header={ placeholder }
            buttons={ ['OK'] }
            inputs={ getOptions().map(o => ({ type: 'radio', value: o.id, label: o.label })) }
            onWillDismiss={ data => {
              const value = data.detail.data?.values
              if (value !== undefined) {
                onValueSelected(value >= 0 ? value : undefined)
                setHasSelectedItem(true)
              }
              setIsOpen(false)
            } }
        ></IonAlert> }
      </div>

      { !!children && <div id="inner-content">{ children }</div> }
    </div>
  )
});

