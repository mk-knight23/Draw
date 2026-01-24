# DrawLab - Professional Canvas Creative Suite

<div align="center">

![Vue 3](https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Konva.js](https://img.shields.io/badge/Konva.js-FF5722?style=for-the-badge&logo=konva&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A high-performance, multi-layer canvas drawing application built with Vue 3 and Konva.js**

[Live Demo](https://drawlab.vercel.app) | [GitHub](https://github.com/mk-knight23/60-Draw-Web-Canvas-App)

</div>

---

## Overview

DrawLab replaces legacy canvas scripts with a robust, production-grade creative engine. It features a sophisticated layer management system, real-time tool modulators, and a high-fidelity "Studio Dark" design system.

### Problem Statement

Traditional canvas applications suffer from:
- Single-layer drawing only
- No undo/redo functionality
- Basic toolset
- No theme support

### Solution

DrawLab provides:
- **Multi-Layer Stack**: Infinite layers with visibility toggles
- **Theme System**: Dark/Light mode with persistence
- **Zero External Icons**: Inline SVGs eliminate runtime dependencies
- **Hardware Acceleration**: Konva.js for smooth rendering
- **Full Accessibility**: ARIA labels and keyboard support

---

## Features Comparison

| Feature | Legacy Version | DrawLab (v2.0) |
| :--- | :--- | :--- |
| **Engine** | Basic HTML5 Canvas | **Konva.js (Vector/Raster Hybrid)** |
| **Layers** | Single layer | **Reactive Multi-Layer Stack (Infinite)** |
| **Theme** | Fixed | **Dark + Light with persistence** |
| **Icons** | External library | **Zero-dependency inline SVGs** |
| **Tools** | Pen/Eraser only | **Pen, Rect, Circle, Text, Select, Eraser** |
| **UI Design** | Static | **Floating Glassmorphic Studio UI** |
| **History** | None | **Undo/Redo command pattern support** |
| **Export** | Standard Image | **High-res Studio Export with metadata** |
| **Accessibility** | None | **ARIA labels, keyboard nav** |

---

## Tech Stack

- **Framework:** Vue 3.5 (Composition API)
- **Canvas Engine:** Konva.js + Vue-Konva
- **State:** Pinia (Layer & History management)
- **Styling:** Tailwind CSS (Studio tokens)
- **Icons:** Inline SVGs (no external dependencies)

---

## Project Structure

```
src/
├── components/
│   ├── canvas/         # Konva Stage & Layer orchestration
│   ├── toolbar/        # Creative tool selection & modulators
│   └── layers/         # Hierarchy management
├── composables/        # Drawing & Export logic
├── stores/             # Centralized canvas state
└── App.vue             # Root component
```

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/mk-knight23/60-Draw-Web-Canvas-App.git
cd 60-Draw-Web-Canvas-App

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Theme System

DrawLab includes a fully-featured dark/light mode with:

- **System Detection**: Auto-detects OS preference
- **Manual Toggle**: Switch via header button
- **Persistence**: Preference saved in localStorage
- **Smooth Transitions**: 500ms CSS transitions

---

## Accessibility

The application includes comprehensive accessibility features:

- **ARIA Labels**: All interactive elements labeled
- **Keyboard Navigation**: Full keyboard support
- **Focus States**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant

---

## Deployment

Optimized for high-performance static hosting:

- **Vercel**: `npx vercel --prod`
- **Netlify**: Connect repository
- **GitHub Pages**: Deploy `dist/` folder

```bash
# Deploy to Vercel
npx vercel --prod --name drawlab

# Preview production build
npm run preview
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with Vue 3 + Konva.js + Tailwind CSS**

</div>
