export {};

declare global {
  var __STACK__: NodeJS.CallSite[];
  var __LINE__: number;
  var __FUNCTION__: string | null;
}

function getStack(): NodeJS.CallSite[] {
  const orig = Error.prepareStackTrace;
  try {
    Error.prepareStackTrace = (_err, stack) => stack as unknown as string;
    // 第2引数にこの関数自身を渡すと、そのフレームより上だけが入る
    const err: { stack?: NodeJS.CallSite[] } = {};
    Error.captureStackTrace(err as object, getStack);
    return (err.stack as unknown as NodeJS.CallSite[]) ?? [];
  } finally {
    Error.prepareStackTrace = orig;
  }
}

Object.defineProperty(globalThis, "__STACK__", {
  get() {
    return getStack();
  },
});

Object.defineProperty(globalThis, "__LINE__", {
  get() {
    // 0: この getter, 1: 呼び出し元
    return globalThis.__STACK__[1]?.getLineNumber() ?? -1;
  },
});

Object.defineProperty(globalThis, "__FUNCTION__", {
  get() {
    return globalThis.__STACK__[1]?.getFunctionName() ?? null;
  },
});
