import { useCallback } from "react";
import { Edge, Node } from "@xyflow/react";
import { Source } from "./api";

const COLUMN_SIZE = 256;
const ROW_GAP = 32;

const RootSource: Source = {
  id: '-1',
  englishName: 'Root',
  parent: null,
} as Source

export const useGetInitialNodes = (sources: Source[] | undefined) => {
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

  const compareSource = useCallback((a: Source, b: Source) => a.englishName.localeCompare(b.englishName), []);

  const getNodeBase = useCallback((source: Source): Omit<Node<Source>, 'position'> => ({
    id: source.id.toString(),
    type: 'source',
    data: source,
  }), [])


  const getNode = useCallback((source: Source = RootSource, column: number = -1, y: number = 0): {
    nodes: Node<Source>[],
    edges: Edge<Node<Source>>[],
    height: number
  } => {
    const nodes: Node<Source>[] = []
    const edges: Edge<Node<Source>>[] = []
    let height = calculateWordDimensions(source.englishName).height
    const parentID = source.parent?.id ?? RootSource.id

    const children = sources?.filter(s => {
      if (source === RootSource) return s.parent === null;
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
      })
      height = Math.max(height, childrenHeight)
    }
    if (source !== RootSource) {
      edges.push({
        id: source.id.toString(),
        source: parentID,
        target: source.id,
        type: 'smoothstep'
      })
    }

    return { nodes, edges, height }
  }, [ sources, calculateWordDimensions, compareSource, getNodeBase ])

  return getNode;
}