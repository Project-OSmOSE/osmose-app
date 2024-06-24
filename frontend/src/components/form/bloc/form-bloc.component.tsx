import React, { ReactNode } from "react";
import './form-bloc.component.css';

interface Props {
  label?: string;
  children: ReactNode
}

export const FormBloc: React.FC<Props> = ({ label, children }) => (
  <div id="form-bloc">
    { label && <div id="separator">
        <div></div>
      { label }
        <div></div>
    </div> }

    { children }
  </div>
)
