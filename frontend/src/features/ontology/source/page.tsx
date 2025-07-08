import React, { useCallback, useEffect } from "react";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import { SourceNode } from "./node";
import { NewNode, NODE_ORIGIN, useOntologyTreeFlow } from "@/features/ontology/flow.hooks.ts";
import { API, Source } from "./api";
import { useGetInitialNodes } from "@/features/ontology/source/hook.ts";

const NODE_TYPES = { source: SourceNode }

export const OntologySourcePage: React.FC = () => {
  const { data: initialSources } = API.endpoints.getAllSources.useQuery();
  const [ updateParentSource ] = API.endpoints.updateParentSource.useMutation();
  const [ deleteSource ] = API.endpoints.deleteSource.useMutation();
  const getInitialNodes = useGetInitialNodes(initialSources);

  const onNewNode = useCallback((info: NewNode<Source>) => {
    const englishName = prompt("Node english name");
    if (!englishName) return;
    updateParentSource({
      englishName,
      parent_id: info.parentNode.data.id.toString()
    })
  }, [ updateParentSource ])

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
  } = useOntologyTreeFlow<Source>({
    onNew: onNewNode,
    patch: updateParentSource,
    del: deleteSource
  })

  useEffect(() => {
    return () => {
      API.util.invalidateTags([ 'Source' ])
    }
  }, [ initialSources ]);
  useEffect(() => {
    const { nodes, edges } = getInitialNodes()
    setNodes(nodes)
    setEdges(edges)
  }, [ initialSources ]);


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