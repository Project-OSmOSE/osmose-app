import React, { useCallback, useEffect, useMemo } from "react";
import styles from './ontology.module.scss'
import { Background, Controls, Node, ReactFlow, useOnSelectionChange } from "@xyflow/react";
import { NewNode, NODE_ORIGIN, useOntologyTreeFlow } from "@/features/ontology/flow.hook.ts";
import { Source, SourceAPI } from "./source";
import { Sound, SoundAPI } from "./sound";
import { NODE_TYPES, useGetInitialNodes } from "@/features/ontology/initNodes.hook.ts";
import { Panel } from './panel'
import { useLocation, useNavigate } from "react-router-dom";

type DataType = Omit<Source | Sound, '__typename'>

export const OntologyTab: React.FC = () => {
  const location = useLocation()
  const type: 'source' | 'sound' | undefined = useMemo(() => {
    if (location.pathname.includes('source')) return 'source';
    if (location.pathname.includes('sound')) return 'sound';
  }, [ location ])

  const { data: initialSources } = SourceAPI.endpoints.getAllSources.useQuery({}, { skip: type !== 'source' });
  const [ createSource ] = SourceAPI.endpoints.createSource.useMutation();
  const [ updateSource ] = SourceAPI.endpoints.updateSource.useMutation();
  const [ deleteSource ] = SourceAPI.endpoints.deleteSource.useMutation();

  const { data: initialSounds } = SoundAPI.endpoints.getAllSounds.useQuery({}, { skip: type !== 'sound' });
  const [ createSound ] = SoundAPI.endpoints.createSound.useMutation();
  const [ updateSound ] = SoundAPI.endpoints.updateSound.useMutation();
  const [ deleteSound ] = SoundAPI.endpoints.deleteSound.useMutation();

  const getInitialNodes = useGetInitialNodes(type === 'source' ? initialSources : type === 'sound' ? initialSounds : undefined);
  const navigate = useNavigate()

  const onNewNode = useCallback(async (info: NewNode<DataType>) => {
    const englishName = prompt("Node english name");
    if (!englishName) return;
    if (type === 'source') {
      const data = await createSource({
        englishName,
        parent_id: info.parentNode.data.id !== "-1" ? info.parentNode.data.id.toString() : undefined
      }).unwrap()
      const id = data.postSource?.data?.id
      if (id) navigate(`/admin/ontology/source/${ id }`)
    }
    if (type === 'sound') {
      const data = await createSound({
        englishName,
        parent_id: info.parentNode.data.id !== "-1" ? info.parentNode.data.id.toString() : undefined
      }).unwrap()
      const id = data.postSound?.data?.id
      if (id) navigate(`/admin/ontology/sound/${ id }`)
    }
  }, [ createSource, createSound, type ])

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node<{ id: string }>[] }) => {
    if (nodes.length > 0) navigate(`/admin/ontology/${ type }/${ nodes[0].data.id }`)
    else navigate(`/admin/ontology/${ type }`)
  }, [ type ])
  useOnSelectionChange({ onChange: onSelectionChange })

  const update = useCallback((data: DataType) => {
    if (type === 'source') updateSource({ ...data, id: +data.id, parent_id: data.parent?.id ?? null })
    if (type === 'sound') updateSound({ ...data, id: +data.id, parent_id: data.parent?.id ?? null })
  }, [ updateSource, updateSound ])

  const {
    nodes,
    setNodes,
    onNodesChange,
    onNodesDelete,
    edges,
    setEdges,
    onEdgesChange,
    onEdgesDelete,
    onConnect,
    onConnectEnd
  } = useOntologyTreeFlow<DataType>({
    onNew: onNewNode,
    patch: update,
    del: type === 'source' ? deleteSource : type === 'sound' ? deleteSound : () => {
    }
  })

  useEffect(() => {
    const { nodes, edges } = getInitialNodes()
    setNodes(nodes)
    setEdges(edges)
  }, [ initialSources, initialSounds, type ]);


  return <div className={ styles.tabContent }>
    <ReactFlow nodes={ nodes }
               nodeTypes={ NODE_TYPES }
               edges={ edges }
               onNodesChange={ onNodesChange }
               onNodesDelete={ onNodesDelete }
               onEdgesChange={ onEdgesChange }
               onEdgesDelete={ onEdgesDelete }
               onConnect={ onConnect }
               onConnectEnd={ onConnectEnd }
               fitView
               fitViewOptions={ { padding: 2 } }
               selectionKeyCode={ null }
               multiSelectionKeyCode={ null }
               nodeOrigin={ NODE_ORIGIN }>
      <Background/>
      <Controls showInteractive={ false }/>
    </ReactFlow>

    <Panel/>
  </div>
}