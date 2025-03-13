import React, { ReactNode } from "react";
import './form-bloc.component.css';

interface Props {
  label?: string;
  className?: string;
  children: ReactNode
}

export const FormBloc: React.FC<Props> = ({ label, children, className }) => (
  <div id="form-bloc" className={className}>
    { label && <div id="separator">
        <div></div>
      { label }
        <div></div>
    </div> }

    { children }
  </div>
)
