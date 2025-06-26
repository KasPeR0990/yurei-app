'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { UserCircle } from '@phosphor-icons/react';
import { LinkedinLogo } from '@phosphor-icons/react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface LinkedInResult {
    id: string;
    url: string;
    title?: string;
    author?: string;
    publishedDate?: string;
    text?: string;
    highlights?: string[];
    image?: string;
    postId: string;
  }
  


interface LinkedinSearchResponse {
    results: LinkedInResult[];
  }
  

interface LinkedinCardProps {
    post: LinkedInResult;
    index: number;
}


const LinkedInCard: React.FC<LinkedinCardProps> = ({ post, index }) => {
    const formattedDate = post.publishedDate ? new Date(post.publishedDate).toLocaleDateString('en-US') : 'Unknown date';
  
    const authorName = post.author && !/^\d+(\sfollowers)?$/i.test(post.author) ? post.author : 'LinkedIn User';
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="w-[280px] flex-shrink-0 relative rounded-md dark:bg-neutral-800 bg-white overflow-hidden shadow-md"
        style={{ borderRadius: '7px' }}
      >
        <div className="p-4 flex items-start space-x-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            {post.author ? (
              <img src="/placeholder-profile.png" alt={post.author} className="w-full h-full object-cover" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
            ) : null}
            <div className="absolute w-full h-full flex items-center justify-center">
              <UserCircle size={32} weight="regular" />
            </div>
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">{authorName}</span>
            <div className="flex items-center space-x-1 text-xs text-neutral-500 dark:text-neutral-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 16 16"
                style={{ display: 'block' }}
              >
                <path
                  d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.55.55A1.5 1.5 0 015 6.62v1.07a.75.75 0 00.22.53l.56.56a.75.75 0 00.53.22H7v.69a.75.75 0 00.22.53l.56.56a.75.75 0 01.22.53V13a5 5 0 01-5-5zm6.24 4.83l2-2.46a.75.75 0 00.09-.8l-.58-1.16A.76.76 0 0010 8H7v-.19a.51.51 0 01.28-.45l.38-.19a.74.74 0 01.68 0L9 7.5l.38-.7a1 1 0 00.12-.48v-.85a.78.78 0 01.21-.53l1.07-1.09a5 5 0 01-1.54 9z"
                  fill="white"
                />
              </svg>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
  
        {/* ... rest of the component remains the same ... */}
  
        <div className="p-4">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <p className="text-sm text-neutral-800 dark:text-neutral-100 mb-2 line-clamp-4">
                  {post.text || post.title || 'LinkedIn post'}
                </p>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="overflow-hidden" style={{ border: '1px solid #171717' }}>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                {post.text || post.title || 'LinkedIn post'}
              </p>
            </HoverCardContent>
          </HoverCard>
  
          {post.image && (
            <div className="mt-3 rounded-md overflow-hidden">
              <img src={post.image} alt="Post image" className="w-full h-auto" />
            </div>
          )}
  
          {post.highlights && post.highlights.length > 0 && (
            <div className="mt-3">
              {post.highlights.map((highlight, i) => (
                <span key={i} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded px-2 py-0.5 mr-1 mb-1 text-xs">
                  {highlight}
                </span>
              ))}
            </div>
          )}
  
          <div className="mt-3 flex items-center justify-start space-x-4 text-neutral-600 dark:text-neutral-400 text-sm">
            <button className="flex items-center space-x-1">
              <ThumbsUp size={20} className="lucide lucide-thumbs-up" />
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-1">
              <MessageSquare size={20} className="lucide lucide-message-square" />
              <span>Comment</span>
            </button>
            <button className="flex items-center space-x-1">
              <Share2 size={20} className="lucide lucide-share" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };
  
export const LinkedinSearch: React.FC<{
    result?: LinkedinSearchResponse;
}> = ({result}) => {
    if(!result){
        return null;
    }

    const PREVIEW_COUNT = 2;
    
    const FullLinkedInList = React.memo(() => (
        <div className="grid gap-4 p-4 sm:max-w-[500px]">
            {result.results.map((post: LinkedInResult, idx: number) => (
                <div
                    key={post.id + '-' + idx}
                    className="linkedin-post-container"
                >
                    <LinkedInCard post={post} index={idx} />
                </div>
            ))}
        </div>
    ));
    FullLinkedInList.displayName = "FullLinkedInList";

    return (
        <Card className="w-full my-4 overflow-hidden shadow-none">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full dark:bg-neutral-900 flex items-center justify-center">
                        <LinkedinLogo className="h-4 w-4" />
                    </div>
                    <div>
                        <CardTitle>Latest from LinkedIn</CardTitle>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{result.results.length} posts found</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative">
                <div className="px-4 pb-2 h-72">
                    <div className="flex justify-center overflow-hidden">
                        <div className="w-[calc(280px*3+1rem*2)] mx-auto">
                            <div className="flex overflow-x-auto gap-4 p-3" style={{ scrollbarWidth: 'thin' }}>
                                {result.results.slice(0, PREVIEW_COUNT).map((post: LinkedInResult, idx: number) => (
                                    <div
                                        key={post.postId}
                                        className="w-[280px] flex-none linkedin-post-container"
                                    >
                                        <LinkedInCard post={post} index={idx} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-black pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-center pb-4 pt-20 bg-gradient-to-t from-white dark:from-black to-transparent">
                    <div className="hidden sm:block">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="gap-2 dark:bg-black rounded-full border-[#171717]">
                                    <LinkedinLogo className="h-4 w-4" />   
                                    Show all {result.results.length} posts
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[400px] sm:w-[600px] overflow-y-auto !p-0 !z-[70]">
                                <SheetHeader className="!mt-5 !font-sans">
                                    <SheetTitle className="text-center">All LinkedIn Posts</SheetTitle>
                                </SheetHeader>
                                <FullLinkedInList />
                            </SheetContent>
                        </Sheet>
                    </div>
                    <div className="block sm:hidden">
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button variant="outline" className="gap-2 bg-white dark:bg-black">
                                    <LinkedinLogo className="h-4 w-4" />
                                    Show all {result.results.length} posts
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="max-h-[85vh] font-sans">
                                <DrawerHeader>
                                    <DrawerTitle>All LinkedIn Posts</DrawerTitle>
                                </DrawerHeader>
                                <div className="overflow-y-auto">
                                    <FullLinkedInList />
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}