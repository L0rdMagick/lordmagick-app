"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A global component that manages the viewport's overflow property.
 * This acts as a failsafe to fix a bug in the `react-pageflip` library where
 * it fails to remove `overflow: hidden` from the body on mobile when navigating away.
 */
export default function ViewportManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if the current path is for a book page.
    const isBookPage = /^\/library\/.+/.test(pathname);

    // If we are on a book page, the BookReader component will set the overflow to hidden.
    // If we are on ANY OTHER page, we ensure the overflow is set back to 'auto'.
    // This hook runs on every navigation change, guaranteeing the correct state.
    if (!isBookPage) {
      document.body.style.overflow = 'auto';
    }
  }, [pathname]); // Re-run this effect every time the user navigates.

  return null; // This component does not render anything.
}