/// <reference types="vite/client" />

// Vite CSS import types
declare module '*.css?inline' {
  const content: string
  export default content
}

declare module '*.css?url' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: string
  export default content
}

// Additional Vite asset types
declare module '*.png?asset' {
  const content: string
  export default content
}

declare module '*.jpg?asset' {
  const content: string
  export default content
}

declare module '*.jpeg?asset' {
  const content: string
  export default content
}

declare module '*.gif?asset' {
  const content: string
  export default content
}

declare module '*.svg?asset' {
  const content: string
  export default content
}
