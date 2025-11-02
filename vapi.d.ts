// vapi.d.ts

declare global {
  interface Window {
    // THE FIX: The full, correct type for the Vapi SDK is now centralized here.
    vapiSDK: {
      run: (config: any) => any;
      stop: () => void;
      on: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// This export {} is necessary to make the file a module.
export {};