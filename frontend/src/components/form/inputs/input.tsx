import React, { InputHTMLAttributes } from "react";
import { IonIcon, IonNote } from "@ionic/react";
import './inputs.css';

type InputProperties = {
  label?: string;
  startIcon?: string;
  note?: string;
} & InputHTMLAttributes<HTMLInputElement>

export const Input: React.FC<InputProperties> = ({
                                                   label,
                                                   startIcon,
                                                   required,
                                                   disabled,
                                                   note,
                                                   ...inputArgs
                                                 }) => {
  const className = [];
  if (startIcon) className.push('has-start-icon');
  return <div id="aplose-input" aria-disabled={ disabled }>
    { label && <p id="label"
                  className={ required ? 'required' : '' }>
      { label }{ required ? '*' : '' }
    </p> }

    <div id="input">
      { startIcon && <IonIcon id="input-start-icon" icon={ startIcon }/> }
      <input { ...inputArgs }
             required={ required }
             className={ `${ className.join(' ') } ${ inputArgs.className }` }/>
    </div>

    { note && <IonNote>{ note }</IonNote> }
  </div>
}
