//utils/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { YoutubeIcon } from "lucide-react";
import { XLogo, RedditLogo }  from '@phosphor-icons/react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

