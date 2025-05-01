'use client';

import { YoutubeIcon } from "lucide-react";
import { XLogo, RedditLogo } from '@phosphor-icons/react';

export type SearchGroupId = "x" | "reddit" | "youtube";

export const searchGroups = [
  {
    id: "x" as const,
    name: "X (Twitter)",
    description: "Search X posts and content powered by Exa",
    icon: XLogo,
    show: true,
  },
  {
    id: "reddit" as const,
    name: "Reddit",
    description: "Search Reddit posts and content powered by Exa",
    icon: RedditLogo,
    show: true,
  },
  {
    id: "youtube" as const,
    name: "YouTube",
    description: "Search YouTube videos and channels",
    icon: YoutubeIcon,
    show: true,
  },
] as const;

export type SearchGroup = typeof searchGroups[number];