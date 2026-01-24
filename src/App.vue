<script setup lang="ts">
import { ref } from 'vue'
import { useCanvasStore } from './stores/canvasStore'
import { 
  Pencil, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  MousePointer2, 
  Download, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Settings, 
  Plus, 
  Eye, 
  EyeOff, 
  Lock, 
  Activity 
} from 'lucide-vue-next'

const store = useCanvasStore()
const config = ref({
  width: window.innerWidth - 320,
  height: window.innerHeight - 80
})

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'pen', icon: Pencil, label: 'Pen' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'text', icon: Type, label: 'Text' }
]

const colors = ['#ffffff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-studio-bg overflow-hidden font-sans">
    
    <!-- Top Header -->
    <header class="h-20 border-b border-studio-border px-10 flex items-center justify-between bg-studio-card z-50">
       <div class="flex items-center space-x-3 text-white">
          <div class="bg-studio-primary p-2 rounded-xl rotate-12">
             <Activity class="text-white" :size="24" />
          </div>
          <span class="font-display font-black text-xl tracking-tighter uppercase italic">Draw<span class="text-studio-primary">Lab</span></span>
       </div>

       <div class="flex items-center space-x-6">
          <div class="flex items-center p-1 bg-white/5 rounded-2xl border border-white/5 space-x-1">
             <button class="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all"><RotateCcw :size="18" /></button>
             <button class="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all"><RotateCw :size="18" /></button>
          </div>
          <div class="h-8 w-px bg-studio-border"></div>
          <button class="bg-white text-black px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-studio-primary hover:text-white transition-all flex items-center">
             <Download class="mr-2" :size="14" /> Export Studio
          </button>
       </div>
    </header>

    <div class="flex-1 flex relative">
       
       <!-- Floating Tools Palette -->
       <div class="absolute left-8 top-1/2 -translate-y-1/2 z-40 space-y-4">
          <div class="glass-toolbar p-3 flex flex-col space-y-2">
             <button 
               v-for="tool in tools" 
               :key="tool.id"
               @click="store.setTool(tool.id)"
               class="tool-button"
               :class="{ 'tool-button-active': store.activeTool === tool.id }"
               :title="tool.label"
             >
                <component :is="tool.icon" :size="20" />
             </button>
          </div>

          <div class="glass-toolbar p-3 flex flex-col items-center space-y-4 text-white">
             <div 
               v-for="color in colors" 
               :key="color"
               @click="store.setColor(color)"
               class="w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-125 border-2 border-transparent"
               :style="{ backgroundColor: color, borderColor: store.strokeColor === color ? 'white' : 'transparent' }"
             ></div>
             <div class="h-px w-full bg-white/10"></div>
             <button class="tool-button"><Settings :size="18" /></button>
          </div>
       </div>

       <!-- Canvas Stage -->
       <main class="flex-1 bg-studio-canvas relative overflow-hidden flex items-center justify-center">
          <div class="shadow-2xl border border-white/5">
             <v-stage :config="config" class="bg-white">
                <v-layer v-for="layer in store.layers" :key="layer.id" :config="{ visible: layer.visible }">
                   <!-- Content would go here -->
                </v-layer>
             </v-stage>
          </div>
       </main>

       <!-- Layers Panel -->
       <aside class="w-80 bg-studio-card border-l border-studio-border p-8 flex flex-col space-y-10 z-40 overflow-y-auto custom-scrollbar">
          <div class="space-y-2">
             <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Workspace</h3>
             <h2 class="text-2xl font-display font-black text-white leading-none">Hierarchy</h2>
          </div>

          <div class="space-y-4 text-white">
             <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-600">{{ store.layers.length }} ACTIVE LAYERS</span>
                <button class="p-2 hover:bg-white/5 rounded-lg text-studio-primary transition-all"><Plus :size="16" /></button>
             </div>

             <div class="space-y-3">
                <div 
                  v-for="layer in store.layers" 
                  :key="layer.id"
                  class="p-4 rounded-2xl border border-white/5 transition-all group cursor-default"
                  :class="store.activeLayerId === layer.id ? 'bg-white/5 border-studio-primary text-white' : 'bg-transparent'"
                >
                   <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4">
                         <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">#0{{ layer.id }}</div>
                         <span class="text-xs font-bold uppercase tracking-tight">{{ layer.name }}</span>
                      </div>
                      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button @click="store.toggleLayerVisibility(layer.id)" class="p-1.5 hover:text-white transition-colors">
                            <Eye v-if="layer.visible" :size="12" />
                            <EyeOff v-else :size="12" class="text-slate-600" />
                         </button>
                         <button class="p-1.5 hover:text-white transition-colors text-slate-600">
                            <Lock :size="12" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div class="mt-auto space-y-6 pt-10 border-t border-white/5 text-white">
             <div class="space-y-4">
                <div class="flex justify-between text-[10px] font-black uppercase text-slate-600 tracking-widest">
                   <span>Brush Precision</span>
                   <span>{{ store.strokeWidth }}px</span>
                </div>
                <input type="range" min="1" max="50" v-model="store.strokeWidth" class="w-full h-1 bg-white/10 rounded-full appearance-none accent-studio-primary cursor-pointer">
             </div>
             <button class="w-full py-4 glass-toolbar border-white/10 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/10 transition-all flex items-center justify-center">
                <Trash2 class="mr-2" :size="14" /> Purge Canvas
             </button>
          </div>
       </aside>

    </div>
  </div>
</template>

<style>
.konvajs-content {
  cursor: crosshair !important;
}
</style>
