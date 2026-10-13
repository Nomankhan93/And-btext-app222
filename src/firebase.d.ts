export {}

declare module '../firebase' {
  export const auth: any
  export const db: any
  export const functions: any
  export const firebaseConfigured: boolean
}

declare module './firebase' {
  export const auth: any
  export const db: any
  export const functions: any
  export const firebaseConfigured: boolean
}
