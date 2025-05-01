'use client';

import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

const LayersIcon = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    return (
      <div ref={ref} {...props}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.91a1 1 0 0 0 0-1.83Z"/>
          <path d="m22 13.29-9.58 4.36a2 2 0 0 1-1.66 0L2 13.29"/>
          <path d="m22 17.29-9.58 4.36a2 2 0 0 1-1.66 0L2 17.29"/>
        </svg>
      </div>
    );
  }
);

LayersIcon.displayName = 'LayersIcon';

export { LayersIcon };
