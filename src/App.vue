<script setup lang="ts">
import { ref } from 'vue'
import { useCanvasStore } from './stores/canvasStore'
import { useTheme } from './composables/useTheme'

const store = useCanvasStore()
const { isDarkMode, toggleTheme } = useTheme()

const config = ref({
  width: window.innerWidth - 320,
  height: window.innerHeight - 80
})

const tools = [
  { id: 'select', label: 'Select', path: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z' },
  { id: 'pen', label: 'Pen', path: 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.07 16.97' },
  { id: 'eraser', label: 'Eraser', path: 'M20 20H7L3 16c-.8-.8-.8-2 0-2.8L13.4 2.8c.8-.8 2-.8 2.8 0L21 7.7c.8.8.8 2 0 2.8L13 18' },
  { id: 'rect', label: 'Rectangle', path: 'M3 7h18v13H3z' },
  { id: 'circle', label: 'Circle', path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  { id: 'text', label: 'Text', path: 'M4 7V4h16v3M9 20h6M12 4v16' }
]

const colors = ['#ffffff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6']
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-studio-bg dark:bg-studio-bg overflow-hidden font-sans transition-colors duration-500" :class="{ 'light-mode': !isDarkMode }">

    <!-- Top Header -->
    <header class="h-20 border-b border-studio-border px-10 flex items-center justify-between bg-studio-card z-50">
       <div class="flex items-center space-x-3 text-white">
          <div class="bg-studio-primary p-2 rounded-xl rotate-12">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span class="font-display font-black text-xl tracking-tighter uppercase italic">Draw<span class="text-studio-primary">Lab</span></span>
       </div>

       <div class="flex items-center space-x-6">
          <button @click="toggleTheme()" class="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all" :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
             <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          </button>
          <div class="flex items-center p-1 bg-white/5 rounded-2xl border border-white/5 space-x-1">
             <button class="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all" aria-label="Undo">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
             </button>
             <button class="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all" aria-label="Redo">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
             </button>
          </div>
          <div class="h-8 w-px bg-studio-border"></div>
          <button class="bg-white text-black px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-studio-primary hover:text-white transition-all flex items-center">
             <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Export Studio
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
               :aria-label="tool.label"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="tool.path"/></svg>
             </button>
          </div>

          <div class="glass-toolbar p-3 flex flex-col items-center space-y-4 text-white">
             <div
               v-for="color in colors"
               :key="color"
               @click="store.setColor(color)"
               class="w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-125 border-2 border-transparent"
               :style="{ backgroundColor: color, borderColor: store.strokeColor === color ? 'white' : 'transparent' }"
               role="button"
               :aria-label="'Color: ' + color"
               tabindex="0"
             ></div>
             <div class="h-px w-full bg-white/10"></div>
             <button class="tool-button" aria-label="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
             </button>
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
                <button class="p-2 hover:bg-white/5 rounded-lg text-studio-primary transition-all" aria-label="Add layer">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                </button>
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
                         <button @click="store.toggleLayerVisibility(layer.id)" class="p-1.5 hover:text-white transition-colors" :aria-label="layer.visible ? 'Hide layer' : 'Show layer'">
                            <svg v-if="layer.visible" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-600"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/></svg>
                         </button>
                         <button class="p-1.5 hover:text-white transition-colors text-slate-600" aria-label="Lock layer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
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
                <input type="range" min="1" max="50" v-model="store.strokeWidth" class="w-full h-1 bg-white/10 rounded-full appearance-none accent-studio-primary cursor-pointer" aria-label="Brush size">
             </div>
             <button class="w-full py-4 glass-toolbar border-white/10 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/10 transition-all flex items-center justify-center" aria-label="Clear canvas">
                <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> Purge Canvas
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

.light-mode {
  --studio-bg: #f5f5f5;
  --studio-card: #ffffff;
  --studio-border: #e5e5e5;
  --studio-canvas: #f0f0f0;
}

.light-mode .text-white {
  color: #1a1a1a !important;
}

.light-mode .bg-studio-card {
  background-color: #ffffff;
}

.light-mode .glass-toolbar {
  background-color: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.1);
}

.light-mode .border-white\/5 {
  border-color: rgba(0, 0, 0, 0.05);
}

.light-mode .bg-white\/5 {
  background-color: rgba(0, 0, 0, 0.05);
}

.light-mode .text-slate-500 {
  color: #737373 !important;
}

.light-mode .text-slate-600 {
  color: #525252 !important;
}
</style>
