import React, { InputHTMLAttributes } from "react";
import './input.css';
import { IonIcon } from "@ionic/react";

export type InputProperties = {
  label?: string;
  startIcon?: string;
} & InputHTMLAttributes<HTMLInputElement>

export const Input: React.FC<InputProperties> = ({
                                                   label,
                                                   startIcon,
                                                   ...inputArgs
                                                 }) => {
  const className = [];
  if (startIcon) className.push('has-start-icon')
  return (
    <div id="aplose-input">
      { label && <p id="label"> { label } </p> }

      <div id="input">
        { startIcon && <IonIcon id="input-start-icon" icon={ startIcon }/> }
        <input { ...inputArgs } className={ className.join(' ') + ' ' + inputArgs.className }/>
      </div>
    </div>
  )
}
