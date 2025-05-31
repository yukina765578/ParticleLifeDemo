import { vertexShaderSource, fragmentShaderSource } from "./shaders";

export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;
  private sizeBuffer: WebGLBuffer | null = null;

  // Attribute locations
  private positionLoc: number = -1;
  private colorLoc: number = -1;
  private sizeLoc: number = -1;

  // Uniform locations
  private resolutionLoc: WebGLUniformLocation | null = null;
  private pointSizeLoc: WebGLUniformLocation | null = null;
  private cameraPositionLoc: WebGLUniformLocation | null = null;
  private cameraZoomLoc: WebGLUniformLocation | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL2 not supported");
    }

    this.gl = gl;

    try {
      // Create Program
      this.program = this.createProgram();
      console.log("WebGL program created successfully");

      // Get attribute locations
      this.positionLoc = gl.getAttribLocation(this.program, "a_position");
      this.colorLoc = gl.getAttribLocation(this.program, "a_color");
      this.sizeLoc = gl.getAttribLocation(this.program, "a_size");

      console.log("Attribute locations:", {
        position: this.positionLoc,
        color: this.colorLoc,
        size: this.sizeLoc,
      });

      // Get uniform locations
      this.resolutionLoc = gl.getUniformLocation(this.program, "u_resolution");
      this.pointSizeLoc = gl.getUniformLocation(this.program, "u_pointSize");
      this.cameraPositionLoc = gl.getUniformLocation(
        this.program,
        "u_cameraPosition",
      );
      this.cameraZoomLoc = gl.getUniformLocation(this.program, "u_cameraZoom");

      console.log("Uniform locations:", {
        resolution: this.resolutionLoc,
        pointSize: this.pointSizeLoc,
        cameraPosition: this.cameraPositionLoc,
        cameraZoom: this.cameraZoomLoc,
      });

      if (
        !this.resolutionLoc ||
        !this.pointSizeLoc ||
        !this.cameraPositionLoc ||
        !this.cameraZoomLoc
      ) {
        throw new Error("Failed to get uniform locations");
      }

      // Create Buffers
      this.positionBuffer = gl.createBuffer();
      this.colorBuffer = gl.createBuffer();
      this.sizeBuffer = gl.createBuffer();

      if (!this.positionBuffer || !this.colorBuffer || !this.sizeBuffer) {
        throw new Error("Failed to create buffers");
      }

      this.setupGL();
      console.log("WebGL renderer initialized successfully");
    } catch (error) {
      console.error("Failed to initialize WebGL renderer:", error);
      this.dispose();
      throw error;
    }
  }

  private createShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error("Failed to create shader");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(
        `Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader: ${info}`,
      );
    }

    return shader;
  }

  private createProgram(): WebGLProgram {
    const gl = this.gl;

    console.log("Creating shaders...");
    const vertexShader = this.createShader(
      gl.VERTEX_SHADER,
      vertexShaderSource,
    );
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    console.log("Shaders created successfully");

    const program = gl.createProgram();
    if (!program) {
      throw new Error("Failed to create program");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Error linking program: ${info}`);
    }

    // Clean up shaders
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
  }

  private setupGL() {
    const gl = this.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Fixed typo: was STC_ALPHA

    gl.clearColor(0.05, 0.05, 0.1, 1.0);
  }

  public resize(width: number, height: number): void {
    if (!this.program || !this.gl.isProgram(this.program)) {
      console.error("Invalid program in resize");
      return;
    }

    if (!this.resolutionLoc) {
      console.error("Resolution uniform location is null");
      return;
    }

    const gl = this.gl;
    gl.viewport(0, 0, width, height);

    gl.useProgram(this.program);
    gl.uniform2f(this.resolutionLoc, width, height);
  }

  public render(
    positions: Float32Array,
    colors: Float32Array,
    sizes: Float32Array,
    particleCount: number,
    cameraPosition: [number, number],
    cameraZoom: number,
  ): void {
    if (!this.program || !this.gl.isProgram(this.program)) {
      console.error("Invalid program in render");
      return;
    }

    if (!this.positionBuffer || !this.colorBuffer || !this.sizeBuffer) {
      console.error("Buffers not initialized");
      return;
    }

    if (!this.pointSizeLoc || !this.cameraPositionLoc || !this.cameraZoomLoc) {
      console.error("Uniform locations are null");
      return;
    }

    const gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);

    // Set uniforms
    gl.uniform1f(this.pointSizeLoc, 1.0);
    gl.uniform2f(this.cameraPositionLoc, cameraPosition[0], cameraPosition[1]);
    gl.uniform1f(this.cameraZoomLoc, cameraZoom);

    // Upload position data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.positionLoc);
    gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Upload color data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.colorLoc);
    gl.vertexAttribPointer(this.colorLoc, 3, gl.FLOAT, false, 0, 0);

    // Upload size data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.sizeLoc);
    gl.vertexAttribPointer(this.sizeLoc, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, particleCount);
  }

  public dispose(): void {
    const gl = this.gl;

    if (this.positionBuffer) {
      gl.deleteBuffer(this.positionBuffer);
      this.positionBuffer = null;
    }
    if (this.colorBuffer) {
      gl.deleteBuffer(this.colorBuffer);
      this.colorBuffer = null;
    }
    if (this.sizeBuffer) {
      gl.deleteBuffer(this.sizeBuffer);
      this.sizeBuffer = null;
    }
    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }
  }
}
