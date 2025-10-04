# MixinBuilder Usage Guide

## Overview

The `MixinBuilder` has been rewritten with proper TypeScript generics to provide type safety and better developer experience when using mixins with classes.

## Updated Implementation

### MixinBuilder with Generics

```typescript
// Base constructor type
type Constructor<T = {}> = new (...args: any[]) => T

// Mixin function type - takes a constructor and returns a constructor
type MixinFunction<T = {}> = <U extends Constructor>(Base: U) => Constructor<T> & U

// MixinBuilder with generics and method overloads for type safety
class MixinBuilder<T extends Constructor> {
    constructor(private superclass: T) {}

    with<M1>(m1: MixinFunction<M1>): Constructor<InstanceType<T> & M1>
    with<M1, M2>(m1: MixinFunction<M1>, m2: MixinFunction<M2>): Constructor<InstanceType<T> & M1 & M2>
    with<M1, M2, M3>(m1: MixinFunction<M1>, m2: MixinFunction<M2>, m3: MixinFunction<M3>): Constructor<InstanceType<T> & M1 & M2 & M3>
    with<M1, M2, M3, M4>(m1: MixinFunction<M1>, m2: MixinFunction<M2>, m3: MixinFunction<M3>, m4: MixinFunction<M4>): Constructor<InstanceType<T> & M1 & M2 & M3 & M4>
    with(...mixins: MixinFunction<any>[]): any {
        return mixins.reduce((c, mixin) => mixin(c), this.superclass)
    }
}

// Factory function with generics
function mix<T extends Constructor>(superclass: T): MixinBuilder<T> {
    return new MixinBuilder(superclass)
}
```

## Correct Mixin Pattern

### Mixin Function Structure

A mixin should be a **function** that takes a base constructor and returns an extended constructor:

```typescript
// Correct mixin pattern
function MyMixin<T extends Constructor>(Base: T) {
    return class extends Base implements MyInterface {
        // Properties
        public myProperty: string = 'default'
        
        constructor(...args: any[]) {
            super(...args)
        }
        
        // Methods
        public myMethod(): void {
            // Implementation
        }
    }
}
```

### AspectRatioMixin Example

```typescript
function AspectRatioMixin<T extends Constructor>(Base: T) {
    return class extends Base implements AspectRatio {
        public width: number = 0
        public height: number = 0
        public aspectRatio: number = 1

        constructor(...args: any[]) {
            super(...args)
        }

        initializeAspectRatio(width: number, height: number): void {
            this.width = width
            this.height = height
            this.aspectRatio = width / height
        }

        getHorizontalAspectRatio(): number {
            return this.aspectRatio
        }

        // ... other methods
    }
}
```

## Correct Usage with Resizable

### Class Declaration

```typescript
export class Resizable extends mix(LitElement).with(AspectRatioMixin) {
    constructor() {
        super()
        // Initialize using mixin methods
        this.initializeAspectRatio(0, 0)
    }

    // Declare mixin methods for TypeScript
    declare initializeAspectRatio: (width: number, height: number) => void
    declare getHorizontalAspectRatio: () => number
    declare calculateWidthFromHeight: (height: number) => number
    // ... other mixin methods
    
    // Declare mixin properties
    declare aspectRatio: number
    declare width: number
    declare height: number
    
    // Class-specific methods and properties
    protected startHeight: number = 0
    protected startWidth: number = 0
    // ... rest of implementation
}
```

## Benefits of the Generic Implementation

1. **Type Safety**: Full TypeScript type checking for mixin combinations
2. **IntelliSense**: Proper autocomplete and method suggestions
3. **Compile-time Errors**: Catches mixin-related errors at build time
4. **Method Overloads**: Supports up to 4 mixins with proper typing
5. **Scalable**: Easy to extend for more mixins if needed

## Key Changes Made

1. **MixinBuilder**: 
   - Added generics with proper type constraints
   - Added method overloads for type safety
   - Exported `Constructor` and `MixinFunction` types

2. **AspectRatioMixin**:
   - Converted from class to mixin function
   - Added proper constructor handling
   - Added `initializeAspectRatio` method for setup

3. **Resizable Class**:
   - Added `declare` statements for all mixin methods and properties
   - Uses `initializeAspectRatio` for proper initialization
   - Maintains full type safety

## Usage Examples

```typescript
// Single mixin
class MyClass extends mix(BaseClass).with(MixinA) {}

// Multiple mixins
class MyClass extends mix(BaseClass).with(MixinA, MixinB) {}

// Up to 4 mixins with full type safety
class MyClass extends mix(BaseClass).with(MixinA, MixinB, MixinC, MixinD) {}
```

The implementation now provides full TypeScript support while maintaining the clean, readable syntax of the original pattern.
