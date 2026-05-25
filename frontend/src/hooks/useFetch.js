import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

function useFetch(url, options = {}) {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(url, {
        params: options.params || undefined,
      });

      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(options.errorMessage || "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options.params)]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    reload: load,
  };
}

export default useFetch;