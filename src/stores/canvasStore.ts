import { defineStore } from 'pinia'

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  items: any[];
}

interface CanvasState {
  activeTool: string;
  strokeColor: string;
  strokeWidth: number;
  layers: Layer[];
  activeLayerId: string;
  history: any[];
  historyIndex: number;
}

export const useCanvasStore = defineStore('canvas', {
  state: (): CanvasState => ({
    activeTool: 'pen',
    strokeColor: '#3b82f6',
    strokeWidth: 4,
    layers: [
      { id: '1', name: 'Background', visible: true, locked: false, items: [] },
      { id: '2', name: 'Layer 1', visible: true, locked: false, items: [] }
    ],
    activeLayerId: '2',
    history: [],
    historyIndex: -1
  }),
  actions: {
    setTool(tool: string) {
      this.activeTool = tool
    },
    setColor(color: string) {
      this.strokeColor = color
    },
    setWidth(width: number) {
      this.strokeWidth = width
    },
    toggleLayerVisibility(id: string) {
      const layer = this.layers.find(l => l.id === id)
      if (layer) layer.visible = !layer.visible
    }
  }
})
