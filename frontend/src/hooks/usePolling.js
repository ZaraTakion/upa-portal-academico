import { useEffect } from "react";

function usePolling(callback, delay = 30000) {
  useEffect(() => {
    if (!callback) return;

    callback();

    const interval = setInterval(() => {
      callback();
    }, delay);

    return () => clearInterval(interval);
  }, [callback, delay]);
}

export default usePolling;