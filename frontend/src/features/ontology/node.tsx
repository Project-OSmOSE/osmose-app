import React, { useMemo } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styles from './ontology.module.scss'
import { Sound } from "./sound";
import { Source } from "./source";
import { IonNote } from "@ionic/react";
import { useParams } from "react-router-dom";

type Props = NodeProps & { data: Source | Sound; type: any }

export const SourceNode: React.FC<Props> = ({ data }) => {
  const { id } = useParams<{ id?: string }>()

  const selected = useMemo(() => data.id.toString() === id, [ data.id, id ])

  return <div className={ [ styles.node, selected ? styles.selected : '' ].join(' ') }>
    <p>{ data.englishName }</p>
    { data.id !== "-1" && <IonNote>ID: { data.id }</IonNote> }
    { data.englishName !== 'Root' && <Handle type="target" position={ Position.Left } isConnectable={ !data.parent }/> }
    <Handle type="source" position={ Position.Right }/>
  </div>
}