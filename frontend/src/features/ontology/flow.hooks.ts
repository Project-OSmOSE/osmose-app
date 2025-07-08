import {
  addEdge,
  applyNodeChanges,
  Connection,
  Edge,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  Node,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import { useCallback } from "react";
import { FinalConnectionState } from "@xyflow/system/dist/esm/types/general";
import '@xyflow/react/dist/style.css'

export const NODE_ORIGIN: [ number, number ] = [ 0.5, 0 ];

export type NewNode<NodeType extends Record<string, unknown>> = {
  parentNode: Node<NodeType>;
}

export const useOntologyTreeFlow = <NodeType extends Record<string, unknown>>({ patch, del, onNew }: {
  patch: (value: NodeType) => void,
  del: (value: NodeType) => void,
  onNew: (info: NewNode<NodeType>) => void
}) => {
  const { screenToFlowPosition } = useReactFlow();

  const [ nodes, setNodes, onNodesChange ] = useNodesState<Node<NodeType>>([]);
  const [ edges, setEdges, onEdgesChange ] = useEdgesState<Edge>([]);

  const getNodeID = useCallback(() => {
    return Math.max(0, ...nodes.map(n => +n.id)) + 1
  }, [ nodes, ])
  const getEdgeID = useCallback(() => {
    return Math.max(0, ...edges.map(n => +n.id)) + 1
  }, [ edges, ])

  const onNodesDelete = useCallback((deleted: Node<NodeType>[]) => {
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
        patch(data)
      }

      return [ ...remainingEdges, ...createdEdges ];
    }, edges));
    for (const node of deleted) {
      del(node.data)
    }
  }, [ nodes, edges, getEdgeID, patch, del, ]);

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
    }
  }, [ nodes, patch ])

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }, []);

  const onConnectEnd = useCallback((_: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
    console.debug('connectionState type', connectionState)
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
      patch(data)
    }

    if (!connectionState.fromNode) return;

    // when a connection is dropped on the pane it's not valid
    if (!connectionState.isValid) {
      onNew({ parentNode: connectionState.fromNode })
    }
  }, [ screenToFlowPosition, getNodeID, getEdgeID, nodes, onNew ],);

  return {
    nodes,
    setNodes,
    onNodesChange,
    onNodesDelete,

    edges,
    setEdges,
    onEdgesChange,
    onEdgesDelete,

    onConnect,
    onConnectEnd,
  }
}