import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styles from './source.module.scss'
import { Source } from "./api";

type Props = NodeProps & { data: Source; type: any }
export const SourceNode: React.FC<Props> = ({ data, selected }) => {
  return <div className={ [ styles.node, selected ? styles.selected : '' ].join(' ') }>
    <p>{ data.englishName }</p>
    { data.englishName !== 'Root' && <Handle type="target" position={ Position.Left } isConnectable={ !data.parent }/> }
    <Handle type="source" position={ Position.Right }/>
  </div>
}