import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styles from './ontology.module.scss'
import { Sound } from "./sound/api";
import { Source } from "./source/api";

type Props = NodeProps & { data: Source | Sound; type: any }

export const SourceNode: React.FC<Props> = ({ data, selected }) => {
  return <div className={ [ styles.node, selected ? styles.selected : '' ].join(' ') }>
    <p>{ data.englishName }</p>
    { data.englishName !== 'Root' && <Handle type="target" position={ Position.Left } isConnectable={ !data.parent }/> }
    <Handle type="source" position={ Position.Right }/>
  </div>
}