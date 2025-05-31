import { vertexShaderSource, fragmentShaderSource } from "./shaders";

export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private positionBuffer: WebGLBuffer;
  private colorBuffer: WebGLBuffer;
  private sizeBuffer: WebGLBuffer;

  // Attribute locations
  private positionLoc: number;
  private colorLoc: number;
  private sizeLoc: number;

  // Uniform locations
  private resolutionLoc: WebGLUniformLocation;
  private pointSizeLoc: WebGLUniformLocation;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL2 not supported");
    }

    this.gl = gl;

    // Create Program
    this.program = this.createProgram();

    //Get attribute locations
    this.positionLoc = gl.getAttribLocation(this.program, "a_position");
    this.colorLoc = gl.getAttribLocation(this.program, "a_color");
    this.sizeLoc = gl.getAttribLocation(this.program, "a_size");

    // Get uniform locations
    this.resolutionLoc = gl.getUniformLocation(this.program, "u_resolution")!;
    this.pointSizeLoc = gl.getUniformLocation(this.program, "u_pointSize")!;

    // Create Buffers
    this.positionBuffer = gl.createBuffer()!;
    this.colorBuffer = gl.createBuffer()!;
    this.sizeBuffer = gl.createBuffer()!;

    this.setupGL();
  }

  private createShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Error compiling shader: ${info}`);
    }

    return shader;
  }

  private createProgram(): WebGLProgram {
    const gl = this.gl;
    const vertexShader = this.createShader(
      gl.VERTEX_SHADER,
      vertexShaderSource,
    );
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error(`Error linking program: ${info}`);
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
  }

  private setupGL() {
    const gl = this.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.STC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(0.05, 0.05, 0.1, 1.0);
  }

  public resize(width: number, height: number): void {
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
  ): void {
    const gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    gl.uniform1f(this.pointSizeLoc, 1.0);

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

    gl.deleteBuffer(this.positionBuffer);
    gl.deleteBuffer(this.colorBuffer);
    gl.deleteBuffer(this.sizeBuffer);
    gl.deleteProgram(this.program);
  }
}
