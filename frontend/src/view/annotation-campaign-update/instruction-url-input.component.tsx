import { FC } from "react";

export const InstructionUrlInputComponent: FC<{
  instructionURL: string,
  setInstructionURL: (instructionURL: string) => void,
}> = ({instructionURL, setInstructionURL}) => {

  return (
    <div className="form-group">
      <input id="cac-instructions"
             className="form-control"
             type="text"
             value={ instructionURL }
             onChange={ e => setInstructionURL(e.currentTarget.value) }
             placeholder="Campaign instructions URL"/>
    </div>
  )
}
