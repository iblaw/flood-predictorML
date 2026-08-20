"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useContext } from 'react';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const [frozen] = useState(context);

  if (!frozen) {
    return <>{children}</>;
  }

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

const getRouteIndex = (path: string) => {
  if (path === '/') return 0;
  if (path.startsWith('/forecasts')) return 1;
  if (path.startsWith('/about')) return 2;
  return 0;
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState(pathname);
  const [prevPathname, setPrevPathname] = useState(pathname);
  
  if (pathname !== currentPath) {
    setPrevPathname(currentPath);
    setCurrentPath(pathname);
  }

  const currentIndex = getRouteIndex(pathname);
  const prevIndex = getRouteIndex(prevPathname);
  
  const direction = currentIndex < prevIndex ? -1 : 1;

  const variants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40
    }),
    animate: {
      opacity: 1,
      x: 0
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -40 : 40
    })
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pathname}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col flex-1 h-full w-full"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
