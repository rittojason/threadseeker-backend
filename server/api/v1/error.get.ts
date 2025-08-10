export default defineEventHandler(() => {
  throw new Error("Test error for Sentry integration");
});
