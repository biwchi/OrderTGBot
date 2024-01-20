export default function (fn: Function, errorCb: Function) {
  return async (ctx: any, next: Function) => {
    try {
      await fn(ctx, next);
    } catch (error) {
      errorCb(ctx, error);
    }
  };
}
