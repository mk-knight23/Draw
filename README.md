# DrawLab - Professional Canvas Creative Suite

A high-performance, multi-layer canvas drawing application built with **Vue 3**, **TypeScript**, **Konva.js**, and **Tailwind CSS**. Designed for professional creative workflows with sub-second responsiveness.

## Overview
DrawLab replaces legacy canvas scripts with a robust, production-grade creative engine. It features a sophisticated layer management system, real-time tool modulators, and a high-fidelity "Studio Dark" design system.

## Features Comparison

| Feature | Legacy Version | DrawLab (v2.0) |
| :--- | :--- | :--- |
| **Engine** | Basic HTML5 Canvas | **Konva.js (Vector/Raster Hybrid)** |
| **Layers** | Single layer | **Reactive Multi-Layer Stack (Infinite)** |
| **Tools** | Pen/Eraser only | **Pen, Rect, Circle, Text, Select, Eraser** |
| **UI Design** | Static | **Floating Glassmorphic Studio UI** |
| **History** | None | **Undo/Redo command pattern support** |
| **Export** | Standard Image | **High-res Studio Export with metadata** |

## Tech Stack
- **Framework:** Vue 3.5 (Composition API)
- **Canvas Engine:** Konva.js + Vue-Konva
- **State:** Pinia (Layer & History management)
- **Styling:** Tailwind CSS (Studio tokens)
- **Icons:** Lucide Vue

## Project Structure
```text
src/
├── components/
│   ├── canvas/         # Konva Stage & Layer orchestration
│   ├── toolbar/        # Creative tool selection & modulators
│   └── layers/         # Hierarchy management
├── stores/             # Centralized canvas state
└── composables/        # Drawing & Export logic
```

## Setup & Build Instructions

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## Deployment
Optimized for high-performance static hosting. Features hardware-accelerated rendering for fluid creative sessions.

---

**License:** MIT
**Architect:** mk-knight23
