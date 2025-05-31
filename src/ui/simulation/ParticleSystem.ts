export interface ParticleSystemConfig {
  particleCount: number;
  worldSize: { width: number; height: number };
  colorCount: number;
}

export class ParticleSystem {
  public positions: Float32Array;
  public velocities: Float32Array;
  public colors: Float32Array;
  public colorIndices: Uint8Array;
  public sizes: Float32Array;
  public forces: Float32Array;

  private particleCount: number;
  private worldSize: { width: number; height: number };
  private colorCount: number;
  private colorPalette: Float32Array;

  constructor(config: ParticleSystemConfig) {
    this.particleCount = config.particleCount;
    this.worldSize = config.worldSize;
    this.colorCount = config.colorCount;

    this.positions = new Float32Array(this.particleCount * 2);
    this.velocities = new Float32Array(this.particleCount * 2);
    this.colors = new Float32Array(this.particleCount * 3);
    this.colorIndices = new Uint8Array(this.particleCount);
    this.sizes = new Float32Array(this.particleCount);
    this.forces = new Float32Array(this.particleCount * 2);

    this.colorPalette = this.generateColorPalette();

    this.initializeParticles();
  }

  private generateColorPalette(): Float32Array {
    const palette = new Float32Array(this.colorCount * 3);

    for (let i = 0; i < this.colorCount; i++) {
      const hue = (i / this.colorCount) * 360;
      const rgb = this.hslToRgb(hue, 0.7, 0.5);
      palette[i * 3] = rgb[0];
      palette[i * 3 + 1] = rgb[1];
      palette[i * 3 + 2] = rgb[2];
    }

    return palette;
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const hueToRgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    return [
      hueToRgb(p, q, h + 1 / 3),
      hueToRgb(p, q, h),
      hueToRgb(p, q, h - 1 / 3),
    ];
  }

  private initializeParticles(): void {
    for (let i = 0; i < this.particleCount; i++) {
      // Random positions in world space (centered around origin)
      this.positions[i * 2] = (Math.random() - 0.5) * this.worldSize.width;
      this.positions[i * 2 + 1] = (Math.random() - 0.5) * this.worldSize.height;

      // Random velocities (small initial velocity)
      this.velocities[i * 2] = (Math.random() - 0.5) * 10.0;
      this.velocities[i * 2 + 1] = (Math.random() - 0.5) * 10.0;

      // Random color assignment
      const colorIndex = Math.floor(Math.random() * this.colorCount);
      this.colorIndices[i] = colorIndex;

      // Copy color from palette
      this.colors[i * 3] = this.colorPalette[colorIndex * 3];
      this.colors[i * 3 + 1] = this.colorPalette[colorIndex * 3 + 1];
      this.colors[i * 3 + 2] = this.colorPalette[colorIndex * 3 + 2];

      this.sizes[i] = 4.0;
    }
  }

  public update(deltaTime: number): void {
    // Reset forces
    this.forces.fill(0);

    // Simple physics update for now (we'll add particle interactions later)
    const damping = 0.995;
    const maxSpeed = 200;

    for (let i = 0; i < this.particleCount; i++) {
      const px = i * 2;
      const py = i * 2 + 1;

      // Apply damping
      this.velocities[px] *= damping;
      this.velocities[py] *= damping;

      // Add some random brownian motion
      this.velocities[px] += (Math.random() - 0.5) * 2.0;
      this.velocities[py] += (Math.random() - 0.5) * 2.0;

      // Clamp velocity
      const speed = Math.sqrt(
        this.velocities[px] * this.velocities[px] +
          this.velocities[py] * this.velocities[py],
      );
      if (speed > maxSpeed) {
        this.velocities[px] = (this.velocities[px] / speed) * maxSpeed;
        this.velocities[py] = (this.velocities[py] / speed) * maxSpeed;
      }

      // Update positions
      this.positions[px] += this.velocities[px] * deltaTime;
      this.positions[py] += this.velocities[py] * deltaTime;

      // Wrap around world edges (much larger than screen)
      const halfWidth = this.worldSize.width / 2;
      const halfHeight = this.worldSize.height / 2;

      if (this.positions[px] < -halfWidth)
        this.positions[px] += this.worldSize.width;
      if (this.positions[px] > halfWidth)
        this.positions[px] -= this.worldSize.width;
      if (this.positions[py] < -halfHeight)
        this.positions[py] += this.worldSize.height;
      if (this.positions[py] > halfHeight)
        this.positions[py] -= this.worldSize.height;
    }
  }

  public setWorldSize(width: number, height: number): void {
    this.worldSize.width = width;
    this.worldSize.height = height;
  }

  public getWorldBounds(): { width: number; height: number } {
    return { ...this.worldSize };
  }

  public getParticlesInRegion(
    left: number,
    right: number,
    top: number,
    bottom: number,
  ): number[] {
    const visibleParticles: number[] = [];

    for (let i = 0; i < this.particleCount; i++) {
      const x = this.positions[i * 2];
      const y = this.positions[i * 2 + 1];

      if (x >= left && x <= right && y >= top && y <= bottom) {
        visibleParticles.push(i);
      }
    }

    return visibleParticles;
  }
}
