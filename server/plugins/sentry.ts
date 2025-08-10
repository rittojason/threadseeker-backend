import {
  getDefaultIsolationScope,
  getIsolationScope,
  logger,
  withIsolationScope,
} from "@sentry/core";
import * as Sentry from "@sentry/node";
import { type EventHandler, H3Error } from "h3";
import { defineNitroPlugin } from "nitropack/runtime";
import { extractErrorContext } from "../utils/use-sentry";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.h3App.handler = patchEventHandler(nitroApp.h3App.handler);

  Sentry.init({
    dsn: "https://93cbd48d00ba1ab0be39cba5084aabc8@o4508801137573888.ingest.us.sentry.io/4508801138753536",
  });

  nitroApp.hooks.hook("error", async (error, errorContext) => {
    // Do not handle 404 and 422
    if (
      error instanceof H3Error && // Do not report if status code is 3xx or 4xx
      error.statusCode >= 300 &&
      error.statusCode < 500
    ) {
      return;
    }

    const { method, path } = {
      method: errorContext.event?._method ?? "",
      path: errorContext.event?._path ?? null,
    };

    if (path) {
      Sentry.getCurrentScope().setTransactionName(`${method} ${path}`);
    }

    const structuredContext = extractErrorContext(errorContext);

    Sentry.captureException(error, {
      captureContext: { contexts: { nuxt: structuredContext } },
      mechanism: { handled: false },
    });
  });
});

function patchEventHandler(handler: EventHandler): EventHandler {
  return new Proxy(handler, {
    async apply(
      handlerTarget,
      handlerThisArg,
      handlerArgs: Parameters<EventHandler>
    ) {
      const isolationScope = getIsolationScope();
      const newIsolationScope =
        isolationScope === getDefaultIsolationScope()
          ? isolationScope.clone()
          : isolationScope;

      logger.log(
        `Patched h3 event handler. ${
          isolationScope === newIsolationScope
            ? "Using existing"
            : "Created new"
        } isolation scope.`
      );

      return withIsolationScope(newIsolationScope, async () => {
        try {
          return await handlerTarget.apply(handlerThisArg, handlerArgs);
        } catch (error) {
          Sentry.captureException(error);
          throw error;
        }
      });
    },
  });
}
