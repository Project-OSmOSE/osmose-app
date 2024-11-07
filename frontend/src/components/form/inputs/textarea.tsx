import React, { ChangeEvent, InputHTMLAttributes, TextareaHTMLAttributes, useEffect, useRef, useState } from "react";
import { IonNote } from "@ionic/react";
import './inputs.css';

export type TextareaProperties = {
  label?: string;
  error?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export type TextareaValue = InputHTMLAttributes<HTMLTextAreaElement>['value']

export const Textarea: React.FC<TextareaProperties> = ({
                                                         label,
                                                         disabled,
                                                         value: incomingValue,
                                                         error: incomingError,
                                                         required,
                                                         onChange,
                                                         ...textareaArgs
                                                       }) => {
  const [ value, setValue ] = useState<TextareaValue | undefined>();
  const _value = useRef<TextareaValue | undefined>();
  const _setValue = (value: TextareaValue | undefined) => {
    setValue(value);
    _value.current = value;
  }

  const [ error, setError ] = useState<string | undefined>();
  const _error = useRef<string | undefined>();
  const _setError = (error: string | undefined) => {
    setError(error);
    _error.current = error;
  }

  const _onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    _setValue(e.target.value);
    _setError(undefined);
    if (onChange) onChange(e);
  }

  useEffect(() => {
    _setValue(incomingValue);
  }, [ incomingValue ]);

  useEffect(() => {
    _setError(incomingError);
  }, [ incomingError ]);

  return <div id="aplose-input" className="textarea" aria-disabled={ disabled } aria-invalid={ !!error }>
    { label && <p id="label"
                  className={ required ? 'required' : '' }>
      { label }{ required ? '*' : '' }
    </p> }

    <div id="input">
      <textarea { ...textareaArgs }
                value={ value }
                onChange={ _onChange }
                disabled={ disabled }
                required={ required }/>
    </div>
    { error && <IonNote color="danger">{ error }</IonNote> }
  </div>
}