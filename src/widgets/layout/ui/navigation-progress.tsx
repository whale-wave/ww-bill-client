import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router-dom';
import './navigation-progress.scss';

const SHOW_DELAY = 200;

/**
 * Top loading bar shown during route navigation. Only appears after
 * SHOW_DELAY ms — fast loads (cached chunks, prefetched) stay invisible,
 * so common navigation feels instant. For slow first-loads on weak
 * networks, the bar gives the user feedback that something is happening.
 *
 * Used together with route-level `lazy` (which keeps the current page
 * mounted during chunk load) — the old page stays visible + this bar
 * slides across the top, matching the native-app transition feel.
 */
export const NavigationProgress: FC = () => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const isLoading = navigation.state !== 'idle';

  useEffect(() => {
    if (!isLoading) {
      // Defer hide to next frame to avoid synchronous set-state in effect
      const raf = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(raf);
    }
    const timer = setTimeout(setVisible, SHOW_DELAY, true);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!visible)
    return null;

  return (
    <div className="nav-progress" aria-hidden>
      <div className="nav-progress__bar" />
    </div>
  );
};
