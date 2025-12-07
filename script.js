// State
const state = {
    tool: 'brush',
    color: '#6366F1',
    brushSize: 10,
    opacity: 100,
    zoom: 1,
    grid: false,
    symmetryH: false,
    symmetryV: false,
    drawing: false,
    startX: 0,
    startY: 0,
    layers: [],
    currentLayer: 0,
    history: [],
    historyIndex: -1,
    actionCount: 0
};

// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Initialize layers
function initLayers() {
    state.layers = [{
        canvas: document.createElement('canvas'),
        ctx: null,
        name: 'Layer 1',
        visible: true,
        opacity: 1,
        blendMode: 'normal'
    }];
    state.layers[0].canvas.width = canvas.width;
    state.layers[0].canvas.height = canvas.height;
    state.layers[0].ctx = state.layers[0].canvas.getContext('2d');
    renderLayers();
    updateLayersList();
}

// Render all layers
function renderLayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.layers.forEach(layer => {
        if (layer.visible) {
            ctx.globalAlpha = layer.opacity;
            ctx.globalCompositeOperation = layer.blendMode;
            ctx.drawImage(layer.canvas, 0, 0);
        }
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
}

// Get current layer context
function getLayerCtx() {
    return state.layers[state.currentLayer].ctx;
}

// Save state
function saveState() {
    state.historyIndex++;
    state.history = state.history.slice(0, state.historyIndex);
    state.history.push(canvas.toDataURL());
    state.actionCount++;
    document.getElementById('actionCount').textContent = `Actions: ${state.actionCount}`;
}

// Undo/Redo
function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        loadState(state.history[state.historyIndex]);
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        loadState(state.history[state.historyIndex]);
    }
}

function loadState(dataURL) {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
}

// Drawing functions
function startDrawing(e) {
    state.drawing = true;
    const rect = canvas.getBoundingClientRect();
    state.startX = (e.clientX - rect.left) / state.zoom;
    state.startY = (e.clientY - rect.top) / state.zoom;

    if (state.tool === 'brush' || state.tool === 'eraser') {
        draw(e);
    } else if (state.tool === 'eyedropper') {
        pickColor(e);
    } else if (state.tool === 'fill') {
        floodFill(state.startX, state.startY);
    }
}

function draw(e) {
    if (!state.drawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    
    const layerCtx = getLayerCtx();
    layerCtx.lineCap = 'round';
    layerCtx.lineJoin = 'round';
    layerCtx.lineWidth = state.brushSize;
    
    if (state.tool === 'eraser') {
        layerCtx.globalCompositeOperation = 'destination-out';
    } else {
        layerCtx.globalCompositeOperation = 'source-over';
        layerCtx.strokeStyle = state.color;
    }
    
    layerCtx.globalAlpha = state.opacity / 100;
    
    // Main stroke
    layerCtx.beginPath();
    layerCtx.moveTo(state.startX, state.startY);
    layerCtx.lineTo(x, y);
    layerCtx.stroke();
    
    // Symmetry
    if (state.symmetryH) {
        layerCtx.beginPath();
        layerCtx.moveTo(canvas.width - state.startX, state.startY);
        layerCtx.lineTo(canvas.width - x, y);
        layerCtx.stroke();
    }
    
    if (state.symmetryV) {
        layerCtx.beginPath();
        layerCtx.moveTo(state.startX, canvas.height - state.startY);
        layerCtx.lineTo(x, canvas.height - y);
        layerCtx.stroke();
    }
    
    state.startX = x;
    state.startY = y;
    renderLayers();
}

function stopDrawing(e) {
    if (!state.drawing) return;
    state.drawing = false;
    
    if (['line', 'rectangle', 'circle'].includes(state.tool)) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / state.zoom;
        const y = (e.clientY - rect.top) / state.zoom;
        drawShape(x, y);
    }
    
    saveState();
}

function drawShape(x, y) {
    const layerCtx = getLayerCtx();
    layerCtx.strokeStyle = state.color;
    layerCtx.lineWidth = state.brushSize;
    layerCtx.globalAlpha = state.opacity / 100;
    
    if (state.tool === 'line') {
        layerCtx.beginPath();
        layerCtx.moveTo(state.startX, state.startY);
        layerCtx.lineTo(x, y);
        layerCtx.stroke();
    } else if (state.tool === 'rectangle') {
        layerCtx.strokeRect(state.startX, state.startY, x - state.startX, y - state.startY);
    } else if (state.tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - state.startX, 2) + Math.pow(y - state.startY, 2));
        layerCtx.beginPath();
        layerCtx.arc(state.startX, state.startY, radius, 0, Math.PI * 2);
        layerCtx.stroke();
    }
    
    renderLayers();
}

function pickColor(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    state.color = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    document.getElementById('colorPicker').value = state.color;
    document.getElementById('colorHex').value = state.color;
}

function floodFill(x, y) {
    const layerCtx = getLayerCtx();
    const imageData = layerCtx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixel(imageData, x, y);
    const fillColor = hexToRgb(state.color);
    
    if (colorsMatch(targetColor, fillColor)) return;
    
    const stack = [[Math.floor(x), Math.floor(y)]];
    
    while (stack.length) {
        const [px, py] = stack.pop();
        if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;
        
        const currentColor = getPixel(imageData, px, py);
        if (!colorsMatch(currentColor, targetColor)) continue;
        
        setPixel(imageData, px, py, fillColor);
        
        stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }
    
    layerCtx.putImageData(imageData, 0, 0);
    renderLayers();
}

function getPixel(imageData, x, y) {
    const i = (y * imageData.width + x) * 4;
    return [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]];
}

function setPixel(imageData, x, y, color) {
    const i = (y * imageData.width + x) * 4;
    imageData.data[i] = color[0];
    imageData.data[i + 1] = color[1];
    imageData.data[i + 2] = color[2];
    imageData.data[i + 3] = 255;
}

function colorsMatch(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255] : [0, 0, 0, 255];
}

// Layer management
function addLayer() {
    const newLayer = {
        canvas: document.createElement('canvas'),
        ctx: null,
        name: `Layer ${state.layers.length + 1}`,
        visible: true,
        opacity: 1,
        blendMode: 'normal'
    };
    newLayer.canvas.width = canvas.width;
    newLayer.canvas.height = canvas.height;
    newLayer.ctx = newLayer.canvas.getContext('2d');
    state.layers.push(newLayer);
    state.currentLayer = state.layers.length - 1;
    updateLayersList();
    renderLayers();
}

function deleteLayer(index) {
    if (state.layers.length === 1) return;
    state.layers.splice(index, 1);
    state.currentLayer = Math.min(state.currentLayer, state.layers.length - 1);
    updateLayersList();
    renderLayers();
}

function updateLayersList() {
    const list = document.getElementById('layersList');
    list.innerHTML = '';
    state.layers.forEach((layer, i) => {
        const item = document.createElement('div');
        item.className = `layer-item ${i === state.currentLayer ? 'active' : ''}`;
        item.innerHTML = `
            <div class="layer-info">
                <div class="layer-name">${layer.name}</div>
                <div class="layer-blend">${layer.blendMode}</div>
            </div>
            <button class="layer-delete" onclick="deleteLayer(${i})">×</button>
        `;
        item.onclick = (e) => {
            if (!e.target.classList.contains('layer-delete')) {
                state.currentLayer = i;
                updateLayersList();
            }
        };
        list.appendChild(item);
    });
}

// Command palette
const commands = [
    { name: 'Undo', shortcut: 'Ctrl+Z', action: undo },
    { name: 'Redo', shortcut: 'Ctrl+Y', action: redo },
    { name: 'Clear Canvas', shortcut: '', action: () => { ctx.clearRect(0, 0, canvas.width, canvas.height); saveState(); } },
    { name: 'Export', shortcut: '', action: exportCanvas },
    { name: 'Toggle Grid', shortcut: 'G', action: toggleGrid },
    { name: 'Add Layer', shortcut: '', action: addLayer },
    { name: 'Zoom In', shortcut: '+', action: () => setZoom(state.zoom + 0.1) },
    { name: 'Zoom Out', shortcut: '-', action: () => setZoom(state.zoom - 0.1) }
];

function showCommandPalette() {
    const modal = document.getElementById('commandModal');
    const input = document.getElementById('commandInput');
    modal.classList.add('active');
    input.value = '';
    input.focus();
    renderCommands(commands);
}

function renderCommands(filteredCommands) {
    const list = document.getElementById('commandList');
    list.innerHTML = '';
    filteredCommands.forEach(cmd => {
        const item = document.createElement('div');
        item.className = 'command-item';
        item.innerHTML = `
            <span class="command-name">${cmd.name}</span>
            <span class="command-shortcut">${cmd.shortcut}</span>
        `;
        item.onclick = () => {
            cmd.action();
            closeModal('commandModal');
        };
        list.appendChild(item);
    });
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Zoom
function setZoom(zoom) {
    state.zoom = Math.max(0.5, Math.min(3, zoom));
    canvas.style.transform = `scale(${state.zoom})`;
    document.getElementById('zoomLevel').textContent = `${Math.round(state.zoom * 100)}%`;
}

// Grid
function toggleGrid() {
    state.grid = !state.grid;
    canvas.style.backgroundImage = state.grid ? 
        'repeating-linear-gradient(0deg, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 20px)' : 
        'none';
}

// Export
function exportCanvas() {
    const link = document.createElement('a');
    link.download = `artflow-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Theme
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}

// Auto-save
setInterval(() => {
    localStorage.setItem('canvas', canvas.toDataURL());
    document.getElementById('autoSave').textContent = 'Auto-saved';
    setTimeout(() => {
        document.getElementById('autoSave').textContent = '';
    }, 2000);
}, 30000);

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', (e) => {
    draw(e);
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / state.zoom);
    const y = Math.floor((e.clientY - rect.top) / state.zoom);
    document.getElementById('cursorPos').textContent = `X: ${x}, Y: ${y}`;
});
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tool-btn.active')?.classList.remove('active');
        btn.classList.add('active');
        state.tool = btn.dataset.tool;
    });
});

document.getElementById('colorPicker').addEventListener('input', (e) => {
    state.color = e.target.value;
    document.getElementById('colorHex').value = e.target.value;
});

document.getElementById('colorHex').addEventListener('input', (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        state.color = e.target.value;
        document.getElementById('colorPicker').value = e.target.value;
    }
});

document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
        state.color = btn.dataset.color;
        document.getElementById('colorPicker').value = state.color;
        document.getElementById('colorHex').value = state.color;
    });
});

document.getElementById('brushSize').addEventListener('input', (e) => {
    state.brushSize = e.target.value;
    document.getElementById('sizeValue').textContent = e.target.value;
});

document.getElementById('brushOpacity').addEventListener('input', (e) => {
    state.opacity = e.target.value;
    document.getElementById('opacityValue').textContent = e.target.value;
});

document.getElementById('symmetryH').addEventListener('click', function() {
    state.symmetryH = !state.symmetryH;
    this.classList.toggle('active');
});

document.getElementById('symmetryV').addEventListener('click', function() {
    state.symmetryV = !state.symmetryV;
    this.classList.toggle('active');
});

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);
document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Clear canvas?')) {
        getLayerCtx().clearRect(0, 0, canvas.width, canvas.height);
        renderLayers();
        saveState();
    }
});

document.getElementById('addLayer').addEventListener('click', addLayer);
document.getElementById('zoomIn').addEventListener('click', () => setZoom(state.zoom + 0.1));
document.getElementById('zoomOut').addEventListener('click', () => setZoom(state.zoom - 0.1));
document.getElementById('gridToggle').addEventListener('click', toggleGrid);
document.getElementById('commandPalette').addEventListener('click', showCommandPalette);
document.getElementById('exportBtn').addEventListener('click', exportCanvas);
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('shortcutsBtn').addEventListener('click', () => document.getElementById('shortcutsModal').classList.add('active'));
document.getElementById('closeShortcuts').addEventListener('click', () => closeModal('shortcutsModal'));

document.getElementById('commandInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = commands.filter(cmd => cmd.name.toLowerCase().includes(query));
    renderCommands(filtered);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    const key = e.key.toLowerCase();
    const tools = { b: 'brush', e: 'eraser', s: 'spray', f: 'fill', i: 'eyedropper', l: 'line', r: 'rectangle', c: 'circle', t: 'text' };
    
    if (tools[key]) {
        document.querySelector(`[data-tool="${tools[key]}"]`)?.click();
    } else if (key === 'g') {
        toggleGrid();
    } else if (key === '+' || key === '=') {
        setZoom(state.zoom + 0.1);
    } else if (key === '-') {
        setZoom(state.zoom - 0.1);
    } else if (key === '0') {
        setZoom(1);
    } else if (key === 'escape') {
        closeModal('commandModal');
        closeModal('shortcutsModal');
    } else if (e.ctrlKey || e.metaKey) {
        if (key === 'z') {
            e.preventDefault();
            undo();
        } else if (key === 'y') {
            e.preventDefault();
            redo();
        } else if (key === 'k') {
            e.preventDefault();
            showCommandPalette();
        }
    }
});

// Click outside modal to close
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Initialize
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

initLayers();
saveState();

// Load saved canvas
const savedCanvas = localStorage.getItem('canvas');
if (savedCanvas) {
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveState();
    };
    img.src = savedCanvas;
}
