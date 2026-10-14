import type { Edge, Node } from "@xyflow/react";

export type CanvasNodeSize = {
  width: number;
  height: number;
};

export const NODE_SHAPES = [
  { value: "rectangle", label: "Rectangle", size: { width: 180, height: 110 } },
  { value: "diamond", label: "Diamond", size: { width: 170, height: 170 } },
  { value: "circle", label: "Circle", size: { width: 120, height: 120 } },
  { value: "pill", label: "Pill", size: { width: 190, height: 92 } },
  { value: "cylinder", label: "Cylinder", size: { width: 170, height: 120 } },
  { value: "hexagon", label: "Hexagon", size: { width: 180, height: 120 } },
] as const;

export type CanvasNodeShape = (typeof NODE_SHAPES)[number]["value"];

export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const;

export const DEFAULT_NODE_COLOR = NODE_COLORS[0].fill;

export const DEFAULT_NODE_SIZE_BY_SHAPE = Object.fromEntries(
  NODE_SHAPES.map(({ value, size }) => [value, size]),
) as Record<CanvasNodeShape, CanvasNodeSize>;

export type CanvasNodeData = {
  label: string;
  color: string;
  shape: CanvasNodeShape;
  size?: CanvasNodeSize;
};

export type CanvasEdgeData = {
  color?: string;
};

export type canvasNode = Node<CanvasNodeData, "canvas">;
export type canvasEdge = Edge<CanvasEdgeData, "canvas">;
