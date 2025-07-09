import React, { useCallback, useEffect } from "react";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import { NewNode, NODE_ORIGIN, useOntologyTreeFlow } from "@/features/ontology/flow.hook.ts";
import { API, Sound } from "./api";
import { NODE_TYPES, useGetInitialNodes } from "@/features/ontology/initNodes.hook.ts";

export const OntologySoundPage: React.FC = () => {
  const { data: initialSounds } = API.endpoints.getAllSounds.useQuery();
  const [ updateParentSound ] = API.endpoints.updateParentSound.useMutation();
  const [ deleteSound ] = API.endpoints.deleteSound.useMutation();
  const getInitialNodes = useGetInitialNodes(initialSounds);

  const onNewNode = useCallback((info: NewNode<Sound>) => {
    const englishName = prompt("Node english name");
    if (!englishName) return;
    updateParentSound({
      englishName,
      parent_id: info.parentNode.data.id !== "-1" ? info.parentNode.data.id.toString() : undefined
    })
  }, [ updateParentSound ])

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
  } = useOntologyTreeFlow<Sound>({
    onNew: onNewNode,
    patch: updateParentSound,
    del: deleteSound
  })

  useEffect(() => {
    return () => {
      API.util.invalidateTags([ 'Sound' ])
    }
  }, [ initialSounds ]);
  useEffect(() => {
    const { nodes, edges } = getInitialNodes()
    setNodes(nodes)
    setEdges(edges)
  }, [ initialSounds ]);


  return <div style={ { height: '100%', width: '100%' } }>
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
               nodeOrigin={ NODE_ORIGIN }>
      <Background/>
      <Controls showInteractive={ false }/>
    </ReactFlow>
  </div>
}