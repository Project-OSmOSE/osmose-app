import React from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { closeCircle } from "ionicons/icons";
import { Item } from "@/types/item.ts";
import './inputs.css';

type ChipsProperties = {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  items: Array<Item>;
  activeItemsValues: Array<number | string>;
  setActiveItemsValues: (value: Array<number | string>) => void;
}

export const ChipsInput: React.FC<ChipsProperties> = ({
                                                        label,
                                                        required,
                                                        disabled,
                                                        items,
                                                        activeItemsValues,
                                                        setActiveItemsValues
                                                      }) => {

  const deactivateChip = (chip: Item) => setActiveItemsValues(activeItemsValues.filter(v => v !== chip.value))
  const activateChip = (chip: Item) => setActiveItemsValues([...activeItemsValues, chip.value])

  return <div id="aplose-input" className="chips" aria-disabled={ disabled }>
    { label && <p id="label"
                  className={ required ? 'required' : '' }>
      { label }{ required ? '*' : '' }
    </p> }

    <div id="input">
      <input required={ required }
             className="hide-real-input"
             value={ activeItemsValues.join('') }
             onChange={ () => {
             } }/>

      { items.map(c => {
        const isActive = activeItemsValues.includes(c.value);
        return <IonChip key={ c.value }
                 color="secondary"
                 outline={ !isActive }
                 onClick={ () => {
                   if (isActive) deactivateChip(c)
                   else activateChip(c)
                 } }>
          { c.label }
          { isActive && <IonIcon icon={ closeCircle }/> }
        </IonChip>
      }) }
    </div>
  </div>
}
