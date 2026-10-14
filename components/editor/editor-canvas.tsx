"use client";

import { Component, useEffect, type DragEvent, type ReactNode } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdges,
  useNodes,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
} from "lucide-react";

import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SIZE_BY_SHAPE,
  NODE_SHAPES,
  type CanvasNodeData,
  type CanvasNodeShape,
  type canvasEdge,
  type canvasNode,
} from "@/types/canvas";

const SHAPE_TO_ICON = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
} as const satisfies Record<CanvasNodeShape, typeof RectangleHorizontal>;

let shapeNodeCounter = 0;

function getNextShapeNodeId(shape: CanvasNodeShape) {
  shapeNodeCounter += 1;
  return `${shape}-${Date.now()}-${shapeNodeCounter}`;
}

function ShapeNodeRenderer({ data, selected }: NodeProps<canvasNode>) {
  const size = data.size ?? DEFAULT_NODE_SIZE_BY_SHAPE[data.shape];
  const containerStyle = {
    width: `${size.width}px`,
    height: `${size.height}px`,
    backgroundColor: data.color ?? DEFAULT_NODE_COLOR,
    color: "#EDEDED",
    border: selected ? "1.5px solid var(--accent-primary)" : "1px solid rgba(255,255,255,0.38)",
    borderRadius: "0.9rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.01em",
    padding: "0.5rem",
    boxShadow: selected ? "0 0 0 2px rgba(0, 200, 212, 0.2)" : "none",
  } as const;

  return (
    <div style={containerStyle} className="relative overflow-hidden text-center">
      <Handle type="target" position={Position.Top} id="top-target" isConnectable className="!h-3 !w-3 !border-2 !border-surface !bg-white !opacity-100" />
      <Handle type="source" position={Position.Top} id="top-source" isConnectable className="!h-3 !w-3 !border-2 !border-surface !bg-white !opacity-100" />
      <Handle type="target" position={Position.Right} id="right-target" isConnectable className="!h-3 !w-3 !border-2 !border-surface !bg-white !opacity-100" />
      <Handle type="source" position={Position.Right} id="right-source" isConnectable className="!h-3 !w-3 !border-2 !border-surface !bg-white !opacity-100" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" isConnectable className="!h-3 !w-3 !border-2 !border-surface !bg-white !opacity-100" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" isConnectable className="!h-3 !w-3 !border-2 !border-surface !bg-white !opacity-100" />
      <Handle type="target" position={Position.Left} id="left-target" isConnectable className="!h-3 !w-3 !border-2 !border-surface !bg-white !opacity-100" />
      <Handle type="source" position={Position.Left} id="left-source" isConnectable className="!h-3 !w-3 !border-2 !border-surface !bg-white !opacity-100" />

      <span className="line-clamp-2 break-words text-center text-[11px] leading-4 text-primary">
        {data.label || ""}
      </span>
    </div>
  );
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Liveblocks canvas failed to initialize:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="canvas-dot-background flex h-full w-full items-center justify-center bg-base text-sm text-copy-secondary">
          <div className="rounded-2xl border border-surface-border bg-base px-5 py-4 text-center">
            <p className="font-medium text-copy-primary">Canvas connection unavailable</p>
            <p className="mt-1 text-copy-muted">The collaborative room could not initialize.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function EditorCanvasRoom({
  roomId,
  projectId,
  onSaveStatusChange,
  onSaveRequest,
}: {
  roomId: string;
  projectId: string;
  onSaveStatusChange?: (status: "idle" | "saving" | "saved" | "error") => void;
  onSaveRequest?: (save: () => Promise<void>) => void;
}) {
  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider
        authEndpoint={async (room) => {
          const response = await fetch("/api/liveblocks-auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ room }),
          });

          const data = (await response.json().catch(() => ({ error: "forbidden", reason: "Invalid auth response" }))) as {
            token?: string;
            error?: string;
            reason?: string;
          };

          if (response.ok && data.token) {
            return { token: data.token };
          }

          return {
            error: "forbidden",
            reason: data.reason ?? data.error ?? "Unauthorized",
          };
        }}
      >
        <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
          <ClientSideSuspense
            fallback={
              <div className="canvas-dot-background flex h-full w-full items-center justify-center bg-base text-sm text-copy-muted">
                Connecting canvas…
              </div>
            }
          >
            <EditorCanvas projectId={projectId} onSaveStatusChange={onSaveStatusChange} onSaveRequest={onSaveRequest} />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
}

function EditorCanvas({
  projectId,
  onSaveStatusChange,
  onSaveRequest,
}: {
  projectId: string;
  onSaveStatusChange?: (status: "idle" | "saving" | "saved" | "error") => void;
  onSaveRequest?: (save: () => Promise<void>) => void;
}) {
  return (
    <ReactFlowProvider>
      <EditorCanvasContent
        projectId={projectId}
        onSaveStatusChange={onSaveStatusChange}
        onSaveRequest={onSaveRequest}
      />
    </ReactFlowProvider>
  );
}

function EditorCanvasContent({
  projectId,
  onSaveStatusChange,
  onSaveRequest,
}: {
  projectId: string;
  onSaveStatusChange?: (status: "idle" | "saving" | "saved" | "error") => void;
  onSaveRequest?: (save: () => Promise<void>) => void;
}) {
  const reactFlow = useReactFlow<canvasNode, canvasEdge>();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<canvasNode, canvasEdge>({
      nodes: { initial: [] },
      edges: { initial: [] },
      suspense: true,
    });
  const selectedNodes = useNodes().filter((node) => node.selected);
  const selectedEdges = useEdges().filter((edge) => edge.selected);

  const nodeTypes = {
    canvas: ShapeNodeRenderer,
  };

  const saveCanvas = async () => {
    onSaveStatusChange?.("saving");

    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error("Canvas save failed");
      }

      onSaveStatusChange?.("saved");
      window.setTimeout(() => onSaveStatusChange?.("idle"), 1200);
    } catch (error) {
      console.error("Failed to save canvas:", error);
      onSaveStatusChange?.("error");
      window.setTimeout(() => onSaveStatusChange?.("idle"), 1200);
    }
  };

  useEffect(() => {
    onSaveRequest?.(() => saveCanvas());
  }, [onSaveRequest, saveCanvas]);

  const canvasSelectedNodes = selectedNodes as canvasNode[];
  const canvasSelectedEdges = selectedEdges as canvasEdge[];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isDeleteKey = event.key === "Delete" || event.key === "Backspace";
      if (!isDeleteKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        !!target &&
        (target.isContentEditable ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target.closest("input, textarea, [contenteditable='true'], [contenteditable='']"));

      if (isEditableTarget) {
        return;
      }

      if (!canvasSelectedNodes.length && !canvasSelectedEdges.length) {
        return;
      }

      event.preventDefault();
      onDelete({ nodes: canvasSelectedNodes, edges: canvasSelectedEdges });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvasSelectedEdges, canvasSelectedNodes, onDelete]);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const rawPayload = event.dataTransfer.getData("application/ghost-ai-shape");
    if (!rawPayload) {
      return;
    }

    try {
      const payload = JSON.parse(rawPayload) as {
        shape: CanvasNodeShape;
        size: { width: number; height: number };
        offset?: { x: number; y: number };
      };

      const containerRect = event.currentTarget.getBoundingClientRect();
      const pointerX = event.clientX - containerRect.left;
      const pointerY = event.clientY - containerRect.top;
      const offsetX = payload.offset?.x ?? 0;
      const offsetY = payload.offset?.y ?? 0;
      const flowPosition = reactFlow.screenToFlowPosition({
        x: event.clientX - offsetX,
        y: event.clientY - offsetY,
      });

      const nextNode: canvasNode = {
        id: getNextShapeNodeId(payload.shape),
        type: "canvas",
        position: {
          x: flowPosition.x - payload.size.width / 2,
          y: flowPosition.y - payload.size.height / 2,
        },
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          shape: payload.shape,
          size: payload.size,
        },
        style: {
          width: payload.size.width,
          height: payload.size.height,
        },
      };

      reactFlow.addNodes(nextNode);
      void saveCanvas();
    } catch (error) {
      console.error("Failed to create shape node from drag payload:", error);
    }
  };

  return (
    <div className="relative h-full w-full">
      <ReactFlow<canvasNode, canvasEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodeTypes={nodeTypes}
        fitView={false}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{ type: "smoothstep", animated: false }}
        proOptions={{ hideAttribution: true }}
        className="h-full w-full"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="var(--border-subtle)"
        />
        <MiniMap
          pannable
          zoomable
          bgColor="transparent"
          className="!bottom-3 !right-3 !rounded-xl !border !border-surface-border !bg-surface/75"
        />
      </ReactFlow>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-surface-border bg-surface/85 px-2 py-2 shadow-lg shadow-black/25 backdrop-blur-sm">
          {NODE_SHAPES.map(({ value, label, size }) => {
            const Icon = SHAPE_TO_ICON[value];

            return (
              <button
                key={value}
                type="button"
                draggable
                onDragStart={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const payload = JSON.stringify({
                    shape: value,
                    size,
                    offset: {
                      x: event.clientX - rect.left,
                      y: event.clientY - rect.top,
                    },
                  });
                  event.dataTransfer.setData("application/ghost-ai-shape", payload);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                aria-label={`Drag ${label}`}
                title={label}
                className="flex size-11 items-center justify-center rounded-full border border-surface-border bg-subtle text-copy-secondary transition hover:border-brand hover:text-brand"
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
