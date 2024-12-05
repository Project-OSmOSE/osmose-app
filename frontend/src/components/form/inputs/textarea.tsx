import React, { TextareaHTMLAttributes } from "react";
import { IonNote } from "@ionic/react";
import './inputs.css';

export type OldTextareaProperties = {
  label?: string;
  error?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>


export const Textarea: React.FC<OldTextareaProperties> = ({
                                                            label,
                                                            disabled,
                                                            value,
                                                            error,
                                                            required,
                                                            ...textareaArgs
                                                          }) => {
  return <div id="aplose-input" className="textarea" aria-disabled={ disabled } aria-invalid={ !!error }>
    { label && <p id="label"
                  className={ required ? 'required' : '' }>
      { label }{ required ? '*' : '' }
    </p> }

    <div id="input">
      <textarea { ...textareaArgs }
                value={ value }
                disabled={ disabled }
                required={ required }/>
    </div>
    { error && <IonNote color="danger">{ error }</IonNote> }
  </div>
}
