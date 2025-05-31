import { Camera } from "./Camera";

export class InputHandler {
  private camera: Camera;
  private canvas: HTMLCanvasElement;

  // Mouse state
  private isMouseDown: boolean = false;
  private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };
  private mouseButton: number = -1;

  // Event listeners (for cleanup)
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private boundWheel: (e: WheelEvent) => void;
  private boundContextMenu: (e: Event) => void;

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;

    // Bind event handlers
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundWheel = this.handleWheel.bind(this);
    this.boundContextMenu = this.handleContextMenu.bind(this);

    this.addEventListeners();
  }

  private addEventListeners(): void {
    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("mouseup", this.boundMouseUp);
    this.canvas.addEventListener("wheel", this.boundWheel);
    this.canvas.addEventListener("contextmenu", this.boundContextMenu);

    // Also listen on window for mouse up (in case mouse leaves canvas while dragging)
    window.addEventListener("mouseup", this.boundMouseUp);
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("mouseup", this.boundMouseUp);
    this.canvas.removeEventListener("wheel", this.boundWheel);
    this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    window.removeEventListener("mouseup", this.boundMouseUp);
  }

  private getMousePos(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault();

    const mousePos = this.getMousePos(event);
    this.isMouseDown = true;
    this.mouseButton = event.button;
    this.lastMousePos = mousePos;

    // Change cursor to indicate dragging
    this.canvas.style.cursor = "grabbing";
  }

  private handleMouseMove(event: MouseEvent): void {
    const mousePos = this.getMousePos(event);

    if (this.isMouseDown) {
      // Calculate mouse delta
      const deltaX = mousePos.x - this.lastMousePos.x;
      const deltaY = mousePos.y - this.lastMousePos.y;

      // Pan camera (invert Y for natural movement)
      this.camera.pan(deltaX, deltaY);

      this.lastMousePos = mousePos;
    } else {
      // Show grab cursor when hovering
      this.canvas.style.cursor = "grab";
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    this.isMouseDown = false;
    this.mouseButton = -1;

    // Reset cursor
    this.canvas.style.cursor = "grab";
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const mousePos = this.getMousePos(event);

    // Determine zoom direction and amount
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;

    // Zoom at mouse cursor position
    this.camera.zoomAt(mousePos.x, mousePos.y, zoomFactor);
  }

  private handleContextMenu(event: Event): void {
    // Prevent right-click context menu
    event.preventDefault();
  }

  /**
   * Get current mouse position in world coordinates
   */
  public getWorldMousePos(event: MouseEvent): { x: number; y: number } {
    const screenPos = this.getMousePos(event);
    return this.camera.screenToWorld(screenPos.x, screenPos.y);
  }

  /**
   * Check if mouse is currently being dragged
   */
  public isDragging(): boolean {
    return this.isMouseDown;
  }

  /**
   * Reset camera to center with double-click or keyboard shortcut
   */
  public resetCamera(): void {
    this.camera.reset();
  }

  /**
   * Cleanup event listeners
   */
  public dispose(): void {
    this.removeEventListeners();
  }

  /**
   * Enable/disable input handling
   */
  public setEnabled(enabled: boolean): void {
    if (enabled) {
      this.addEventListeners();
      this.canvas.style.cursor = "grab";
    } else {
      this.removeEventListeners();
      this.canvas.style.cursor = "default";
    }
  }
}
