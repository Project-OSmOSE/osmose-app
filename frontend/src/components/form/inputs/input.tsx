import React, { InputHTMLAttributes } from "react";
import { IonIcon, IonNote } from "@ionic/react";
import './inputs.css';


type InputProperties = {
  label?: string;
  startIcon?: string;
  note?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>
export const Input: React.FC<InputProperties> = ({
                                                   label,
                                                   startIcon,
                                                   required,
                                                   disabled,
                                                   note,
                                                   error,
                                                   value,
                                                   ...inputArgs
                                                 }) => {

  const className = [];
  if (startIcon) className.push('has-start-icon');
  return <div id="aplose-input" aria-disabled={ disabled } aria-invalid={ !!error }>
    { label && <label id="label"
                      className={ required ? 'required' : '' }>
      { label }{ required ? '*' : '' }
    </label> }

    <div id="input">
      { startIcon && <IonIcon id="input-start-icon" icon={ startIcon }/> }
      <input { ...inputArgs }
             value={ value }
             required={ required }
             disabled={ disabled }
             className={ `${ className.join(' ') } ${ inputArgs.className }` }/>
    </div>

    { note && <IonNote>{ note }</IonNote> }
    { error && <IonNote color="danger">{ error }</IonNote> }
  </div>
}
