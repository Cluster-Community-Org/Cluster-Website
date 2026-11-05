import { useEffect, useState } from 'react'

// Reads a value from clusterDataService and re-reads it whenever the service broadcasts `event`.
export function useLive(event, read) {
  const [value, setValue] = useState(read)
  useEffect(() => {
    const update = () => setValue(read())
    window.addEventListener(event, update)
    return () => window.removeEventListener(event, update)
  }, [event]) // eslint-disable-line react-hooks/exhaustive-deps
  return value
}
