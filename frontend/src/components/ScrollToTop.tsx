import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component ensures that the window is scrolled to the top
 * whenever the application's path changes.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // We use 'instant' here to match the behavior of standard page loads,
    // though 'smooth' is an option if you want a visual transition.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
