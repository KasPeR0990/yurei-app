"use client"

import { memo, useCallback, useMemo } from 'react';
import { YoutubeIcon } from 'lucide-react';
import { RedditLogo } from '@phosphor-icons/react';
import YCombinatorIcon from '@/components/icons/YCombinatorIcon';
import { ToolInvocation } from 'ai';
import { YoutubeSearch } from '@/components/search/youtube-search';
import { RedditSearch } from '@/components/search/reddit-search';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/utils";
import { LucideIcon } from "lucide-react";
import { HackerNewsSearch } from './search/hackernews-search';



const SearchLoadingState = ({
    icon: Icon,
    text,
    color
  }: {
    icon: LucideIcon,
    text: string,
    color: "red" | "green" | "orange" | "violet" | "gray" | "blue"
  }) => {
    const colorVariants = {
      red: {
        text: "text-red-500",
        icon: "text-red-500"
      },
      green: {
        text: "text-green-500",
        icon: "text-green-500"
      },
      orange: {
        text: "text-orange-500",
        icon: "text-orange-500"
      },
      violet: {
        text: "text-violet-500",
        icon: "text-violet-500"
      },
      gray: {
        text: "text-neutral-500",
        icon: "text-neutral-500"
      },
      blue: {
        text: "text-blue-500",
        icon: "text-blue-500"
      }
    };
  
    const variant = colorVariants[color];
  
    return (
      <Card className="relative w-full h-[100px] my-4 overflow-hidden shadow-none border-0">
        <CardContent className="p-6">
          <div className="relative flex justify-between">
            <div className="flex gap-3">
              <div className={cn(
                "relative h-10 w-10 rounded-full flex items-center justify-center",
                variant.text
              )}>
                <Icon className={cn("h-5 w-5", variant.icon)} />
              </div>
              <div className="space-y-2">
                <p className="text-base font-medium">
                  {text}
                </p>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full  dark:bg-neutral-700 animate-pulse"
                      style={{
                        width: `${Math.random() * 40 + 20}px`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };




type Props = {
  toolInvocations: ToolInvocation[];
  /* the parent message is needed only so React re-renders
     if this particular assistant message updates */
  message: any;
};

const ToolInvocationListView = memo(({ toolInvocations, message }: Props) => {
  /* stable keys so React doesn’t complain when array length changes */
  const stableKeys = useMemo(
    () => toolInvocations.map(() => crypto.randomUUID()),
    [toolInvocations.length]
  );

  const render = useCallback(
    (ti: ToolInvocation) => {
      const args    = JSON.parse(JSON.stringify(ti.args));
      const result  = 'result' in ti ? JSON.parse(JSON.stringify(ti.result)) : null;

      if (ti.toolName === 'hackernews_search') {
        console.log('HackerNews search result:', { result, hasResult: !!result });
        if (result) {
          try {
            // Ensure result has the expected structure
            const formattedResult = result.results ? result : { results: [] };
            console.log('Rendering HackerNews results:', formattedResult);
            return <HackerNewsSearch result={formattedResult} />;
          } catch (error) {
            console.error('Error rendering HackerNews results:', error);
            return (
              <div className="text-red-500 p-4">
                Error displaying HackerNews results. Please try again.
              </div>
            );
          }
        }
        return (
          <SearchLoadingState
            icon={YCombinatorIcon}
            text="Searching HackerNews for latest posts..."
            color="orange"
          />
        );
      } 

      if (ti.toolName === 'youtube_search')
        return result
          ? <YoutubeSearch result={result} />
          : <SearchLoadingState icon={YoutubeIcon} text="Loading YouTube results…" color="red" />;

      if (ti.toolName === 'reddit_search')
        return result
          ? <RedditSearch result={result} args={args} />
          : <SearchLoadingState icon={RedditLogo} text="Searching Reddit…" color="orange" />;

      return null;
    },
    []
  );

  return (
    <>
      {toolInvocations.map((ti, i) => (
        <div key={stableKeys[i]}>{render(ti)}</div>
      ))}
    </>
  );
}, (p, n) => p.toolInvocations === n.toolInvocations && p.message === n.message);

export default ToolInvocationListView;