class Spring {
  // Presets based on common use cases from iOS
  static PRESETS = {
    'bouncy': {
      duration: 0.7,
      bounce: 0.4
    },
    'smooth': {
      duration: 0.5,
      bounce: 0
    },
    'flattened': {
      duration: 0.4,
      bounce: -0.2
    }
  };

  constructor(config = {}) {
    if (typeof config === 'string') {
      if (!Spring.PRESETS[config]) {
        throw new Error(`Unknown preset: ${config}`);
      }
      this.initFromDurationAndBounce(Spring.PRESETS[config]);
    } else if ('mass' in config && 'stiffness' in config && 'damping' in config) {
      this.mass = config.mass;
      this.stiffness = config.stiffness;
      this.damping = config.damping;
      this.duration = 2 * Math.PI / Math.sqrt(this.stiffness / this.mass);
      this.bounce = this.calculateBounceFromDamping();
    } else {
      this.initFromDurationAndBounce({
        duration: config.duration || 0.5,
        bounce: Math.max(-1, Math.min(1, config.bounce || 0))
      });
    }

    this.properties = Array.isArray(config.properties) ? 
      config.properties : ['transform'];
    
    this.useBezier = config.bezierAnimation || false;
  }

  initFromDurationAndBounce({ duration, bounce }) {
    this.duration = duration;
    this.bounce = bounce;
    this.mass = 1;
    this.stiffness = Math.pow((2 * Math.PI) / duration, 2);
    
    if (bounce >= 0) {
      this.damping = (1 - 4 * Math.PI * bounce / duration);
    } else {
      this.damping = (4 * Math.PI) / (duration + 4 * Math.PI * bounce);
    }
  }

  calculateBounceFromDamping() {
    const criticalDamping = 2 * Math.sqrt(this.mass * this.stiffness);
    return (criticalDamping - this.damping) / criticalDamping;
  }

  // New method to generate bezier curve control points based on spring parameters
  generateBezierPoints() {
    // For non-bouncy springs (bounce <= 0)
    if (this.bounce <= 0) {
      const x1 = 0.16 + (0.12 * Math.abs(this.bounce)); // Adjust start handle
      const y1 = 0;
      const x2 = 0.28 + (0.12 * Math.abs(this.bounce)); // Adjust end handle
      const y2 = 1;
      return [x1, y1, x2, y2];
    }
    
    // For bouncy springs (bounce > 0)
    // Calculate overshoot based on bounce value
    const overshoot = this.bounce * 0.2; // 20% of bounce value determines overshoot
    const x1 = 0.2;
    const y1 = 0.2 + overshoot;
    const x2 = 0.8;
    const y2 = 1 + overshoot;
    
    return [x1, y1, x2, y2];
  }

  // New method to apply bezier curve animation
  applyBezierAnimation(element, property, startValue, endValue) {
    const [x1, y1, x2, y2] = this.generateBezierPoints();
    const bezierCurve = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
    
    element.style.transition = `${property} ${this.duration}s ${bezierCurve}`;
    
    // For transform properties, handle special cases
    if (property === 'transform') {
      if (typeof startValue === 'number' && typeof endValue === 'number') {
        element.style.transform = `translateY(${endValue}px)`;
      }
    } else if (property === 'scale') {
      element.style.transform = `scale(${endValue})`;
    } else {
      element.style[property] = typeof endValue === 'number' ? `${endValue}px` : endValue;
    }
  }

  // Enhanced animate method to handle both spring and bezier animations
  animate(element, startValue, endValue) {
    if (this.useBezier) {
      this.properties.forEach(property => {
        this.applyBezierAnimation(element, property, startValue, endValue);
      });
      return;
    }

    // Original spring animation logic
    const startTime = performance.now();
    const totalDistance = endValue - startValue;
    
    const tick = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      
      if (elapsed >= this.duration * 1.5) {
        this.updateElementProperties(element, endValue);
        return;
      }
      
      const springProgress = this.calculateSpringValue(elapsed);
      const currentValue = startValue + (totalDistance * springProgress);
      
      this.updateElementProperties(element, currentValue);
      requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
  }

  calculateSpringValue(t) {
    const normalizedTime = t / this.duration;
    
    if (this.bounce > 0) {
      const omega = Math.sqrt(this.stiffness / this.mass);
      const zeta = this.damping / (2 * Math.sqrt(this.mass * this.stiffness));
      return Math.exp(-zeta * omega * normalizedTime) * 
             Math.cos(omega * Math.sqrt(1 - zeta * zeta) * normalizedTime);
    } else {
      const a = this.damping + Math.sqrt(this.damping * this.damping - 4 * this.stiffness);
      const b = this.damping - Math.sqrt(this.damping * this.damping - 4 * this.stiffness);
      return (Math.exp(-a * normalizedTime) + Math.exp(-b * normalizedTime)) / 2;
    }
  }

  updateElementProperties(element, value) {
    this.properties.forEach(property => {
      switch (property) {
        case 'transform':
          element.style.transform = `translateY(${value}px)`;
          break;
        case 'opacity':
          element.style.opacity = value;
          break;
        case 'scale':
          element.style.transform = `scale(${value})`;
          break;
        default:
          if (typeof value === 'number') {
            element.style[property] = `${value}px`;
          }
      }
    });
  }

  // Static helper to parse HTML data attributes
  static parseDataAttribute(element) {
    const springData = element.dataset.spring;
    if (!springData) return null;

    const params = {};
    springData.split(',').forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key === 'properties') {
        params[key] = value.split(' ');
      } else if (key === 'bezierAnimation') {
        params[key] = value.toLowerCase() === 'true';
      } else if (!isNaN(value)) {
        params[key] = parseFloat(value);
      } else {
        params[key] = value;
      }
    });
    return params;
  }

  // Static methods for initialization
  static fromPreset(presetName, useBezier = false) {
    return new Spring({ ...Spring.PRESETS[presetName], bezierAnimation: useBezier });
  }

  static fromPhysics(mass, stiffness, damping, useBezier = false) {
    return new Spring({ mass, stiffness, damping, bezierAnimation: useBezier });
  }

  static fromDurationAndBounce(duration, bounce, useBezier = false) {
    return new Spring({ duration, bounce, bezierAnimation: useBezier });
  }

  static fromElement(element) {
    const config = Spring.parseDataAttribute(element);
    return config ? new Spring(config) : null;
  }
}
