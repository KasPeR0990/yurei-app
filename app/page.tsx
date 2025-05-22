'use client';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { track } from '@vercel/analytics';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { memo, useCallback, useMemo, useState, useEffect, Suspense, useRef } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YoutubeIcon, PlayIcon, LucideIcon, Moon, Sun, ArrowRight, X, Copy, Github, Plus, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { InstallPrompt } from "@/components/install-prompt";
import { XLogo, RedditLogo, LinkedinLogo, UserCircle } from '@phosphor-icons/react';
import FormComponent from "@/components/form-component";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat, UseChatOptions } from "@ai-sdk/react";
import { Separator } from "@/components/ui/separator";
import { SearchGroupId } from "@/utils/client-utils";
import Marked, { ReactRenderer } from 'marked-react';
import { TypeAnimation } from "react-type-animation";
import { parseAsString, useQueryState } from 'nuqs';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from 'framer-motion';
import { ToolInvocation } from "ai";
import { Tweet } from "react-tweet";
import { cn } from "@/utils/utils";
import { toast } from 'sonner';
import Image from 'next/image';
import Link from "next/link";
import React from "react";
import Latex from 'react-latex-next';
import { BuyCoffee } from "@/components/buy-coffee"
import { LinkedInEmbed } from 'react-social-media-embed';
import { Coffee } from "lucide-react";
import { RedditSearch } from "@/components/reddit-search";

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
interface RedditResult {
  id: string;
  url: string;
  title: string;
  text: string;
  publishedDate?: string;
  highlights?: string[];
  postId: string;
  community: string;
}

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
            <PlayIcon className="h-6 w-6 text-red-600" />
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


const LinkedInCard: React.FC<{ post: LinkedInResult; index: number }> = ({ post, index }) => {
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


// const RedditCard: React.FC<{ post: RedditResult; index: number }> = ({ post, index }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.3, delay: index * 0.1 }}
//     className="w-[280px] h-[200px] flex-shrink-0 relative rounded-xl dark:bg-neutral-800/50 overflow-hidden"
//   >
//     {/* Reddit community above content */}
//     <div className="absolute top-4 left-4 z-0 flex flex-col items-start gap-0.5">
//       {post.community ? (
//         <span className="text-[12px] text-neutral-500 dark:text-neutral-400 font-geist-mono">
//           r/{post.community}
//         </span>
//       ) : (
//         <span className="text-[12px] text-neutral-500 dark:text-neutral-400 font-geist-mono">r/unknown</span>
//       )}
//     </div>

//     <div className="p-4 pt-16 flex flex-col gap-2">
//       <div className="space-y-2">
//         <HoverCard>
//           <HoverCardTrigger asChild>
//             <Link
//               href={post.url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-base font-semibold line-clamp-2 hover:text-orange-500 transition-colors dark:text-neutral-100 font-geist-mono"
//             >
//               {post.title || "Reddit Post"}
//             </Link>
//           </HoverCardTrigger>
//           <HoverCardContent className="overflow-hidden" style={{ border: '1px solid #171717' }}>
//             <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
//               {post.text || post.title || 'Reddit post'}
//             </p>
//           </HoverCardContent>
//         </HoverCard>
//         {/* Breadtext under headline */}
//         {post.text && post.text.trim() !== post.title.trim() && (
//           <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 font-geist-mono">
//             {post.text.length > 100 ? post.text.slice(0, 100) + '…' : post.text}
//           </p>
//         )}
//       </div>
//     </div>
//   </motion.div>
// );

const HomeContent = () => {
  const [query] = useQueryState('query', parseAsString.withDefault(''));
  const [q] = useQueryState('q', parseAsString.withDefault(''));
  const initialState = useMemo(() => ({
    query: query || q,
  }), [query, q]);

  const [selectedGroup, setSelectedGroup] = useState<SearchGroupId>('youtube');
  const initializedRef = useRef(false);
  const lastSubmittedQueryRef = useRef(initialState.query);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useState(-1);

  const [hasManuallyScrolled, setHasManuallyScrolled] = useState(false);
  const isAutoScrollingRef = useRef(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  const [showBuyCoffee, setShowBuyCoffee] = useState(false);

  const chatOptions: UseChatOptions = useMemo(
    () => ({
      api: '/api/search',
      experimental_throttle: 1000,
      body: { group: selectedGroup },
      onFinish: (message) => {
        // Track analytics event when user search is completed
        if (message.role === 'user') {
          track('search', {
            query: message.content,
            group: selectedGroup,
           
          });
        }
      },
      onError: (error) => {
        console.log('Chat error:', error);
        // Check for status on error if present, or fallback to message string
        if (  
          (typeof (error as any).status === "number" && (error as any).status === 429) ||
          error?.message?.includes("429")
        ) {
          setShowBuyCoffee(true);
          return;
        }
        console.error('Chat error:', error);
        toast.error('An error occurred.', { description: error.message });
      },
    }),
    [selectedGroup]
  );

  const {
    input,
    messages,
    setInput,
    append,
    handleSubmit,
    setMessages,
    reload,
    stop,
    status,
  } = useChat(chatOptions);

  // const ThemeToggle: React.FC = () => {
  //   const { resolvedTheme, setTheme } = useTheme();

  //   return (
  //     <Button
  //       variant="ghost"
  //       size="icon"
  //       onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
  //       className="bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800"
  //     >
  //       <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
  //       <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
  //       <span className="sr-only">Toggle theme</span>
  //     </Button>
  //   );
  // };

  interface MarkdownRendererProps {
    content: string;
  }

  interface CitationLink {
    text: string;
    link: string;
  }

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const citationLinks = useMemo<CitationLink[]>(() => {
      return Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map(match => {
        const text = match[1]?.trim() || '';
        const link = match[2]?.trim() || '';
        return { text, link };
      });
    }, [content]);

    const stableKey = useMemo(() => {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }, []);

    const LinkPreview = ({ href, title }: { href: string, title?: string }) => {
      const domain = new URL(href).hostname;

      return (
          <div className="flex flex-col bg-white dark:bg-neutral-800 text-xs m-0">
              <div className="flex items-center h-6 space-x-1.5 px-2 pt-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <Image
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                      alt=""
                      width={12}
                      height={12}
                      className="rounded-sm"
                  />
                  <span className="truncate font-medium">{domain}</span>
              </div>
              {title && (
                  <div className="px-2 pb-2 pt-1">
                      <h3 className="font-normal text-sm m-0 text-neutral-700 dark:text-neutral-200 line-clamp-3">
                          {title}
                      </h3>
                  </div>
              )}
          </div>
      );
  };

    const renderHoverCard = (href: string, text: React.ReactNode, isCitation: boolean = false, citationText?: string) => {
      const title = citationText || (typeof text === 'string' ? text : '');

      return (
        <HoverCard openDelay={10}>
          <HoverCardTrigger asChild>
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={isCitation
                ? "cursor-pointer text-xs text-primary py-0.5 px-1.5 m-0 bg-primary/10 dark:bg-primary/20 rounded-full no-underline font-medium"
                : "text-primary dark:text-primary-light no-underline hover:underline font-medium"}
            >
              {text}
            </Link>
          </HoverCardTrigger>
          <HoverCardContent
            side="top"
            align="start"
            sideOffset={5}
            className="w-56 p-0 shadow-sm border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden"
          >
            <LinkPreview href={href} title={title} />
          </HoverCardContent>
        </HoverCard>
      );
    };

    const generateKey = () => {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const renderer: Partial<ReactRenderer> = {
      text(text: string) {
        if (!text.includes('$')) return text;
        return (
          <Latex
            key={generateKey()}
            delimiters={[
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ]}
          >
            {text}
          </Latex>
        );
      },
      paragraph(children) {
        return <div key={generateKey()} className="my-5 leading-relaxed text-neutral-700 dark:text-neutral-300">{children}</div>;
      },
      link(href, text) {
        const citationIndex = citationLinks.findIndex(link => link.link === href);
        if (citationIndex !== -1) {
          const citationText = citationLinks[citationIndex].text;
          return (
            <sup key={generateKey()}>
              {renderHoverCard(href, citationIndex + 1, true, citationText)}
            </sup>
          );
        }
        return isValidUrl(href)
          ? renderHoverCard(href, text)
          : <a href={href} className="text-primary dark:text-primary-light hover:underline font-medium">{text}</a>;
      },
      heading(children, level) {
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const sizeClasses = {
          1: "text-2xl md:text-3xl font-extrabold mt-8 mb-4",
          2: "text-xl md:text-2xl font-bold mt-7 mb-3",
          3: "text-lg md:text-xl font-semibold mt-6 mb-3",
          4: "text-base md:text-lg font-medium mt-5 mb-2",
          5: "text-sm md:text-base font-medium mt-4 mb-2",
          6: "text-xs md:text-sm font-medium mt-4 mb-2",
        }[level] || "";

        return (
          <HeadingTag key={generateKey()} className={`${sizeClasses} text-neutral-900 dark:text-neutral-50 tracking-tight`}>
            {children}
          </HeadingTag>
        );
      },
      list(children, ordered) {
        const ListTag = ordered ? 'ol' : 'ul';
        return (
          <ListTag key={generateKey()} className={`my-5 pl-6 space-y-2 text-neutral-700 dark:text-neutral-300 ${ordered ? 'list-decimal' : 'list-disc'}`}>
            {children}
          </ListTag>
        );
      },
      listItem(children) {
        return <li key={generateKey()} className="pl-1 leading-relaxed">{children}</li>;
      },
      blockquote(children) {
        return (
          <blockquote key={generateKey()} className="my-6 border-l-4 border-primary/30 dark:border-primary/20 pl-4 py-1 text-neutral-700 dark:text-neutral-300 italic bg-neutral-50 dark:bg-neutral-900/50 rounded-r-md">
            {children}
          </blockquote>
        );
      },
      table(children) {
        return (
          <div key={generateKey()} className="w-full my-8 overflow-hidden">
            <div className="w-full overflow-x-auto rounded-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <table className="w-full table-auto divide-y divide-neutral-200 dark:divide-neutral-800 m-0 ">
                {children}
              </table>
            </div>
        </div>
        );
      },
      tableRow(children) {
        return (
          <tr key={generateKey()} className="transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50">
            {children}
          </tr>
        );
      },
      tableCell(children, flags) {
        const align = flags.align ? `text-${flags.align}` : 'text-left';
        const isHeader = flags.header;

        const CellTag = isHeader ? 'th' : 'td';
        const classes = isHeader ?
          cn(
            "px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-neutral-100",
            "bg-neutral-50/80 dark:bg-neutral-800/80",
            "first:pl-6 last:pr-6",
            "w-auto min-w-[120px]",
            align
          ) :
          cn(
            "px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300",
            "first:pl-6 last:pr-6",
            "w-auto min-w-[120px] max-w-[300px]",
            align
          );

        return (
          <CellTag key={generateKey()} className={classes}>
            <div className="break-words">{children}</div>
          </CellTag>
        );
      },
      tableHeader(children) {
        return (
          <thead key={generateKey()} className="sticky top-0 z-10">
            {children}
          </thead>
        );
      },
      tableBody(children) {
        return (
          <tbody key={generateKey()} className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-transparent">
            {children}
          </tbody>
        );
      },
    };

    return (
      <div 
        key={stableKey}
        className="markdown-body prose prose-xl dark:prose-invert dark:text-neutral-200 font-sans mx-auto" 
        style={{ 
          fontSize: "1.1rem", 
          lineHeight: "1.75", 
          width: "100%",
          minHeight: "inherit",
          position: "relative",
          willChange: "contents",
          contentVisibility: "auto",
        }}
      >
        <Marked renderer={renderer}>
          {content}
        </Marked>
      </div>
    );
  };




  
  const lastUserMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return i;
      }
    }
    return -1;
  }, [messages]);

  useEffect(() => {
    if (status === 'streaming' && !hasManuallyScrolled) {
      setHasManuallyScrolled(false);
      if (bottomRef.current) {
        isAutoScrollingRef.current = true;
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [status]);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      if (!isAutoScrollingRef.current && status === 'streaming') {
        const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
        if (!isAtBottom) {
          setHasManuallyScrolled(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    if (status === 'streaming' && !hasManuallyScrolled && bottomRef.current) {
      scrollTimeout = setTimeout(() => {
        isAutoScrollingRef.current = true;
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          isAutoScrollingRef.current = false;
        }, 100);
      }, 100);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [messages, status, hasManuallyScrolled]);

  const handleMessageEdit = useCallback((index: number) => {
    setIsEditingMessage(true);
    setEditingMessageIndex(index);
    setInput(messages[index].content);
  }, [messages, setInput]);

  const handleMessageUpdate = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      const newMessages = messages.slice(0, editingMessageIndex + 1);
      newMessages[editingMessageIndex] = { ...newMessages[editingMessageIndex], content: input.trim() };
      setMessages(newMessages);
      setIsEditingMessage(false);
      setEditingMessageIndex(-1);
      lastSubmittedQueryRef.current = input.trim();
      setInput('');
      reload();
    } else {
      toast.error("Please enter a valid message.");
    }
  }, [input, messages, editingMessageIndex, setMessages, setInput, reload]);



  interface NavbarProps { }

  const Navbar: React.FC<NavbarProps> = () => {
    return (
      <div className={cn(
        "fixed top-0 left-0 right-0 z-[60] flex justify-between items-center p-4",
        status === 'ready' ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "bg-background",
      )}>
        <div className="flex items-center gap-4">
          <div className="ml-4">
            <Image
              src="/yurei-ghost.svg"
              alt="Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>
          <Link href="/new">
            <Button
              type="button"
              variant={'secondary'}
              className="rounded-full bg-accent hover:bg-accent/80 backdrop-blur-sm group transition-all hover:scale-105 pointer-events-auto"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-all" />
              <span className="text-sm ml-2 group-hover:block hidden animate-in fade-in duration-300">
                New
              </span>
            </Button>
          </Link>
        </div>

        <div className='flex items-center space-x-4'>
          <a
            href="https://buymeacoffee.com/kasper0990"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-sm font-medium px-3 py-1.5 rounded-xl bg-neutral-1000 hover:bg-neutral-700 text-neutral-100 transition-colors"
            aria-label="Buy Me a Coffee"
          >
            <Coffee className="h-4 w-4" />
            <span>Buy me a coffee</span>
          </a>
          <a
            href="https://github.com/Kasper0990"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/50 hover:text-foreground/80 transition-colors"
            aria-label="GitHub Profile"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://x.com/Kasper0990"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/50 hover:text-foreground/80 transition-colors"
            aria-label="X (Twitter) Profile"
          >
            <XLogo className="h-5 w-5" style={{ width: '18px', height: '18px' }} />
          </a>
          {/* <ThemeToggle /> */}
        </div>
      </div>
    );
  };

  const TypingAnimation = () => {
    return (
      <TypeAnimation
        sequence={[
          "Who is Kasper0990?",
          1500,
          "",
          500,
          "What is vibe-coding?",
          1500,
          "",
          500,
          "Latest news on AI",
          1500,
          "",
          500
        ]}
        wrapper="span"
        speed={50}
        cursor={true}
        repeat={Infinity}
        className="text-neutral-500"
      />
    );
  };

  const handleSearchSubmit = useCallback(
    (query: string, group: SearchGroupId) => {
      // Track custom search event
      track('search', { query, group });
      setSelectedGroup(group);
      lastSubmittedQueryRef.current = query;
      append({ content: query, role: 'user' });
      setHasSubmitted(true);
    },
    [append]
  );

  useEffect(() => {
    if (!initializedRef.current && initialState.query && !messages.length) {
      initializedRef.current = true;
      console.log("[initial query]:", initialState.query);
      append({
        content: initialState.query,
        role: 'user'
      });
    }
  }, [initialState.query, append, setInput, messages.length]);

  return (
    <div className="flex flex-col !font-sans items-center min-h-screen bg-background text-foreground transition-all duration-500">
      <Navbar />

      <div className={`w-full p-2 sm:p-4 ${status === 'ready' && messages.length === 0
        ? 'min-h-screen flex flex-col items-center justify-center'
        : 'mt-20 sm:mt-16'
        }`}>
        <div className={`w-full max-w-[90%] !font-sans sm:max-w-2xl mx-auto space-y-6 p-0 transition-all duration-300`}>
          {status === 'ready' && messages.length === 0 && (
            <div className="text-center !font-sans">
              <h1 className="text-2xl sm:text-4xl mb-6 text-neutral-800 dark:text-neutral-100 font-syne">
                What do you want to explore?
              </h1>
            </div>
          )}
          <AnimatePresence>
            {messages.length === 0 && !hasSubmitted && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className={cn('!mt-4')}
              >
                <FormComponent
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  inputRef={inputRef}
                  stop={stop}
                  messages={messages as any}
                  append={append}
                  lastSubmittedQueryRef={lastSubmittedQueryRef}
                  selectedGroup={selectedGroup}
                  setSelectedGroup={setSelectedGroup}
                  status={status}
                  setHasSubmitted={setHasSubmitted}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {messages.length === 0 && (
            <div></div>
          )}

          <div className="space-y-4 sm:space-y-6 mb-32">
            {messages.map((message, index) => (
              <div key={message.id || index} className={`${
                message.role === 'assistant' && index < messages.length - 1
                  ? '!mb-12 border-b border-neutral-200 dark:border-neutral-800'
                  : ''
                }`.trim()}>
                {message.role === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 px-0"
                  >
                    <div className="flex-grow min-w-0">
                      {isEditingMessage && editingMessageIndex === index ? (
                        <form onSubmit={handleMessageUpdate} className="w-full">
                          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                Edit Query
                              </span>
                              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-[9px] border border-neutral-200 dark:border-neutral-700 flex items-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setIsEditingMessage(false);
                                    setEditingMessageIndex(-1);
                                    setInput('');
                                  }}
                                  className="h-7 w-7 !rounded-l-lg !rounded-r-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                  disabled={status === 'submitted' || status === 'streaming'}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-7 bg-neutral-200 dark:bg-neutral-700" />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 !rounded-r-lg !rounded-l-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                  disabled={status === 'submitted' || status === 'streaming'}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={3}
                                className="w-full resize-none rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 text-base text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Edit your message..."
                              />
                            </div>
                          </div>
                        </form>
                      ) : (
                        <div className="group relative">
                          <div className="relative">
                            <p className="text-xl font-medium font-sans break-words text-neutral-900 dark:text-neutral-100 pr-10 sm:pr-12">
                              {message.content}
                            </p>
                            {!isEditingMessage && index === lastUserMessageIndex && (
                              <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent rounded-[9px] border border-neutral-200 dark:border-neutral-700 flex items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMessageEdit(index)}
                                  className="h-7 w-7 !rounded-l-lg !rounded-r-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                  disabled={status === 'submitted' || status === 'streaming'}
                                >
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L9.94915 6.83442L13.5382 3.24535L12.5 2.20711ZM8.99997 1.49997C9.27611 1.49997 9.49997 1.72383 9.49997 1.99997C9.49997 2.27611 9.27611 2.49997 8.99997 2.49997H4.49997C3.67154 2.49997 2.99997 3.17154 2.99997 3.99997V11C2.99997 11.8284 3.67154 12.5 4.49997 12.5H11.5C12.3284 12.5 13 11.8284 13 11V6.49997C13 6.22383 13.2238 5.99997 13.5 5.99997C13.7761 5.99997 14 6.22383 14 6.49997V11C14 12.3807 12.8807 13.5 11.5 13.5H4.49997C3.11926 13.5 1.99997 12.3807 1.99997 11V3.99997C1.99997 2.61926 3.11926 1.49997 4.49997 1.49997H8.99997Z"
                                      fill="currentColor"
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </Button>
                                <Separator orientation="vertical" className="h-7" />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    navigator.clipboard.writeText(message.content);
                                    toast.success("Copied to clipboard");
                                  }}
                                  className="h-7 w-7 !rounded-r-lg !rounded-l-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {message.role === 'assistant' && (
                  <>
                    <ToolInvocationListView
                      toolInvocations={message.toolInvocations || []}
                      message={message}
                    />
                    {message.content && (() => {
                      // Pre-process content: Add newline after a period if followed by markdown heading hashes (#)
                      // This specifically targets the pattern ".## Heading" or ".### Heading" etc.
                      const processedContent = message.content.replace(/\.(#+ )/g, '.\n$1');

                      return (
                        <div className="ai-message">
                          {/* Pass the processed string to the renderer */}
                          <MarkdownRenderer content={processedContent} />
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <AnimatePresence>
            {(messages.length > 0 || hasSubmitted) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="fixed bottom-4 left-0 right-0 w-full max-w-[90%] sm:max-w-2xl mx-auto z-20"
              >
                <div className={showBuyCoffee ? "filter blur-md transition-all duration-300" : ""}>
                  <FormComponent
                    input={input}
                    setInput={setInput}
                    handleSubmit={handleSubmit}
                    inputRef={inputRef}
                    stop={stop}
                    messages={messages as any}
                    append={append}
                    lastSubmittedQueryRef={lastSubmittedQueryRef}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    status={status}
                    setHasSubmitted={setHasSubmitted}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {showBuyCoffee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <BuyCoffee setShowBuyCoffee={setShowBuyCoffee} />
        </div>
      )}
    </div>
  );
};

const LoadingFallback = () => (
  <div className="flex justify-center min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="relative w-12 h-12">
        <div className="absolute border-4 border-neutral-200 dark:border-neutral-800" />
        <div className="absolute border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">
        Loading...
      </p>
    </div>
  </div>
);

// Buy me a coffe card
const ToolInvocationListView = memo(
  ({ toolInvocations, message }: { toolInvocations: ToolInvocation[]; message: any }) => {
    const stableKeys = useMemo(() => {
      return toolInvocations.map(() => Math.random().toString(36).substring(2, 15));
    }, [toolInvocations.length]); // Only recreate if the number of invocations changes
    
    const renderToolInvocation = useCallback(
      (toolInvocation: ToolInvocation, index: number) => {
        const args = JSON.parse(JSON.stringify(toolInvocation.args));
        const result = "result" in toolInvocation ? JSON.parse(JSON.stringify(toolInvocation.result)) : null;

        if (toolInvocation.toolName === "linkedin_search") {
          if (!result) {
            return <SearchLoadingState
              icon={LinkedinLogo}
              text="Searching LinkedIn for latest posts..."
              color="blue"
            />;
          }

          const PREVIEW_COUNT = 2;
          const FullLinkedInList = memo(() => (
            <div className="grid gap-4 p-4 sm:max-w-[500px]">
              {result.map((post: LinkedInResult, idx: number) => (
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
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{result.length} posts found</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="px-4 pb-2 h-72">
                  <div className="flex justify-center overflow-hidden">
                    <div className="w-[calc(280px*3+1rem*2)] mx-auto">
                      <div className="flex overflow-x-auto gap-4 p-3" style={{ scrollbarWidth: 'thin' }}>
                        {result.slice(0, PREVIEW_COUNT).map((post: LinkedInResult, idx: number) => (
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
                          Show all {result.length} posts
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
                          Show all {result.length} posts
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

        if (toolInvocation.toolName === "youtube_search") {
          if (!result) {
            return <SearchLoadingState
              icon={YoutubeIcon}
              text="Loading YouTube results..."
              color="red"
            />;
          }

          const youtubeResult = result as YouTubeSearchResponse;

          return (
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
        if (toolInvocation.toolName === 'reddit_search') {
          if (!result) {
              return <SearchLoadingState
                  icon={RedditLogo}
                  text="Searching Reddit..."
                  color="orange"
              />;
          }
          
          return <RedditSearch result={result} args={args} />;
      }

      return null;
  },
  [message]
);
    //       const FullRedditList = memo(({ mode = "preview" }: { mode?: "preview" | "full" }) => {
    //         const postsToShow = mode === "preview" ? result.slice(0, PREVIEW_COUNT) : result;
    //         return (
    //           <div
    //             className={
    //               mode === "preview"
    //                 ? "grid grid-cols-2 grid-rows-2 gap-4 p-4 max-w-[600px] mx-auto"
    //                 : "flex flex-col gap-4 p-4 max-w-[600px] mx-auto"
    //             }
    //           >
    //             {postsToShow.map((post: RedditResult, idx: number) => (
    //             <div
    //               key={post.id + '-' + idx}
    //               className="reddit-post-container"
    //             >
    //               <RedditCard post={post} index={idx} />
    //             </div>
    //           ))}
    //         </div>
    //         );
    //       });
    //       FullRedditList.displayName = "FullRedditList";

    //       return (
    //         <Card className="w-full my-4 overflow-hidden shadow-none">
    //           <CardHeader className="pb-2 flex flex-row items-center justify-between">
    //             <div className="flex items-center gap-2">
    //               <div className=" rounded-full  flex items-center justify-center">
    //                 <Image
    //                   src="/Reddit-Logomark-Color-Logo.wine.svg"
    //                   alt="Reddit Logo"
    //                   width={70}
    //                   height={70}
    //                   className="object-contain rounded-full bg-transparent"
    //                   priority
    //                 />
    //               </div>
    //               <div>
    //                 <CardTitle>Latest from Reddit</CardTitle>
    //                 <p className="text-sm text-neutral-500 dark:text-neutral-400">{result.length} posts found</p>
    //               </div>
    //             </div>
    //           </CardHeader>
    //           <CardContent className="relative">
    //             <div className="px-4 pb-2 h-72">
    //               <FullRedditList mode="preview" />
    //             </div>
    //             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-black pointer-events-none" />
    //             <div className="absolute bottom-0 inset-x-0 flex items-center justify-center pb-4 pt-20 bg-gradient-to-t from-white dark:from-black to-transparent">
    //               <div className="hidden sm:block">
    //                 <Sheet>
    //                   <SheetTrigger asChild>
    //                     <Button variant="outline" className="gap-2 dark:bg-black rounded-full border-[#171717]">
    //                       <RedditLogo className="h-4 w-4" />
    //                       Show all {result.length} posts
    //                     </Button>
    //                   </SheetTrigger>
    //                   <SheetContent side="right" className="w-[400px] sm:w-[600px] overflow-y-auto !p-0 !z-[70]">
    //                     <SheetHeader className="!mt-5 !font-sans">
    //                       <SheetTitle className="text-center">All Reddit Posts</SheetTitle>
    //                     </SheetHeader>
    //                     <FullRedditList mode="full" />
    //                   </SheetContent>
    //                 </Sheet>
    //               </div>
    //               <div className="block sm:hidden">
    //                 <Drawer>
    //                   <DrawerTrigger asChild>
    //                     <Button variant="outline" className="gap-2 bg-white dark:bg-black">
    //                       <RedditLogo className="h-4 w-4" />
    //                       Show all {result.length} posts
    //                     </Button>
    //                   </DrawerTrigger>
    //                   <DrawerContent className="max-h-[85vh] font-sans">
    //                     <DrawerHeader>
    //                       <DrawerTitle>All Reddit Posts</DrawerTitle>
    //                     </DrawerHeader>
    //                     <div className="overflow-y-auto">
    //                       <FullRedditList mode="full" />
    //                     </div>
    //                   </DrawerContent>
    //                 </Drawer>
    //               </div>
    //             </div>
    //           </CardContent>
    //         </Card>
    //       );
    //     }

    //     return null;
    //   },
    //   []
    // );

    return (
      <>
        {toolInvocations.map(
          (toolInvocation: ToolInvocation, toolIndex: number) => (
            <div key={stableKeys[toolIndex]}>
              {renderToolInvocation(toolInvocation, toolIndex)}
            </div>
          )
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.toolInvocations === nextProps.toolInvocations &&
      prevProps.message === nextProps.message;
  }
);

ToolInvocationListView.displayName = 'ToolInvocationListView';

const Home = () => {
  return (
    <>
      <style jsx global>{`
        .tweet-container, .reddit-post-container, .youtube-video-container {
          contain: content;
          min-height: 200px;
          height: auto;
          position: relative;
          will-change: auto;
        }
        
        .ai-message {
          contain: content;
          min-height: 20px;
          position: relative;
        }
        
        /* Prevent content jumping during rendering */
        .markdown-body * {
          contain: content;
          content-visibility: auto;
        }
        
        /* Ensure smooth text rendering */
        .markdown-body p {
          text-wrap: pretty;
          text-rendering: optimizeLegibility;
        }
      `}</style>
      <Suspense fallback={<LoadingFallback />}>
        <HomeContent />
        <InstallPrompt />
      </Suspense>
    </>
  );
};

export default Home;