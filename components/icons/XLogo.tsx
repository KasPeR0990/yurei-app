'use client';

import { motion, useAnimation } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export interface XLogoHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

const pathVariants: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
  hover: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const XLogo = forwardRef<XLogoHandle, HTMLAttributes<SVGSVGElement>>((props, ref) => {
  const controls = useAnimation();
  const isAnimating = useRef(false);

  useImperativeHandle(ref, () => ({
    startAnimation: () => {
      if (!isAnimating.current) {
        isAnimating.current = true;
        controls.start('hover');
      }
    },
    stopAnimation: () => {
      isAnimating.current = false;
      controls.start('normal');
    },
  }));

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (props.onMouseEnter) {
        props.onMouseEnter(e);
      }
      if (!isAnimating.current) {
        controls.start('hover');
      }
    },
    [controls, props]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (props.onMouseLeave) {
        props.onMouseLeave(e);
      }
      controls.start('normal');
    },
    [controls, props]
  );

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.path
        initial="normal"
        animate={controls}
        variants={pathVariants}
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
});

XLogo.displayName = 'XLogo';

export default XLogo;