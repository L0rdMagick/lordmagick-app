// vapi.d.ts

declare global {
  interface Window {
    // THE FIX: The type is now specific and centralized here.
    vapiSDK: {
      run: (config: any) => any;
    };
  }
}

// This export {} is necessary to make the file a module.
export {};