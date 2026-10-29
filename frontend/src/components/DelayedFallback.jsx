import { useEffect, useState } from 'react';
import Spinner from './Spinner.jsx';

// Suspense fallback that stays invisible for the first 300 ms.
// On a fast connection the chunk arrives before that, so no loading state flickers;
// on a slow one the spinner appears as normal.
export default function DelayedFallback({ label = 'Loading page', delay = 300 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  return visible ? <Spinner label={label} /> : null;
}
