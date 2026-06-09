import { useEffect, useState } from "react";

export function useAsync(loader, deps = []) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    let active = true;

    setState((current) => ({
      ...current,
      loading: true,
      error: null
    }));

    loader()
      .then((data) => {
        if (active) {
          setState({
            data,
            error: null,
            loading: false
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            data: null,
            error,
            loading: false
          });
        }
      });

    return () => {
      active = false;
    };
  }, deps);

  return state;
}
