declare global {
  namespace App {
    interface Platform {
      env: {
        SESSIONS: DurableObjectNamespace;
        [key: string]: unknown;
      };
      context: ExecutionContext;
      caches: CacheStorage;
      cf: IncomingRequestCfProperties;
    }
  }
}

export {};
