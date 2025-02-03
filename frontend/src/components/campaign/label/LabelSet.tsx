import React, { FormEvent, Fragment } from "react";
import { LabelSet } from "@/service/campaign/label-set";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { IonCheckbox } from "@ionic/react";

export const LabelSetDisplay: React.FC<{
  set: LabelSet;
  labelsWithAcousticFeatures: string[];
  setLabelsWithAcousticFeatures: (value: string[]) => void
  disabled?: boolean;
}> = ({ set, labelsWithAcousticFeatures, setLabelsWithAcousticFeatures, disabled = false }) => {

  const onLabelChecked = (event: FormEvent<HTMLIonCheckboxElement>, label: string) => {
    event.stopPropagation()
    event.preventDefault()
    if (labelsWithAcousticFeatures.includes(label)) {
      setLabelsWithAcousticFeatures(labelsWithAcousticFeatures.filter(l => l !== label))
    } else {
      setLabelsWithAcousticFeatures([ ...labelsWithAcousticFeatures, label ])
    }
  }

  return <Fragment>
    { set.desc }

    <Table columns={ 2 }>
      <TableHead isFirstColumn={ true }>Label</TableHead>
      <TableHead>Acoustic features</TableHead>
      <TableDivider/>

      { set.labels.map(label => <Fragment key={ label }>
        <TableContent isFirstColumn={ true }>{ label }</TableContent>
        <TableContent>
          <IonCheckbox checked={ labelsWithAcousticFeatures.includes(label) }
                       disabled={ disabled }
                       onClick={ event => onLabelChecked(event, label) }/></TableContent>
        <TableDivider/>
      </Fragment>) }
    </Table>
  </Fragment>
}