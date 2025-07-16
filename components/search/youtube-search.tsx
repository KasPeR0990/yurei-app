'use client';


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Link from "next/link";
import { YoutubeIcon, PlayIcon } from 'lucide-react';

import { cn } from "@/utils/utils";

interface VideoDetails {
    title?: string;
    author_name?: string;
    author_url?: string;
    thumbnail_url?: string;
    type?: string;
    provider_name?: string;
    provider_url?: string;
  }
  
  interface VideoResult {
    videoId: string;
    url: string;
    details?: VideoDetails;
    captions?: string;
    timestamps?: string[];
    views?: string;
    likes?: string;
    summary?: string;
  }
  
  


interface YouTubeSearchResponse {
    results: VideoResult[];
  }
  

interface YouTubeCardProps {
    video: VideoResult;
    index: number;
  }
  



const YouTubeCard: React.FC<YouTubeCardProps> = ({ video, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    if (!video) return null;
  
    const formatTimestamp = (timestamp: string) => {
      const match = timestamp.match(/(\d+:\d+(?::\d+)?) - (.+)/);
      if (match) {
        const [_, time, description] = match;
        return { time, description };
      }
      return { time: "", description: timestamp };
    };
  
    const handleScrollableAreaEvents = (e: React.UIEvent) => {
      e.stopPropagation();
    };
  
    return (
      <div
        className="w-[280px] flex-shrink-0 rounded-lg border dark:border-neutral-800 border-neutral-200 overflow-hidden bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow duration-200"
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Link
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-video block bg-neutral-100 dark:bg-neutral-800 overflow-hidden rounded-lg"
          aria-label={`Watch ${video.details?.title || "YouTube video"}`}
        >
          {video.details?.thumbnail_url ? (
            <img
              src={video.details.thumbnail_url}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center ">
              <YoutubeIcon className="h-8 w-8 text-red-500 " />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 ">
              {video.details?.title || "YouTube Video"}
            </div>
            <div className="rounded-full bg-white/90 p-2">
              <PlayIcon className="h-6 w-6 text-red-600 fill-red-600" />
            </div>
          </div>
        </Link>
  
        <div className="p-3 flex flex-col gap-2">
          <div>
            <Link
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium line-clamp-2 hover:text-red-500 transition-colors dark:text-neutral-100"
            >
              {video.details?.title || "YouTube Video"}
            </Link>
  
            {video.details?.author_name && (
              <Link
                href={video.details.author_url || video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 group mt-1.5 w-fit"
                aria-label={`Channel: ${video.details.author_name}`}
              >
                <span className="text-xs text-neutral-600 dark:text-neutral-400 group-hover:text-red-500 transition-colors truncate">
                  {video.details.author_name}
                </span>
              </Link>
            )}
          </div>
  
          {(video.timestamps && video.timestamps.length > 0 || video.captions) && (
            <div className="mt-1">
              <Accordion type="single" collapsible>
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="py-1 hover:no-underline">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400">
                      {isExpanded ? "Hide details" : "Show details"}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    {video.timestamps && video.timestamps.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <h4 className="text-xs font-semibold dark:text-neutral-300 text-neutral-700">Key Moments</h4>
                        <ScrollArea className="h-[120px]">
                          <div className="pr-4">
                            {video.timestamps.map((timestamp, i) => {
                              const { time, description } = formatTimestamp(timestamp);
                              return (
                                <Link
                                  key={i}
                                  href={`${video.url}&t=${time.split(':').reduce((acc, time, i, arr) => {
                                    if (arr.length === 2) {
                                      return i === 0 ? acc + parseInt(time) * 60 : acc + parseInt(time);
                                    } else {
                                      return i === 0 ? acc + parseInt(time) * 3600 :
                                        i === 1 ? acc + parseInt(time) * 60 :
                                        acc + parseInt(time);
                                    }
                                  }, 0)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-2 py-1 px-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                  <span className="text-xs font-medium text-red-500 whitespace-nowrap">{time}</span>
                                  <span className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-1">{description}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
  
                    {video.captions && (
                      <div className="mt-3 space-y-1.5">
                        <h4 className="text-xs font-semibold dark:text-neutral-300 text-neutral-700">Transcript</h4>
                        <ScrollArea className="h-[120px]">
                          <div className="text-xs dark:text-neutral-400 text-neutral-600 rounded bg-neutral-50 dark:bg-neutral-800 p-2">
                            <p className="whitespace-pre-wrap">
                              {video.captions}
                            </p>
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </div>
    );
  };




export const YoutubeSearch: React.FC<{
    result?: YouTubeSearchResponse;
}> = ({result}) => {
    if (!result) {
        return null;
    }
    const youtubeResult = result as YouTubeSearchResponse


    return(

        <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="videos" className="border-0">
          <AccordionTrigger
            className={cn(
              "w-full dark:bg-neutral-900 bg-white rounded-xl dark:border-neutral-800 border px-6 py-4 hover:no-underline transition-all",
              "[&[data-state=open]]:rounded-b-none",
              "[&[data-state=open]]:border-b-0"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full dark:bg-neutral-800 bg-gray-100">
                <YoutubeIcon className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h2 className="dark:text-neutral-100 text-gray-900 font-medium text-left">YouTube Results</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="dark:bg-neutral-800 bg-gray-100 dark:text-neutral-300 text-gray-600 rounded-full">
                    {youtubeResult.results.length} videos
                  </Badge>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="dark:bg-neutral-900 bg-white dark:border-neutral-800 border border-t-0 rounded-b-xl">
            <div className="flex justify-center overflow-hidden">
              <div className="w-[calc(280px*3+1rem*2)] mx-auto">
                <div className="flex overflow-x-auto gap-4 p-3" style={{ scrollbarWidth: 'thin' }}>
                  {youtubeResult.results.map((video, index) => (
                    <div key={video.videoId} className="youtube-video-container">
                      <YouTubeCard key={video.videoId} video={video} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    
        );
}
        
   
