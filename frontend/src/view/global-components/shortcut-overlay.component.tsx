import { FC, ReactNode } from "react";

export const ShortcutOverlay: FC<{ label: string, children: ReactNode }> = ({ label, children }) => (
  <div className="card">
    <h3 className={ `card-header tooltip-header` }>Shortcut</h3>
    <div className="card-body p-1">
      <p>
        <span className="font-italic">
          { children }
        </span>
        { ` : ${ label }` }
        <br/>
      </p>
    </div>
  </div>
)
