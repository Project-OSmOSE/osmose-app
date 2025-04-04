import React, { TextareaHTMLAttributes } from "react";
import { IonNote } from "@ionic/react";
import { useAppDispatch } from "@/service/app.ts";
import styles from './inputs.module.scss'
import { Label } from "@/components/form/inputs/Label.tsx";
import { EventSlice } from "@/service/events";

export type OldTextareaProperties = {
  label?: string;
  error?: string;
  containerClassName?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>


export const Textarea: React.FC<OldTextareaProperties> = ({
                                                            label,
                                                            disabled,
                                                            value,
                                                            error,
                                                            required,
                                                            containerClassName,
                                                            ...textareaArgs
                                                          }) => {

  const dispatch = useAppDispatch();

  return <div id="aplose-input" className={ [ styles.default, "textarea", containerClassName ].join(' ') }
              aria-disabled={ disabled } aria-invalid={ !!error }>
    <Label required={ required } label={ label }/>

    <div className={ styles.input }>
      <textarea { ...textareaArgs }
                value={ value }
                disabled={ disabled }
                onFocus={ () => dispatch(EventSlice.actions.disableShortcuts()) }
                onBlur={ () => dispatch(EventSlice.actions.enableShortcuts()) }
                required={ required }/>
    </div>
    { error && <IonNote color="danger">{ error }</IonNote> }
  </div>
}
