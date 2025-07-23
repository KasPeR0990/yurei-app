'use client';

import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";
import { ArrowUpRight, MessageSquare } from 'lucide-react';
import YCombinatorIcon from "../icons/YCombinatorIcon";

import {IoTriangleSharp} from 'react-icons/io5';



interface HackerNewsPost {
  id: string;
  url: string;
  title: string;
  text?: string;
  publishedDate: string;
  descendants: number;
  score: number;
  comments: number[];
  author: string;
  highlights?: string[];      
}




interface HackerNewsSearchResult {
  result?: HackerNewsPost[];
}

interface HackerNewsSearchResult {
  results: HackerNewsPost[];
}

interface HackerNewsSearchProps {
  result?: HackerNewsSearchResult;
}

export const HackerNewsSearch: React.FC<HackerNewsSearchProps> = ({ result }) => {
  if (!result) {
    return null;
  }

  const posts = result.results || [];

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="hackernews" className="border-0">
        <AccordionTrigger
          className={cn(
            "w-full dark:bg-neutral-900 bg-white rounded-xl dark:border-neutral-800 border px-6 py-4 hover:no-underline transition-all",
            "[&[data-state=open]]:rounded-b-none",
            "[&[data-state=open]]:border-b-0"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full dark:bg-neutral-800 bg-gray-100">
              <YCombinatorIcon className="h-4 w-4 text-orange-500" />
            </div>
            <span className="font-medium">Hacker News</span>
            <Badge variant="outline" className="ml-2 rounded-xl">
              {posts.length} {posts.length === 1 ? 'result' : 'results'}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-0">
          <div className="space-y-3 p-4 dark:bg-neutral-900/50 rounded-b-xl border dark:border-t-0 dark:border-neutral-800">
            {posts.map((post) => (
              <div key={post.id} className="p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 rounded-lg transition-colors">
                <div className="flex flex-col gap-1">
                  <a 
                    href={`https://news.ycombinator.com/item?id=${post.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:underline font-medium"
                  >
                   
                    {post.title}
                    <span className='gap-1'>
                      <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                    </span>
                  </a>
                </div>
                <div className="mt-1.5 flex items-center text-xs text-muted-foreground gap-3">
                  <span className="flex items-center gap-1">
                    <IoTriangleSharp className="h-3.5 w-3.5" />
                    <span>{post.score || 0}</span>
                    <span className="ml-1">points</span>
                  </span>
                  <span>by {post.author}</span>
                  {post.descendants > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.descendants}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};