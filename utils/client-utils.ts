'use client';

import { YoutubeIcon } from "lucide-react";
import { LinkedinLogo, RedditLogo } from '@phosphor-icons/react';

export type SearchGroupId = "linkedin" | "reddit" | "youtube";

export const searchGroups = [
  {
    id: "youtube" as const,
    name: "YouTube",
    description: "Search YouTube videos and channels",
    icon: YoutubeIcon,
    show: true,
  },
  {
    id: "linkedin" as const,
    name: "LinkedIn",
    description: "Search LinkedIn posts and content powered by Exa",
    icon: LinkedinLogo,
    show: true,
  },
  {
    id: "reddit" as const,
    name: "Reddit",
    description: "Search Reddit posts and content powered by Exa",
    icon: RedditLogo,
    show: true,
  },
  
] as const;

export type SearchGroup = typeof searchGroups[number];