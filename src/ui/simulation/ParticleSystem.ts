export interface ParticleSystemConfig {
  particleCount: number;
  worldSize: { width: number; height: number };
  colorCount: number;
  sensingRadius?: number;
  betaDistance?: number;
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
  private colorMatrix: Float32Array; // Interaction rules matrix

  // Interaction parameters
  private sensingRadius: number;
  private betaDistance: number;

  constructor(config: ParticleSystemConfig) {
    this.particleCount = config.particleCount;
    this.worldSize = config.worldSize;
    this.colorCount = config.colorCount;
    this.sensingRadius = config.sensingRadius || 80; // Sensing radius for interactions
    this.betaDistance = config.betaDistance || 15; // Not used in particle life force function

    this.positions = new Float32Array(this.particleCount * 2);
    this.velocities = new Float32Array(this.particleCount * 2);
    this.colors = new Float32Array(this.particleCount * 3);
    this.colorIndices = new Uint8Array(this.particleCount);
    this.sizes = new Float32Array(this.particleCount);
    this.forces = new Float32Array(this.particleCount * 2);

    this.colorPalette = this.generateColorPalette();
    this.colorMatrix = this.generateColorMatrix();

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

  private generateColorMatrix(): Float32Array {
    const matrix = new Float32Array(this.colorCount * this.colorCount);

    // Generate stronger asymmetric interaction rules
    for (let i = 0; i < this.colorCount; i++) {
      for (let j = 0; j < this.colorCount; j++) {
        if (i === j) {
          // Same color - repulsion to prevent clustering
          matrix[i * this.colorCount + j] = -0.4;
        } else {
          // Different colors - stronger random asymmetric rules
          matrix[i * this.colorCount + j] = (Math.random() - 0.5) * 3.0; // Range: -1.5 to +1.5
        }
      }
    }

    return matrix;
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

      // Start with zero velocity
      this.velocities[i * 2] = 0;
      this.velocities[i * 2 + 1] = 0;

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

    // Calculate particle interactions
    this.calculateForces();

    // Physics integration
    this.integrate(deltaTime);

    // Handle boundaries
    this.handleBoundaries();
  }

  private calculateForces(): void {
    const sensingRadiusSquared = this.sensingRadius * this.sensingRadius;

    for (let i = 0; i < this.particleCount; i++) {
      const x1 = this.positions[i * 2];
      const y1 = this.positions[i * 2 + 1];
      const color1 = this.colorIndices[i];

      for (let j = i + 1; j < this.particleCount; j++) {
        const x2 = this.positions[j * 2];
        const y2 = this.positions[j * 2 + 1];
        const color2 = this.colorIndices[j];

        // Calculate distance
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distanceSquared = dx * dx + dy * dy;

        // Skip if outside sensing radius
        if (distanceSquared > sensingRadiusSquared) continue;

        // Calculate actual distance for normalization
        const distance = Math.sqrt(distanceSquared);

        // Normalized direction vectors
        const dirX = dx / distance;
        const dirY = dy / distance;

        // Normalize distance to 0-1 range (based on sensing radius)
        const normalizedDistance = distance / this.sensingRadius;

        // Get interaction rules (asymmetric)
        const rule1to2 = this.colorMatrix[color1 * this.colorCount + color2];
        const rule2to1 = this.colorMatrix[color2 * this.colorCount + color1];

        // Calculate force using proper particle life force function
        const force1Magnitude = this.particleLifeForce(
          normalizedDistance,
          rule1to2,
        );
        const force2Magnitude = this.particleLifeForce(
          normalizedDistance,
          rule2to1,
        );

        // Apply forces
        const force1X = dirX * force1Magnitude;
        const force1Y = dirY * force1Magnitude;
        const force2X = -dirX * force2Magnitude;
        const force2Y = -dirY * force2Magnitude;

        // Accumulate forces
        this.forces[i * 2] += force1X;
        this.forces[i * 2 + 1] += force1Y;
        this.forces[j * 2] += force2X;
        this.forces[j * 2 + 1] += force2Y;
      }
    }
  }

  /**
   * Particle Life force function
   * @param r - normalized distance (0-1)
   * @param a - attraction rule (-1 to +1)
   * @returns force magnitude
   */
  private particleLifeForce(r: number, a: number): number {
    const beta = 0.3;

    if (r < beta) {
      // Repulsion zone - always repulsive regardless of attraction rule
      return r / beta - 1;
    } else if (beta < r && r < 1) {
      // Attraction/repulsion zone with smooth falloff
      return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
    } else {
      // No force beyond sensing radius
      return 0;
    }
  }

  private integrate(deltaTime: number): void {
    const damping = 0.98; // Slightly higher damping for stability
    const maxSpeed = 120; // Moderate max speed
    const forceScale = 150; // Moderate force scaling

    for (let i = 0; i < this.particleCount; i++) {
      const px = i * 2;
      const py = i * 2 + 1;

      // Apply forces to velocity
      this.velocities[px] += this.forces[px] * deltaTime * forceScale;
      this.velocities[py] += this.forces[py] * deltaTime * forceScale;

      // Apply damping
      this.velocities[px] *= damping;
      this.velocities[py] *= damping;

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
    }
  }

  private handleBoundaries(): void {
    const halfWidth = this.worldSize.width / 2;
    const halfHeight = this.worldSize.height / 2;

    for (let i = 0; i < this.particleCount; i++) {
      const px = i * 2;
      const py = i * 2 + 1;

      // Wrap around world edges
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

  // Public methods for interaction
  public setColorRule(colorA: number, colorB: number, strength: number): void {
    if (
      colorA >= 0 &&
      colorA < this.colorCount &&
      colorB >= 0 &&
      colorB < this.colorCount
    ) {
      this.colorMatrix[colorA * this.colorCount + colorB] = strength;
    }
  }

  public getColorRule(colorA: number, colorB: number): number {
    if (
      colorA >= 0 &&
      colorA < this.colorCount &&
      colorB >= 0 &&
      colorB < this.colorCount
    ) {
      return this.colorMatrix[colorA * this.colorCount + colorB];
    }
    return 0;
  }

  public randomizeRules(): void {
    for (let i = 0; i < this.colorCount; i++) {
      for (let j = 0; j < this.colorCount; j++) {
        if (i === j) {
          // Same color - repulsion
          this.colorMatrix[i * this.colorCount + j] = -0.4;
        } else {
          // Random asymmetric rules - stronger
          this.colorMatrix[i * this.colorCount + j] =
            (Math.random() - 0.5) * 3.0;
        }
      }
    }
  }

  public setSensingRadius(radius: number): void {
    this.sensingRadius = radius;
  }

  public setBetaDistance(distance: number): void {
    this.betaDistance = distance;
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
