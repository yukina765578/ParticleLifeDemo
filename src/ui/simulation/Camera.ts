export class Camera {
  public position: { x: number; y: number };
  public zoom: number;

  // Zoom constraints
  private minZoom: number = 0.1;
  private maxZoom: number = 5.0;

  // Screen dimensions (set by renderer)
  private screenWidth: number = 1;
  private screenHeight: number = 1;

  constructor(x: number = 0, y: number = 0, zoom: number = 1.0) {
    this.position = { x, y };
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
  }

  /**
   * Update screen dimensions (called when canvas resizes)
   */
  public setScreenSize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  public worldToScreen(
    worldX: number,
    worldY: number,
  ): { x: number; y: number } {
    const screenX =
      (worldX - this.position.x) * this.zoom + this.screenWidth / 2;
    const screenY =
      (worldY - this.position.y) * this.zoom + this.screenHeight / 2;
    return { x: screenX, y: screenY };
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  public screenToWorld(
    screenX: number,
    screenY: number,
  ): { x: number; y: number } {
    const worldX =
      (screenX - this.screenWidth / 2) / this.zoom + this.position.x;
    const worldY =
      (screenY - this.screenHeight / 2) / this.zoom + this.position.y;
    return { x: worldX, y: worldY };
  }

  /**
   * Pan the camera by screen pixel amounts
   */
  public pan(deltaScreenX: number, deltaScreenY: number): void {
    // Convert screen delta to world delta
    const worldDeltaX = deltaScreenX / this.zoom;
    const worldDeltaY = deltaScreenY / this.zoom;

    this.position.x -= worldDeltaX;
    this.position.y -= worldDeltaY;
  }

  /**
   * Zoom at a specific screen position (like mouse cursor)
   */
  public zoomAt(screenX: number, screenY: number, zoomDelta: number): void {
    // Get world position before zoom
    const worldPos = this.screenToWorld(screenX, screenY);

    // Apply zoom
    const newZoom = Math.max(
      this.minZoom,
      Math.min(this.maxZoom, this.zoom * zoomDelta),
    );
    this.zoom = newZoom;

    // Get world position after zoom
    const newWorldPos = this.screenToWorld(screenX, screenY);

    // Adjust camera position to keep the point under cursor
    this.position.x += worldPos.x - newWorldPos.x;
    this.position.y += worldPos.y - newWorldPos.y;
  }

  /**
   * Set zoom level while keeping center point stable
   */
  public setZoom(newZoom: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
  }

  /**
   * Get the current viewport bounds in world coordinates
   */
  public getViewportBounds(): {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  } {
    const halfWidth = this.screenWidth / (2 * this.zoom);
    const halfHeight = this.screenHeight / (2 * this.zoom);

    return {
      left: this.position.x - halfWidth,
      right: this.position.x + halfWidth,
      top: this.position.y - halfHeight,
      bottom: this.position.y + halfHeight,
      width: halfWidth * 2,
      height: halfHeight * 2,
    };
  }

  /**
   * Check if a world position is visible in the current viewport
   */
  public isPointVisible(
    worldX: number,
    worldY: number,
    margin: number = 0,
  ): boolean {
    const bounds = this.getViewportBounds();
    return (
      worldX >= bounds.left - margin &&
      worldX <= bounds.right + margin &&
      worldY >= bounds.top - margin &&
      worldY <= bounds.bottom + margin
    );
  }

  /**
   * Get camera transform matrix for shaders (as uniform values)
   */
  public getTransformUniforms(): {
    cameraPosition: [number, number];
    cameraZoom: number;
    screenSize: [number, number];
  } {
    return {
      cameraPosition: [this.position.x, this.position.y],
      cameraZoom: this.zoom,
      screenSize: [this.screenWidth, this.screenHeight],
    };
  }

  /**
   * Reset camera to default position and zoom
   */
  public reset(): void {
    this.position.x = 0;
    this.position.y = 0;
    this.zoom = 1.0;
  }

  /**
   * Smoothly move camera to a target position
   */
  public moveTo(targetX: number, targetY: number, speed: number = 0.1): void {
    this.position.x += (targetX - this.position.x) * speed;
    this.position.y += (targetY - this.position.y) * speed;
  }

  /**
   * Set zoom constraints
   */
  public setZoomConstraints(minZoom: number, maxZoom: number): void {
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
  }
}
