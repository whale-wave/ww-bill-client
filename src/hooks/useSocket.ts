import { useCallback } from 'react';

export function useSocket() {
  const connect = useCallback(() => {
    console.info('connect');
  }, []);

  const disconnect = useCallback(() => {
    console.info('disconnect');
  }, []);

  return { connect, disconnect };
}
