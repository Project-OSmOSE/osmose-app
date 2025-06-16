import { Source } from "@/service/api/ontology/source.ts";
import { Edge } from "@xyflow/react";
import { Node as _Node } from "@xyflow/react/dist/esm/types/nodes";

export type Node = _Node<(Source & { label: string }) | {
  label: 'Root',
  english_name: 'Root',
  parent: null;
  id: -1
}>

const COLUMN_SIZE = 256;
const ROW_GAP = 32;

const RootSource: Source = {
  english_name: 'Root',
  parent: null,
  id: -1,
}

function calculateWordDimensions(text: string) {
  const div = document.createElement('div');
  div.setAttribute('style', `
      font-family: "Exo 2", Roboto;
      overflow: hidden;
      text-overflow: ellipsis;
      word-wrap: break-word;
      width: 16ch;
      padding: 0.25rem 0;
      border: 2px solid dark;
  `);
  div.innerHTML = text;
  document.body.appendChild(div);

  const dimensions = {
    width: div.clientWidth,
    height: div.clientHeight
  };
  div.parentNode?.removeChild(div)
  return dimensions;
}

const compareSource = (a: Source, b: Source) => a.english_name.localeCompare(b.english_name);

function _getNodeBase(source: Source): Omit<Node, 'position'> {
  return {
    id: source.id.toString(),
    type: 'source',
    data: { ...source, label: source.english_name },
  }
}

export function getNode(all: Source[], source: Source = RootSource, column: number = -1, y: number = 0): {
  nodes: Node[],
  edges: Edge<Node>[],
  height: number
} {
  const nodes: Node[] = []
  const edges: Edge<Node>[] = []
  let height = calculateWordDimensions(source.english_name).height
  const parentID = source.parent ?? RootSource.id

  const children = all.filter(s => source === RootSource ? s.parent === null : s.parent === source.id).sort(compareSource)

  if (children.length === 0) {
    nodes.push({
      ..._getNodeBase(source),
      position: {
        x: column * COLUMN_SIZE,
        y
      },
    })
  } else {
    const childrenTop = y
    let childrenHeight = -ROW_GAP;

    for (const child of children) {
      const { nodes: childNodes, edges: childEdges, height: childHeight } = getNode(all, child, column + 1, y)
      y += ROW_GAP + childHeight;
      childrenHeight += ROW_GAP + childHeight
      nodes.push(...childNodes)
      edges.push(...childEdges)
    }

    nodes.push({
      ..._getNodeBase(source),
      position: {
        x: column * COLUMN_SIZE,
        y: childrenTop + childrenHeight / 2 - height / 2
      },
    })
    height = Math.max(height, childrenHeight)
  }
  if (source !== RootSource) {
    edges.push({
      id: source.id.toString(),
      source: parentID.toString(),
      target: source.id.toString(),
      type: 'smoothstep'
    })
  }

  return { nodes, edges, height }
}
