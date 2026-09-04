/**
 * SSR-safe storage helpers — no-op on the server, localStorage on the client.
 */

export const createSSRSafeStorage = () => {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return {
    getItem: (name: string) => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
      } catch {
        // Ignore quota / privacy errors
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch {
        // Ignore
      }
    },
  };
};

export const ssrSafeStorage = createSSRSafeStorage();
