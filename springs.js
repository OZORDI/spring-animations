class Spring {
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
    // Previous constructor logic remains the same
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

  // Previous methods remain the same...

  // Modified applyBezierAnimation method
  applyBezierAnimation(element, property, startValue, endValue) {
    const [x1, y1, x2, y2] = this.generateBezierPoints();
    const bezierCurve = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
    
    // Build transition properties
    const transitionProps = this.properties.map(prop => {
      return `${prop} ${this.duration}s ${bezierCurve}`;
    }).join(', ');
    
    // Apply transition properties
    element.style.transitionProperty = this.properties.join(', ');
    element.style.transitionDuration = `${this.duration}s`;
    element.style.transitionTimingFunction = bezierCurve;
    
    // Handle transform properties separately to preserve existing transforms
    if (property === 'transform') {
      const currentTransform = getComputedStyle(element).transform;
      const transforms = this.parseTransforms(currentTransform);
      
      if (typeof startValue === 'number' && typeof endValue === 'number') {
        transforms.translateY = `${endValue}px`;
      }
      
      element.style.transform = this.buildTransformString(transforms);
    } else if (property === 'scale') {
      const currentTransform = getComputedStyle(element).transform;
      const transforms = this.parseTransforms(currentTransform);
      transforms.scale = endValue;
      element.style.transform = this.buildTransformString(transforms);
    } else {
      element.style[property] = typeof endValue === 'number' ? `${endValue}px` : endValue;
    }
  }

  // New helper method to parse transform string
  parseTransforms(transformString) {
    const transforms = {};
    if (transformString === 'none') return transforms;

    const transformRegex = /([\w]+)\(([^)]+)\)/g;
    let match;
    while ((match = transformRegex.exec(transformString)) !== null) {
      transforms[match[1]] = match[2];
    }
    return transforms;
  }

  // New helper method to build transform string
  buildTransformString(transforms) {
    return Object.entries(transforms)
      .map(([key, value]) => `${key}(${value})`)
      .join(' ');
  }

  // Static method to initialize all spring elements on the page
  static initializeAll() {
    document.querySelectorAll('[data-spring]').forEach(element => {
      const spring = Spring.fromElement(element);
      if (spring) {
        // Store the spring instance on the element for future reference
        element._spring = spring;
        
        // Initialize transition properties
        if (spring.useBezier) {
          const [x1, y1, x2, y2] = spring.generateBezierPoints();
          const bezierCurve = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
          
          element.style.transitionProperty = spring.properties.join(', ');
          element.style.transitionDuration = `${spring.duration}s`;
          element.style.transitionTimingFunction = bezierCurve;
        }
      }
    });
  }
}

// Auto-initialize springs when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Spring.initializeAll());
} else {
  Spring.initializeAll();
}
