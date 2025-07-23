import * as React from "react"

export const YCombinatorIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg ref={ref}
    viewBox="0 0 256 256"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    {...props}
  >
    <rect x="40" y="40" width="176" height="176" rx="8" stroke="currentColor" strokeWidth="16" />
    <path d="M96 72l32 48 32-48" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M128 120v64" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
  </svg>
))

YCombinatorIcon.displayName = "YCombinatorIcon";

export default YCombinatorIcon
