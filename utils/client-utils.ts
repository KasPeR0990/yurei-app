'use client';

import { YoutubeIcon } from "lucide-react";
import { RedditLogo } from '@phosphor-icons/react';
import YCombinatorIcon from "@/components/icons/YCombinatorIcon";
export type SearchGroupId = "hackernews" | "reddit" | "youtube";

export const searchGroups = [
  {
    id: "youtube" as const,
    name: "YouTube",
    description: "Search YouTube videos and channels",
    icon: YoutubeIcon,
    show: true,
  },
  {
    id: "hackernews" as const,
    name: "HackerNews",
    description: "Search HackerNews powered by Exa",
    icon: YCombinatorIcon,
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