"use client";

import { track } from "@vercel/analytics";
import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  Suspense,
  useRef,
} from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { ArrowRight, X, Copy, Github, Plus, LogOutIcon } from "lucide-react";
import { XLogo, UserCircle } from "@phosphor-icons/react";
import FormComponent from "@/components/form-component";

import { useChat, UseChatOptions } from "@ai-sdk/react";
import { Separator } from "@/components/ui/separator";
import { SearchGroupId } from "@/utils/client-utils";
import Marked, { ReactRenderer } from "marked-react";
import { parseAsString, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Latex from "react-latex-next";
import { BuyCoffee } from "@/components/buy-coffee";
import { Coffee } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

import ToolInvocationListView from "@/components/tool-invocation";

const HomeContent = () => {
  const [query] = useQueryState("query", parseAsString.withDefault(""));
  const [q] = useQueryState("q", parseAsString.withDefault(""));
  const initialState = useMemo(
    () => ({
      query: query || q,
    }),
    [query, q]
  );

  const [selectedGroup, setSelectedGroup] = useState<SearchGroupId>("youtube");
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
      api: "/api/search",
      experimental_throttle: 1000,
      body: { group: selectedGroup },
      onFinish: (message) => {
        // Track analytics event when user search is completed
        if (message.role === "user") {
          track("search", {
            query: message.content,
            group: selectedGroup,
          });
        }
      },
      onError: (error) => {
        console.log("Chat error:", error);
        // Check for status on error if present, or fallback to message string
        if (
          (typeof (error as any).status === "number" &&
            (error as any).status === 429) ||
          error?.message?.includes("429")
        ) {
          setShowBuyCoffee(true);
          return;
        }
        console.error("Chat error:", error);
        toast.error("An error occurred.", { description: error.message });
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
      return Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map(
        (match) => {
          const text = match[1]?.trim() || "";
          const link = match[2]?.trim() || "";
          return { text, link };
        }
      );
    }, [content]);

    const stableKey = useMemo(() => {
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    }, []);

    const LinkPreview = ({ href, title }: { href: string; title?: string }) => {
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

    const renderHoverCard = (
      href: string,
      text: React.ReactNode,
      isCitation: boolean = false,
      citationText?: string
    ) => {
      const title = citationText || (typeof text === "string" ? text : "");

      return (
        <HoverCard openDelay={10}>
          <HoverCardTrigger asChild>
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                isCitation
                  ? "cursor-pointer text-xs text-primary py-0.5 px-1.5 m-0 bg-primary/10 dark:bg-primary/20 rounded-full no-underline font-medium"
                  : "text-primary dark:text-primary-light no-underline hover:underline font-medium"
              }
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
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    };

    const renderer: Partial<ReactRenderer> = {
      text(text: string) {
        if (!text.includes("$")) return text;
        return (
          <Latex
            key={generateKey()}
            delimiters={[
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
            ]}
          >
            {text}
          </Latex>
        );
      },
      paragraph(children) {
        return (
          <div
            key={generateKey()}
            className="my-5 leading-relaxed text-neutral-700 dark:text-neutral-300"
          >
            {children}
          </div>
        );
      },
      link(href, text) {
        const citationIndex = citationLinks.findIndex(
          (link) => link.link === href
        );
        if (citationIndex !== -1) {
          const citationText = citationLinks[citationIndex].text;
          return (
            <sup key={generateKey()}>
              {renderHoverCard(href, citationIndex + 1, true, citationText)}
            </sup>
          );
        }
        return isValidUrl(href) ? (
          renderHoverCard(href, text)
        ) : (
          <a
            href={href}
            className="text-primary dark:text-primary-light hover:underline font-medium"
          >
            {text}
          </a>
        );
      },
      heading(children, level) {
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const sizeClasses =
          {
            1: "text-2xl md:text-3xl font-extrabold mt-8 mb-4",
            2: "text-xl md:text-2xl font-bold mt-7 mb-3",
            3: "text-lg md:text-xl font-semibold mt-6 mb-3",
            4: "text-base md:text-lg font-medium mt-5 mb-2",
            5: "text-sm md:text-base font-medium mt-4 mb-2",
            6: "text-xs md:text-sm font-medium mt-4 mb-2",
          }[level] || "";

        return (
          <HeadingTag
            key={generateKey()}
            className={`${sizeClasses} text-neutral-900 dark:text-neutral-50 tracking-tight`}
          >
            {children}
          </HeadingTag>
        );
      },
      list(children, ordered) {
        const ListTag = ordered ? "ol" : "ul";
        return (
          <ListTag
            key={generateKey()}
            className={`my-5 pl-6 space-y-2 text-neutral-700 dark:text-neutral-300 ${ordered ? "list-decimal" : "list-disc"}`}
          >
            {children}
          </ListTag>
        );
      },
      listItem(children) {
        return (
          <li key={generateKey()} className="pl-1 leading-relaxed">
            {children}
          </li>
        );
      },
      blockquote(children) {
        return (
          <blockquote
            key={generateKey()}
            className="my-6 border-l-4 border-primary/30 dark:border-primary/20 pl-4 py-1 text-neutral-700 dark:text-neutral-300 italic bg-neutral-50 dark:bg-neutral-900/50 rounded-r-md"
          >
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
          <tr
            key={generateKey()}
            className="transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50"
          >
            {children}
          </tr>
        );
      },
      tableCell(children, flags) {
        const align = flags.align ? `text-${flags.align}` : "text-left";
        const isHeader = flags.header;

        const CellTag = isHeader ? "th" : "td";
        const classes = isHeader
          ? cn(
              "px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-neutral-100",
              "bg-neutral-50/80 dark:bg-neutral-800/80",
              "first:pl-6 last:pr-6",
              "w-auto min-w-[120px]",
              align
            )
          : cn(
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
          <tbody
            key={generateKey()}
            className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-transparent"
          >
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
        <Marked renderer={renderer}>{content}</Marked>
      </div>
    );
  };

  const lastUserMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        return i;
      }
    }
    return -1;
  }, [messages]);

  useEffect(() => {
    if (status === "streaming" && !hasManuallyScrolled) {
      setHasManuallyScrolled(false);
      if (bottomRef.current) {
        isAutoScrollingRef.current = true;
        bottomRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }
  }, [status]);

  // fucking double scroll, gotta fix this.
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      if (!isAutoScrollingRef.current && status === "streaming") {
        const doc = document.documentElement;
        const isAtBottom =
          window.innerHeight + window.scrollY >=
          (doc?.scrollHeight || document.body.scrollHeight) - 120;
        if (!isAtBottom) {
          setHasManuallyScrolled(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    if (status === "streaming" && !hasManuallyScrolled && bottomRef.current) {
      scrollTimeout = setTimeout(() => {
        isAutoScrollingRef.current = true;
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
        setTimeout(() => {
          isAutoScrollingRef.current = false;
        }, 100);
      }, 100);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [messages, status, hasManuallyScrolled]);

  const handleMessageEdit = useCallback(
    (index: number) => {
      setIsEditingMessage(true);
      setEditingMessageIndex(index);
      setInput(messages[index].content);
    },
    [messages, setInput]
  );

  const handleMessageUpdate = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (input.trim()) {
        const newMessages = messages.slice(0, editingMessageIndex + 1);
        newMessages[editingMessageIndex] = {
          ...newMessages[editingMessageIndex],
          content: input.trim(),
        };
        setMessages(newMessages);
        setIsEditingMessage(false);
        setEditingMessageIndex(-1);
        lastSubmittedQueryRef.current = input.trim();
        setInput("");
        reload();
      } else {
        toast.error("Please enter a valid message.");
      }
    },
    [input, messages, editingMessageIndex, setMessages, setInput, reload]
  );

  const LogoutButton: React.FC = () => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const fetchUser = async () => {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      };
      fetchUser();
    }, []);

    useEffect(() => {
      if (!showConfirm) return;
      function handleClickOutside(event: MouseEvent) {
        if (
          popupRef.current &&
          !popupRef.current.contains(event.target as Node)
        ) {
          setShowConfirm(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [showConfirm]);

    const confirmLogout = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.reload();
    };

    return (
      <>
        <button
          onClick={() => setShowConfirm(true)}
          className="fixed bottom-6 left-6 z-50 bg-background/80 rounded-full p-2 shadow-lg border border-neutral-200 dark:border-neutral-800"
          title="Logout"
        >
          <LogOutIcon className="w-5 h-5" />
        </button>
        {showConfirm && (
          <div ref={popupRef} className="fixed bottom-20 left-6 z-50">
            <div className="bg-[#171717] w-80 shadow-xl border border-neutral-800 rounded-lg">
              <div className="p-4 border-b border-neutral-800 font-semibold">
                Log out?
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 text-neutral-400" />
                  )}
                  <span className="font-mono text-sm font-semibold">
                    {user?.email || "Unknown user"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300"
                    onClick={confirmLogout}
                  >
                    Confirm
                  </Button>
                  <Button
                    className="w-full bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 hover:text-white"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  interface NavbarProps {}

  const Navbar: React.FC<NavbarProps> = () => {
    return (
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] flex justify-between items-center p-4",
          status === "ready"
            ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            : "bg-background"
        )}
      >
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
              variant={"secondary"}
              className="rounded-full bg-accent hover:bg-accent/80 backdrop-blur-sm group transition-all hover:scale-105 pointer-events-auto"
            >
              <Plus
                size={18}
                className="group-hover:rotate-90 transition-all"
              />
              <span className="text-sm ml-2 group-hover:block hidden animate-in fade-in duration-300">
                New
              </span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="https://buymeacoffee.com/kasper0990"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-sm font-medium px-3 py-1.5 rounded-xl bg-neutral-1000 hover:bg-neutral-700 text-neutral-100 transition-colors"
            aria-label="Buy Me a Coffee"
            onClick={() => {
              track("buy_me_a_coffee");
            }}
          >
            <Coffee className="h-4 w-4" />
            <span>Buy me a coffee</span>
          </a>
          <a
            href="https://github.com/KasPeR0990/yurei-app"
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
            <XLogo
              className="h-5 w-5"
              style={{ width: "18px", height: "18px" }}
            />
          </a>
          {/* <ThemeToggle /> */}
        </div>
      </div>
    );
  };

  const handleSearchSubmit = useCallback(
    (query: string, group: SearchGroupId) => {
      // Track custom search event
      track("search", { query, group });
      setSelectedGroup(group);
      lastSubmittedQueryRef.current = query;
      append({ content: query, role: "user" });
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
        role: "user",
      });
    }
  }, [initialState.query, append, setInput, messages.length]);

  return (
    <div className="flex flex-col !font-sans items-center min-h-screen bg-background text-foreground transition-all duration-500">
      <LogoutButton />
      <Navbar />

      <div
        className={`w-full p-2 sm:p-4 ${
          status === "ready" && messages.length === 0
            ? "min-h-screen flex flex-col items-center justify-center"
            : "mt-20 sm:mt-16"
        }`}
      >
        <div
          className={`w-full max-w-[90%] !font-sans sm:max-w-2xl mx-auto space-y-6 p-0 transition-all duration-300`}
        >
          {status === "ready" && messages.length === 0 && (
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
                className={cn("!mt-4")}
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

          {messages.length === 0 && <div></div>}

          <div className="space-y-4 sm:space-y-6 mb-32">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`${
                  message.role === "assistant" && index < messages.length - 1
                    ? "!mb-12 border-b border-neutral-200 dark:border-neutral-800"
                    : ""
                }`.trim()}
              >
                {message.role === "user" && (
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
                                    setInput("");
                                  }}
                                  className="h-7 w-7 !rounded-l-lg !rounded-r-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                  disabled={
                                    status === "submitted" ||
                                    status === "streaming"
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Separator
                                  orientation="vertical"
                                  className="h-7 bg-neutral-200 dark:bg-neutral-700"
                                />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 !rounded-r-lg !rounded-l-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                  disabled={
                                    status === "submitted" ||
                                    status === "streaming"
                                  }
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
                            {!isEditingMessage &&
                              index === lastUserMessageIndex && (
                                <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent rounded-[9px] border border-neutral-200 dark:border-neutral-700 flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMessageEdit(index)}
                                    className="h-7 w-7 !rounded-l-lg !rounded-r-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                    disabled={
                                      status === "submitted" ||
                                      status === "streaming"
                                    }
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
                                  <Separator
                                    orientation="vertical"
                                    className="h-7"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        message.content
                                      );
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

                {message.role === "assistant" && (
                  <>
                    <ToolInvocationListView
                      toolInvocations={message.toolInvocations || []}
                      message={message}
                    />
                    {message.content &&
                      (() => {
                        // Pre-process content: Add newline after a period if followed by markdown heading hashes (#)
                        // This specifically targets the pattern ".## Heading" or ".### Heading" etc.
                        const processedContent = message.content.replace(
                          /\.(#+ )/g,
                          ".\n$1"
                        );

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
                <div
                  className={
                    showBuyCoffee
                      ? "filter blur-md transition-all duration-300"
                      : ""
                  }
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

const Home = () => {
  return (
    <>
      <style jsx global>{`
        .tweet-container,
        .reddit-post-container,
        .youtube-video-container {
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
      </Suspense>
    </>
  );
};

export default Home;
