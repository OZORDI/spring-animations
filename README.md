# Spring Animation System Documentation

A lightweight and flexible spring-based animation system for web applications, inspired by iOS animation patterns. The system provides both physics-based spring animations and optimized bezier curve alternatives.

## Table of Contents
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration Options](#configuration-options)
- [Presets](#presets)
- [Advanced Usage](#advanced-usage)
- [HTML Data Attributes](#html-data-attributes)
- [API Reference](#api-reference)

## Installation
Option 1: Direct Download

Download the spring-animation.js file.

Include the file in your HTML:
```javascript
// Spring Animations Library
<script src="https://cdn.jsdelivr.net/gh/OZORDI/spring-animations@main/springs.js"></script>
```
Option 2: Add the library to your project

Import the spring-animation.js file.
```javascript
// Import the Spring class
import { Spring } from './spring.js';
```
## Basic Usage

### Using Presets

```javascript
// Create a spring animation using a preset
const spring = Spring.fromPreset('bouncy');
const element = document.querySelector('.animated-element');
spring.animate(element, 0, 100); // Animates from 0 to 100px
```

### Custom Configuration

```javascript
// Create a spring with custom duration and bounce
const spring = new Spring({
  duration: 0.5,  // seconds
  bounce: 0.3,    // range: -1 to 1
  properties: ['transform', 'opacity']  // properties to animate
});

// Animate multiple properties
spring.animate(element, 0, 1);
```

### Physics-based Configuration

```javascript
// Create a spring using physics parameters
const spring = Spring.fromPhysics(
  1,      // mass
  100,    // stiffness
  10,     // damping
  false   // useBezier
);
```

## Configuration Options

### Core Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `duration` | Number | 0.5 | Animation duration in seconds |
| `bounce` | Number | 0 | Bounce factor (-1 to 1). Negative values create overdamped springs |
| `properties` | Array | ['transform'] | Properties to animate |
| `bezierAnimation` | Boolean | false | Use bezier curve instead of spring physics |
| `mass` | Number | 1 | Spring mass (physics-based) |
| `stiffness` | Number | Calculated | Spring stiffness (physics-based) |
| `damping` | Number | Calculated | Spring damping (physics-based) |

## Presets

The system includes three built-in presets:

```javascript
// Available presets
const PRESETS = {
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
```

## Advanced Usage

### Bezier Curve Animation

```javascript
// Create a spring with bezier curve animation
const spring = new Spring({
  duration: 0.5,
  bounce: 0.3,
  bezierAnimation: true
});

// The system will automatically generate appropriate bezier curve control points
```

### Multiple Properties

```javascript
// Animate multiple properties simultaneously
const spring = new Spring({
  duration: 0.6,
  bounce: 0.2,
  properties: ['transform', 'opacity', 'scale']
});

element.style.opacity = '0';
element.style.transform = 'scale(0.8)';

spring.animate(element, 0, 1);
```

## HTML Data Attributes

The system supports configuration via HTML data attributes:

```html
<!-- Basic configuration -->
<div data-spring="duration:0.5, bounce:0.3">Animated element</div>

<!-- Multiple properties -->
<div data-spring="duration:0.5, bounce:0.3, properties:transform opacity, bezierAnimation:true">
  Animated element
</div>

<!-- Using presets -->
<div data-spring="preset:bouncy">Animated element</div>
```

JavaScript initialization from HTML:

```javascript
const element = document.querySelector('[data-spring]');
const spring = Spring.fromElement(element);
if (spring) {
  spring.animate(element, 0, 100);
}
```

## API Reference

### Static Methods

#### `Spring.fromPreset(presetName, useBezier = false)`
Creates a spring instance from a preset configuration.

#### `Spring.fromPhysics(mass, stiffness, damping, useBezier = false)`
Creates a spring instance using physics-based parameters.

#### `Spring.fromDurationAndBounce(duration, bounce, useBezier = false)`
Creates a spring instance using duration and bounce parameters.

#### `Spring.fromElement(element)`
Creates a spring instance from HTML data attributes.

### Instance Methods

#### `animate(element, startValue, endValue)`
Animates the specified element from startValue to endValue.

#### `generateBezierPoints()`
Generates bezier curve control points based on spring parameters.

#### `calculateSpringValue(t)`
Calculates the spring position at time t.

### Supported Properties

The system supports animating the following CSS properties:
- `transform` (translateY)
- `opacity`
- `scale`
- Any numeric CSS property (px units will be automatically applied)

## Best Practices

1. **Choose the Right Configuration Method**
   - Use presets for common animations
   - Use duration/bounce for simple customization
   - Use physics parameters for precise control

2. **Performance Considerations**
   - Use `bezierAnimation: true` for simpler animations
   - Limit the number of simultaneous animations
   - Prefer transform/opacity for better performance

3. **Browser Support**
   - Works in all modern browsers
   - Uses requestAnimationFrame for smooth animations
   - Falls back to duration-based animation when necessary

## Examples

### Basic Animation

```javascript
// Simple translation animation
const spring = new Spring({
  duration: 0.5,
  bounce: 0.2
});

const element = document.querySelector('.button');
element.addEventListener('click', () => {
  spring.animate(element, 0, -20); // Moves up 20px
});
```

### Complex Animation

```javascript
// Multiple properties with physics-based configuration
const spring = Spring.fromPhysics(1, 120, 14, false);
spring.properties = ['transform', 'scale', 'opacity'];

const element = document.querySelector('.card');
element.addEventListener('mouseenter', () => {
  spring.animate(element, 0, 1);
});
```

### Preset with Bezier

```javascript
// Smooth animation using bezier curves
const spring = Spring.fromPreset('smooth', true);
const element = document.querySelector('.menu');

function toggleMenu() {
  const isOpen = element.classList.toggle('open');
  spring.animate(element, isOpen ? 0 : -100, isOpen ? 100 : 0);
}
```
