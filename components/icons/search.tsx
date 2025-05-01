'use client';

import { forwardRef, type HTMLAttributes } from 'react';

const SearchIcon = forwardRef<SVGSVGElement, HTMLAttributes<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        ref={ref}
        {...props}
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.3 4.3" />
      </svg>
    );
  }
);

SearchIcon.displayName = 'SearchIcon';

export { SearchIcon };
