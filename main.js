class PaintApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // State
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.undoStack = [];
        this.redoStack = [];
        this.startX = null;
        this.startY = null;

        // Additional state
        this.textInput = null;
        this.isDragging = false;
        this.lastTouch = null;

        // Settings
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#000000';
        this.ctx.fillStyle = '#000000';
        this.opacity = 1;

        this.initializeTools();
        this.initializeEvents();
        this.initializeDragDrop();
        this.saveState(); // Save initial canvas state
    }

    resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    initializeTools() {
        // Tool selection
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', () => {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.currentTool = tool.dataset.tool;
            });
        });

        // Color picker
        const colorPicker = document.getElementById('color-picker');
        colorPicker.addEventListener('input', (e) => {
            this.ctx.strokeStyle = e.target.value;
            this.ctx.fillStyle = e.target.value;
        });

        // Preset colors
        document.querySelectorAll('.clr').forEach(clr => {
            const color = clr.dataset.clr;
            clr.style.backgroundColor = color;
            clr.addEventListener('click', () => {
                this.ctx.strokeStyle = color;
                this.ctx.fillStyle = color;
                colorPicker.value = color;
            });
        });

        // Brush size
        const brushSize = document.getElementById('brush-size');
        const sizeValue = document.getElementById('size-value');
        brushSize.addEventListener('input', (e) => {
            this.ctx.lineWidth = e.target.value;
            sizeValue.textContent = e.target.value + 'px';
        });

        // Opacity
        const opacity = document.getElementById('opacity');
        const opacityValue = document.getElementById('opacity-value');
        opacity.addEventListener('input', (e) => {
            this.opacity = e.target.value / 100;
            opacityValue.textContent = e.target.value + '%';
            this.ctx.globalAlpha = this.opacity;
        });

        // Actions
        document.querySelector('.undo').addEventListener('click', () => this.undo());
        document.querySelector('.redo').addEventListener('click', () => this.redo());
        document.querySelector('.clear').addEventListener('click', () => this.clearCanvas());
        document.querySelector('.save').addEventListener('click', () => this.saveImage());
    }

    initializeEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Mouse Events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.drawing(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch Events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.lastTouch = touch;
            this.startDrawing(touch);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.drawing(touch);
            this.lastTouch = touch;
        });

        this.canvas.addEventListener('touchend', () => this.stopDrawing());
    }

    initializeDragDrop() {
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        // Scale image if it's too large
                        let width = img.width;
                        let height = img.height;
                        const maxSize = Math.min(this.canvas.width, this.canvas.height);
                        
                        if (width > maxSize || height > maxSize) {
                            const ratio = Math.min(maxSize / width, maxSize / height);
                            width *= ratio;
                            height *= ratio;
                        }

                        const x = (this.canvas.width - width) / 2;
                        const y = (this.canvas.height - height) / 2;
                        
                        this.ctx.drawImage(img, x, y, width, height);
                        this.saveState();
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    startDrawing(e) {
        this.isDrawing = true;
        [this.startX, this.startY] = this.getMousePos(e);

        if (this.currentTool === 'text') {
            this.startTextInput(this.startX, this.startY);
        }
    }

    drawing(e) {
        if (!this.isDrawing) return;
        const [mouseX, mouseY] = this.getMousePos(e);
        
        switch(this.currentTool) {
            case 'brush':
                this.draw(mouseX, mouseY);
                break;
            case 'eraser':
                const currentColor = this.ctx.strokeStyle;
                this.ctx.strokeStyle = '#ffffff';
                this.draw(mouseX, mouseY);
                this.ctx.strokeStyle = currentColor;
                break;
            case 'rectangle':
            case 'circle':
            case 'line':
                this.previewShape(mouseX, mouseY);
                break;
        }
        
        [this.startX, this.startY] = [mouseX, mouseY];
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }

    startTextInput(x, y) {
        if (this.textInput) {
            this.commitText();
        }

        this.textInput = document.createElement('input');
        this.textInput.type = 'text';
        this.textInput.style.position = 'fixed';
        this.textInput.style.left = x + 'px';
        this.textInput.style.top = y + 'px';
        this.textInput.style.background = 'transparent';
        this.textInput.style.border = '1px solid #000';
        this.textInput.style.outline = 'none';
        this.textInput.style.color = this.ctx.fillStyle;
        this.textInput.style.font = '16px sans-serif';
        
        document.body.appendChild(this.textInput);
        this.textInput.focus();

        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.commitText();
            }
        });

        this.textInput.addEventListener('blur', () => {
            this.commitText();
        });
    }

    commitText() {
        if (this.textInput && this.textInput.value) {
            const rect = this.textInput.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            const x = rect.left - canvasRect.left;
            const y = rect.top - canvasRect.top + parseInt(this.textInput.style.font);
            
            this.ctx.font = this.textInput.style.font;
            this.ctx.fillText(this.textInput.value, x, y);
            this.saveState();
        }
        
        if (this.textInput) {
            this.textInput.remove();
            this.textInput = null;
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches?.[0].clientX || this.lastTouch?.clientX;
        const clientY = e.clientY || e.touches?.[0].clientY || this.lastTouch?.clientY;
        
        return [
            clientX - rect.left,
            clientY - rect.top
        ];
    }

    draw(mouseX, mouseY) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(mouseX, mouseY);
        this.ctx.stroke();
    }

    previewShape(mouseX, mouseY) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Copy current canvas state
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Draw shape preview
        tempCtx.strokeStyle = this.ctx.strokeStyle;
        tempCtx.lineWidth = this.ctx.lineWidth;
        tempCtx.globalAlpha = this.opacity;
        
        switch(this.currentTool) {
            case 'rectangle':
                tempCtx.beginPath();
                tempCtx.rect(
                    this.startX,
                    this.startY,
                    mouseX - this.startX,
                    mouseY - this.startY
                );
                tempCtx.stroke();
                break;
                
            case 'circle':
                tempCtx.beginPath();
                const radius = Math.sqrt(
                    Math.pow(mouseX - this.startX, 2) +
                    Math.pow(mouseY - this.startY, 2)
                );
                tempCtx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
                tempCtx.stroke();
                break;
                
            case 'line':
                tempCtx.beginPath();
                tempCtx.moveTo(this.startX, this.startY);
                tempCtx.lineTo(mouseX, mouseY);
                tempCtx.stroke();
                break;
        }
        
        // Clear and update main canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(tempCanvas, 0, 0);
    }

    saveState() {
        this.undoStack.push(this.canvas.toDataURL());
        this.redoStack = []; // Clear redo stack when new action is performed
    }

    undo() {
        if (this.undoStack.length > 1) {
            this.redoStack.push(this.undoStack.pop());
            const img = new Image();
            img.src = this.undoStack[this.undoStack.length - 1];
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const img = new Image();
            img.src = this.redoStack.pop();
            this.undoStack.push(img.src);
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }

    saveImage() {
        const data = this.canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = data;
        a.download = 'drawing.png';
        a.click();
    }
}

// Initialize the paint application
window.addEventListener('load', () => {
    new PaintApp();
});