class Spring {
  constructor({
    duration = 0.5,
    bounce = 0.2,
    mass = 1,
    stiffness = 100,
    damping = 10,
    properties = ['transform'],
    preset = null,
  } = {}) {
    this.mass = mass;
    this.stiffness = stiffness;
    this.damping = damping;
    this.duration = duration;
    this.bounce = bounce;
    this.properties = properties;

    if (preset) this.applyPreset(preset);
  }

  applyPreset(preset) {
    const presets = {
      bouncy: { bounce: 0.4, stiffness: 200, damping: 5 },
      smooth: { bounce: 0, stiffness: 100, damping: 8 },
      flattened: { bounce: -0.4, stiffness: 80, damping: 15 },
    };
    const presetConfig = presets[preset.toLowerCase()];
    if (presetConfig) {
      this.bounce = presetConfig.bounce;
      this.stiffness = presetConfig.stiffness;
      this.damping = presetConfig.damping;
    }
  }

  springEquation1(A, B, a, c, t) {
    return (A * Math.exp(a * t) + B * Math.exp(-a * t)) * Math.exp(-c * t);
  }

  springEquation2(A, B, c, t) {
    return (A * t + B) * Math.exp(-c * t);
  }

  calculateSpringValue(A, B, a, c, t) {
    if (this.bounce > 0) {
      return this.springEquation1(A, B, a, c, t);
    } else {
      return this.springEquation2(A, B, c, t);
    }
  }

  applyToElement(element) {
    const A = 0; // Desired position (final position)
    const B = parseFloat(getComputedStyle(element).transform.split(',')[5]) || 0; // Current position
    const a = this.stiffness;
    const c = this.damping;

    let startTime;

    const bezierCurve = this.generateBezierCurve();
    element.style.transition = `all ${this.duration}s ${bezierCurve}`;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const t = (time - startTime) / 1000;

      const newValue = this.calculateSpringValue(A, B, a, c, t);
      this.properties.forEach(property => {
        element.style[property] = property === 'transform' ? `translateY(${newValue}px)` : newValue; 
      });

      if (t < this.duration) {
        requestAnimationFrame(animate);
      } else {
        this.properties.forEach(property => {
          element.style[property] = property === 'transform' ? `${A}px` : ''; 
        });
      }
    };

    requestAnimationFrame(animate);
  }

  generateBezierCurve() {
    const x1 = this.bounce > 0 ? 0.42 : (this.bounce < 0 ? 0.3 : 0.25);
    const y1 = this.bounce > 0 ? 1.75 : (this.bounce < 0 ? 0.6 : 0.1);
    const x2 = this.bounce > 0 ? 0.58 : (this.bounce < 0 ? 0.7 : 0.75);
    const y2 = 1.0;

    return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  }

  static fromAttributes(element) {
    const duration = parseFloat(element.getAttribute('data-spring-duration')) || 0.5;
    const bounce = parseFloat(element.getAttribute('data-spring-bounce')) || 0.2;
    const mass = parseFloat(element.getAttribute('data-spring-mass')) || 1;
    const propertiesAttr = element.getAttribute('data-spring-properties');

    // Split properties into an array or fallback to default
    const properties = propertiesAttr ? propertiesAttr.split(',').map(prop => prop.trim()) : ['transform'];

    return new Spring({
      duration,
      bounce,
      mass,
      properties,
    });
  }

  static parseShorthand(springShorthand) {
    const params = springShorthand.split(',').reduce((acc, param) => {
      let [key, value] = param.split(':').map(item => item.trim());
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    return {
      duration: parseFloat(params.duration) || 0.5,
      bounce: parseFloat(params.bounce) || 0.2,
      mass: parseFloat(params.mass) || 1,
      properties: params.properties ? params.properties.split(',').map(prop => prop.trim()) : ['transform'],
    };
  }
}

// Utility to automatically apply spring animations based on attributes
function applySpringAnimationsFromAttributes() {
  const elements = document.querySelectorAll('*');

  elements.forEach((element) => {
    const attributes = Array.from(element.attributes);
    const hasSpringAttribute = attributes.some(attr => attr.name.startsWith('data-spring'));

    if (hasSpringAttribute) {
      const spring = Spring.fromAttributes(element);
      if (spring) {
        spring.applyToElement(element);
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', applySpringAnimationsFromAttributes);
