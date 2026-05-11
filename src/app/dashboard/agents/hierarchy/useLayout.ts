import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80', // Vertical spacing
  'elk.spacing.nodeNode': '40', // Horizontal spacing
  'elk.direction': 'DOWN',
  'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
  'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
};

export const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      ...node,
      // Target dimensions of the AgentNode
      width: 240,
      height: 120,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);
    
    if (!layoutedGraph.children) return { nodes, edges };

    const layoutedNodes = nodes.map((node) => {
      const layoutedNode = layoutedGraph.children!.find((n) => n.id === node.id);
      
      return {
        ...node,
        position: {
          x: layoutedNode?.x ?? 0,
          y: layoutedNode?.y ?? 0,
        },
        // We set style opacity 1 after layout to avoid flash of unpositioned nodes
        style: { ...node.style, opacity: 1 },
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('ELK Layout error:', error);
    return { nodes, edges };
  }
};
