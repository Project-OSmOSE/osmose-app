import type { Source } from './source/api'
import type { Sound } from './sound/api'
import { useCallback, useMemo } from "react";
import { Edge, Node } from "@xyflow/react";
import { SourceNode } from "./node";

const COLUMN_SIZE = 256;
const ROW_GAP = 32;

export const useGetInitialNodes = <T extends Source | Sound>(data: T[] | undefined) => {
  const ROOT = useMemo(() => ({
    id: '-1',
    englishName: 'Root',
    parent: null,
  } as T), [])
  const calculateWordDimensions = useCallback((text: string) => {
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
  }, [])

  const compareSource = useCallback((a: T, b: T) => a.englishName.localeCompare(b.englishName), []);

  const getNodeBase = useCallback((source: T): Omit<Node<T>, 'position'> => ({
    id: source.id.toString(),
    type: 'source',
    data: source,
  }), [])


  const getNode = useCallback((source: T = ROOT, column: number = -1, y: number = 0): {
    nodes: Node<T>[],
    edges: Edge<Node<T>>[],
    height: number
  } => {
    const nodes: Node<T>[] = []
    const edges: Edge<Node<T>>[] = []
    let height = calculateWordDimensions(source.englishName).height
    const parentID = source.parent?.id ?? ROOT.id

    const children = data?.filter(s => {
      if (source === ROOT) return s.parent === null;
      return s.parent?.id === source.id;
    }).sort(compareSource) ?? []

    if (children.length === 0) {
      nodes.push({
        ...getNodeBase(source),
        position: {
          x: column * COLUMN_SIZE,
          y
        },
      })
    } else {
      const childrenTop = y
      let childrenHeight = -ROW_GAP;

      for (const child of children) {
        const { nodes: childNodes, edges: childEdges, height: childHeight } = getNode(child, column + 1, y)
        y += ROW_GAP + childHeight;
        childrenHeight += ROW_GAP + childHeight
        nodes.push(...childNodes)
        edges.push(...childEdges)
      }

      nodes.push({
        ...getNodeBase(source),
        position: {
          x: column * COLUMN_SIZE,
          y: childrenTop + childrenHeight / 2 - height / 2
        },
        deletable: source !== ROOT,
        draggable: false,
      })
      height = Math.max(height, childrenHeight)
    }
    if (source !== ROOT) {
      edges.push({
        id: source.id.toString(),
        source: parentID,
        target: source.id,
        type: 'smoothstep'
      })
    }

    return { nodes, edges, height }
  }, [ data, calculateWordDimensions, compareSource, getNodeBase ])

  return getNode;
}

export const NODE_TYPES = { source: SourceNode }
