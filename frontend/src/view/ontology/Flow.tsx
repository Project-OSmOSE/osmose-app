import '@xyflow/react/dist/style.css';
import React, { useCallback, useEffect, useRef } from "react";
import {
  addEdge,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  Handle,
  Node as _Node,
  NodeTypes,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import { OntologySourceAPI, Source } from "@/service/api/ontology/source.ts";
import { FinalConnectionState } from "@xyflow/system/dist/esm/types/general";
import type { NodeProps } from "@xyflow/react/dist/esm/types";
import { API } from "@/service/api";
import { getNode } from "@/view/ontology/utils.ts";

type Node = _Node<(Source & { label: string }) | {
  label: 'Root',
  english_name: 'Root',
  parent: null;
  id: -1
}>

const nodeOrigin: [ number, number ] = [ 0.5, 0 ];

export const SourceNode: React.FC<NodeProps & {
  data: any;
  type: any;
}> = ({ data, }) => {
  return <div
    style={ {
      padding: '0.25rem 0.75rem',
      border: '2px solid var(--ion-color-primary)',
      borderRadius: '0.5rem',
    } }>
    <p style={ {
      fontFamily: '"Exo 2", Roboto',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      wordWrap: 'break-word',
      width: '16ch'
    } }>{ data.label }</p>
    { data.label !== 'Root' && <Handle type="target" position={ Position.Left } isConnectable={ !data.parent }/> }
    <Handle type="source" position={ Position.Right }/>
  </div>
}

export const OntologyFlow: React.FC = () => {
  const reactFlowWrapper = useRef(null);
  const { data: initialSources, } = OntologySourceAPI.endpoints.listOntologySource.useQuery();
  const [ post, ] = OntologySourceAPI.endpoints.postOntologySource.useMutation();
  const [ patch, ] = OntologySourceAPI.endpoints.patchOntologySource.useMutation();
  const [ del, ] = OntologySourceAPI.endpoints.deleteOntologySource.useMutation();

  const [ nodes, setNodes, onNodesChange ] = useNodesState<Node>([]);
  const [ edges, setEdges, onEdgesChange ] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }, []);


  useEffect(() => {
    return () => {
      API.util.invalidateTags([ 'OntologySource', 'OntologySourceTree' ])
    }
  }, []);
  useEffect(() => {
    const { nodes, edges } = getNode(initialSources ?? [])
    setNodes(nodes)
    setEdges(edges)
  }, [ initialSources ]);

  const getNodeID = useCallback(() => {
    return Math.max(0, ...nodes.map(n => +n.id)) + 1
  }, [ nodes, ])
  const getEdgeID = useCallback(() => {
    return Math.max(0, ...edges.map(n => +n.id)) + 1
  }, [ edges, ])

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
    if (connectionState.fromNode && connectionState.toNode) { // Node added
      let child, parent: Node;
      if (connectionState.fromHandle!.type === 'source') {
        parent = connectionState.fromNode;
        child = connectionState.toNode;
      } else {
        parent = connectionState.toNode;
        child = connectionState.fromNode;
      }

      const data = {
        ...child.data,
        parent: parent.data.id
      }
      setNodes(nds => applyNodeChanges([ {
        type: 'replace',
        id: child.id,
        item: { ...child, data }
      } ], nds))
      console.debug('PATCH', data.english_name, 'new parent', data.parent)
      patch(data)
    }

    if (!connectionState.fromNode) return;

    // when a connection is dropped on the pane it's not valid
    if (!connectionState.isValid) {
      const english_name = prompt("Node english name");
      if (!english_name) return;

      // we need to remove the wrapper bounds, in order to get the correct position
      const id = getNodeID();
      console.log(id, getEdgeID(), connectionState.fromNode.id)
      const data = {
        english_name,
        label: english_name,
        parent: connectionState.fromNode?.data.id
      }
      post(data)
    }
  }, [ screenToFlowPosition, getNodeID, getEdgeID, nodes ],);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    let id = getEdgeID();
    const getID = () => `${ id++ }`
    setEdges(deleted.reduce((acc, node) => {
      const incomers = getIncomers(node, nodes, edges);
      const outgoers = getOutgoers(node, nodes, edges);
      const connectedEdges = getConnectedEdges([ node ], edges);

      const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

      const createdEdges = incomers.flatMap(({ id: source }) =>
        outgoers.map(({ id: target }) => ({
          id: getID(),
          source,
          target,
          type: 'smoothstep'
        })),
      );
      for (const edge of createdEdges) {
        const child = nodes.find(n => n.id === edge.target);
        const parent = nodes.find(n => n.id === edge.source);
        if (!child) continue;
        const data = {
          ...child.data,
          parent: parent?.data.id ?? null
        }
        setNodes(nds => applyNodeChanges([ {
          type: 'replace',
          id: child.id,
          item: { ...child, data }
        } ], nds))
        console.debug('PATCH', data.english_name, 'new parent', data.parent)
        patch(data)
      }

      return [ ...remainingEdges, ...createdEdges ];
    }, edges));
    for (const node of deleted) {
      console.debug('DELETE', node.data.english_name)
      del(node.data)
    }
  }, [ nodes, edges, getEdgeID ]);

  const onEdgesDelete = useCallback((deleted: Edge[]) => {
    for (const edge of deleted) {
      const target = nodes.find(n => n.id === edge.target);
      if (!target) continue;
      const data = { ...target.data, parent: null }
      setNodes(nds => applyNodeChanges([ {
        type: 'replace',
        id: target.id,
        item: { ...target, data }
      } ], nds))
      patch(data)
      console.debug('PATCH', data.english_name, data.parent)
    }
  }, [ nodes ])

  // TODO: allow edge removing

  const nodeTypes: NodeTypes = { source: SourceNode };

  return (
    <div className="wrapper" style={ { height: '100vh', width: '100vw' } } ref={ reactFlowWrapper }>
      <ReactFlow nodes={ nodes }
                 nodeTypes={ nodeTypes }
                 edges={ edges }
                 onNodesChange={ onNodesChange }
                 onNodesDelete={ onNodesDelete }
                 onEdgesChange={ onEdgesChange }
                 onEdgesDelete={ onEdgesDelete }
                 onConnect={ onConnect }
                 onConnectEnd={ onConnectEnd }
                 fitView
                 fitViewOptions={ { padding: 2 } }
                 nodeOrigin={ nodeOrigin }>
        <Background/>
        <Controls showInteractive={ false }/>
      </ReactFlow>
    </div>
  );
}