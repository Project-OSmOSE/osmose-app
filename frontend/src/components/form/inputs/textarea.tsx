import React, { TextareaHTMLAttributes } from "react";
import './inputs.css';

export type TextareaProperties = {
  label?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea: React.FC<TextareaProperties> = ({
                                                         label,
                                                         required,
                                                         ...textareaArgs
                                                       }) => (
  <div id="aplose-input" className="textarea">
    { label && <p id="label"
                  className={ required ? 'required' : '' }>
      { label }{ required ? '*' : '' }
    </p> }

    <div id="input">
      <textarea { ...textareaArgs }
                required={ required }/>
    </div>
  </div>
)
