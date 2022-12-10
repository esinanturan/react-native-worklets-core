export interface ISharedValue<T> {
  get value(): T;
  set value(v: T);
  addListener(listener: () => void): () => void;
}

export interface IWorklet<A extends any[], T extends (...args: A) => any> {
  /**
   * Returns the generated code for the worklet function.
   */
  readonly code: string;
  /**
   * Returns true for worklets.
   */
  readonly isWorklet: true;
}

/*
  Defines the interface for a worklet context. A worklet context is a javascript 
  runtime that can be run in its own thread.
*/
export interface IWorkletContext {
  readonly name: string;
}

export type ContextType = {
  [key: string]:
    | number
    | string
    | boolean
    | undefined
    | null
    | ISharedValue<any>
    | ContextType
    | ContextType[]
    | number[]
    | string[]
    | boolean[]
    | IWorklet<any, any>;
};

export interface IWorkletNativeApi {
  /**
   * Creates a new worklet context with the given name. The name identifies the
   * name of the worklet runtime a worklet will be executed in when you call the
   * worklet.runOnWorkletThread();
   */
  createContext: (name: string) => IWorkletContext;
  /**
   * Creates a value that can be shared between runtimes
   */
  createSharedValue: <T>(value: T) => ISharedValue<T>;
  /**
   * Creates a worklet that can be executed on either then main thread or on
   * the worklet thread in the context given by the context name (or empty to run
   * in the default context)
   * @param fn Decorated function that will be used as the worklet
   * @param context Worklet context to run the worklet in. Optional.
   * @param returns an @see(IWorklet) object
   */
  createWorklet: <C extends ContextType, T, A extends Array<unknown>>(
    fn: (this: C, ...args: A) => T,
    context?: IWorkletContext
  ) => IWorklet<A, (...args: A) => T>;
  /**
   * Creates a function that will be executed in the worklet context. The function
   * will return a promise that will be resolved when the function has been
   * executed on the worklet thread.
   *
   * Used to create a function to call from the JS thread to the worklet thread.
   * @param worklet Decorated function that will be called in the context
   * @param context Context to call function in, or default context if not set.
   * @returns A function that will be called in the worklet context
   */
  createRunInContextFn: <C extends ContextType, T, A extends Array<unknown>>(
    fn: (this: C, ...args: A) => T,
    context?: IWorkletContext
  ) => (...args: A) => Promise<T>;
  /**
   * Creates a function that will be executed in the javascript context.
   *
   * Used to create a function to call back to the JS context from a worklet context.
   * @param worklet Decorated function that will be called in the JS context
   * @returns A promise that will be resolved when the function has been executed
   */
  createRunInJsFn: <C extends ContextType, T, A extends Array<unknown>>(
    fn: (this: C, ...args: A) => T
  ) => (...args: A) => T;
}
declare global {
  var Worklets: IWorkletNativeApi;
}

export const { Worklets } = globalThis;
