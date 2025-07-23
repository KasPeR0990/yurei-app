import { xai } from '@ai-sdk/xai';
import Exa from 'exa-js';
import { string, z } from 'zod';
import { getGroupConfig } from '@/app/actions/actions';
import {
  convertToCoreMessages,
  smoothStream,
  streamText,
  tool,
  createDataStreamResponse,
  customProvider,
  generateObject,
  NoSuchToolError
} from 'ai';
import { youtube_v3 } from '@googleapis/youtube';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import { ratelimit } from '@/utils/ratelimit';



// Custom provider for language models
const Yurei = customProvider({
  languageModels: {
    'yurei-default': xai('grok-2-1212'),
  },
});

if (!process.env.EXA_API_KEY) {
  throw new Error("Missing EXA_API_KEY environment variable or out of credits!.");
}

if (!process.env.YOUTUBE_API_KEY) {
  throw new Error("Missing YOUTUBE_API_KEY environment variable.");
}

// Set maxDuration to comply with Vercel hobby plan limits (60 seconds)
export const maxDuration = 60;

// Interfaces for search results
interface HackerNewsResult {
  id: string;
  url: string;
  title: string;
  text?: string;
  publishedDate: string;
  descendants: number;
  score: number;
  comments: number[];
  author: string;
  highlights: string[];      
}


interface RedditResult {
  id: string;
  url: string;
  title?: string;
  text?: string;
  publishedDate?: string;
  highlights?: string[];
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



// Helper functions
const extractDomain = (url: string): string => {
  const urlPattern = /^https?:\/\/([^/?#]+)(?:[/?#]|$)/i;
  return url.match(urlPattern)?.[1] || url;
};

// not used 
const deduplicateByUrl = <T extends { url: string }>(items: T[]): T[] => {
  const seenUrls = new Set<string>();
  return items.filter((item) => {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      return true;
    }
    return false;
  });
};

//rate 

// Main POST handler
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }} = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // rate limit by user id
    const usedID = user.id;
    const { success, reset, remaining } = await ratelimit.limit(usedID);
    if (!success) {
      return new Response(JSON.stringify({ error: '429: Rate limit exceeded' }), { status: 429 });
    }

    const { messages, group } = await req.json();
    const { tools: activeTools, toolInstructions, responseGuidelines } = await getGroupConfig(group);
    console.log("Group: ", group);

    return createDataStreamResponse({
      execute: async dataStream => {
        const toolResult = streamText({
          model: Yurei.languageModel('yurei-default'),
          messages: convertToCoreMessages(messages),
          temperature: 0,
          experimental_activeTools: [...activeTools],
          system: toolInstructions,
          toolChoice: 'required',
          tools: {
            text_translate: tool({
              description: "Translate text from one language to another.",
              parameters: z.object({
                text: z.string().describe("The text to translate."),
                to: z.string().describe("The language to translate to (e.g., 'fr' for French)."),
              }),
              execute: async ({ text, to }: { text: string; to: string }) => {
                try {
                  const translation = await generateObject({
                    model: Yurei.languageModel('yurei-default'),
                    system: `You are a helpful assistant that translates text from one language to another.`,
                    prompt: `Translate the following text to ${to} language: ${text}`,
                    schema: z.object({
                      translatedText: z.string(),
                      detectedLanguage: z.string(),
                    }),
                  });

                  console.log(translation);
                  return {
                    translatedText: translation.object.translatedText,
                    detectedLanguage: translation.object.detectedLanguage,
                  };
                } catch (error) {
                  console.error('Translation error:', error);
                  throw error;
                }
              },
            }),
            hackernews_search: tool({
              description: 'Search HackerNews posts.',
              parameters: z.object({
                query: z.string().describe('The search query, find similar things to this'),
                startDate: z.string().optional().describe('The start date in YYYY-MM-DD format'),
                endDate: z.string().optional().describe('The end date in YYYY-MM-DD format'),
              }),
             execute: async ({
                query,
                startDate,
                endDate,
              }: {
                query: string;
                startDate?: string;
                endDate?: string;
              }) => {
                try {
                  const exa = new Exa(process.env.EXA_API_KEY as string);

                  const result = await exa.searchAndContents(query, {
                    type: 'auto', // Use auto search for better results
                    numResults: 10,
                    text: true,
                    highlights: true,
                    includeDomains: ['news.ycombinator.com'],
                    sortBy: 'date', // Sort by date to get recent results
                    sortOrder: 'desc',
                  });
                  // Helper: Extract HN post ID from URL
                  const extractHackerNewsID = (url: string): string | null => {
                    const match = url.match(/news\.ycombinator\.com\/item\?id=(\d+)/);
                    return match ? match[1] : null;
                  };

                  // Step 1: Build a map of highlights by post ID from Exa results
                  const highlightsById = Object.fromEntries(
                    result.results
                      .map(post => {
                        const id = extractHackerNewsID(post.url);
                        return id ? [id, post.highlights || []] : null;
                      })
                      .filter(Boolean) as [string, string[]][]
                  );

                  // Step 2: Deduplicate posts by ID
                  const postsWithIds = result.results
                    .map(post => {
                      const id = extractHackerNewsID(post.url);
                      return id ? { id, url: post.url } : null;
                    })
                    .filter(Boolean) as { id: string; url: string }[];
                  const uniquePostsById = Array.from(
                    new Map(postsWithIds.map(post => [post.id, post])).values()
                  );

                  // Step 3: Fetch HN details and merge with highlights
                  const hnDetails = await Promise.all(
                    uniquePostsById.map(async ({ id, url }) => {
                      const details = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json());
                      return {
                        id,
                        url,
                        title: details.title || '',
                        text: details.text || '',
                        descendants: details.descendants || 0,
                        score: details.score || 0,
                        comments: details.kids || [],
                        author: details.by || '',
                        publishedDate: details.time ? new Date(details.time * 1000).toISOString() : '',
                        highlights: highlightsById[id] || [],
                      };
                    })
                  );

                  // Step 4: Return results in the expected format
                  return {
                    results: hnDetails.filter(Boolean),
                  };
                } catch (error) {
                  console.error('HackerNews search error:', error);
                  return { results: [], error: 'Failed to fetch Hacker News results. Please try again later.' };
                }
              },
            }),
            youtube_search: tool({
              description: 'Search YouTube videos using YouTube Data API v3 and get detailed video information.',
              parameters: z.object({
                query: z.string().describe('The search query for YouTube videos'),
              }),
              execute: async ({ query, }: { query: string; }) => {
                try {

                  

                  // Initialize YouTube API client
                  const youtube = new youtube_v3.Youtube({
                    auth: process.env.YOUTUBE_API_KEY,

                  });                 

                  // Search for videos matching the query
                  const searchResponse = await youtube.search.list({
                    part: ['id', 'snippet'],
                    q: query,
                    maxResults: 10,
                    type: ['video'],
                  });

                  if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
                    console.log('No YouTube results found');
                    return { results: [] };
                  }

                  // Process each video result
                  const processedResults = await Promise.all(
                    (searchResponse.data.items || []).map(async (result): Promise<VideoResult | null> => {
                      const videoId = result.id?.videoId;
                      if (!videoId) return null;

                      // Base result with video ID and URL
                      const baseResult: VideoResult = {
                        videoId,
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                      };

                      try {
                        // Get detailed video information
                        const videoResponse = await youtube.videos.list({
                          part: ['snippet', 'statistics', 'contentDetails'],
                          id: [videoId],
                        });
                        const video = videoResponse.data.items?.[0];
                        
                        if (video?.snippet) {
                          // Create details object with basic video information
                          baseResult.details = {
                            title: video.snippet.title || '',
                            author_name: video.snippet.channelTitle || '',
                            author_url: video.snippet.channelId ? 
                              `https://www.youtube.com/channel/${video.snippet.channelId}` : 
                              undefined,
                            thumbnail_url: (video.snippet.thumbnails?.high?.url || 
                                          video.snippet.thumbnails?.medium?.url || 
                                          video.snippet.thumbnails?.default?.url || ''),
                            type: 'video',
                            provider_name: 'YouTube',
                            provider_url: 'https://www.youtube.com',
                          };
                          
                          // Add statistics if available
                          if (video.statistics) {
                            baseResult.views = video.statistics.viewCount || '';
                            baseResult.likes = video.statistics.likeCount || '';
                          }
                        }
                        
                        // Try to get captions
                        try {
                          const captionsListResponse = await youtube.captions.list({
                            part: ['snippet'],
                            videoId,
                          });
                          
                          // If captions are available, try to get the transcript
                          if (captionsListResponse.data.items && captionsListResponse.data.items.length > 0) {
                            // Find the first English caption track or use the first available one
                            const captionTrack = captionsListResponse.data.items.find(
                              item => item.snippet?.language === 'en'
                            ) || captionsListResponse.data.items[0];
                            
                            if (captionTrack && captionTrack.id) {
                              try {
                                // Note: YouTube API doesn't directly provide caption text
                                // This is a placeholder for the caption data
                                baseResult.captions = `Video has captions available in ${captionTrack.snippet?.language || 'unknown language'}`;
                              } catch (downloadError) {
                                console.error(`Error downloading captions for video ${videoId}:`, downloadError);
                              }
                            }
                          }
                        } catch (captionError) {
                          console.error(`Error fetching captions for video ${videoId}:`, captionError);
                        }
                        
                        // Extract timestamps from video description
                        if (video?.snippet?.description) {
                          // Look for common timestamp patterns in the description
                          const timestampRegex = /(\d{1,2}:(?:\d{1,2}:)?\d{2})\s*[-–—:]\s*(.{3,50}?)(?=\n|$|\d{1,2}:(?:\d{1,2}:)?\d{2})/g;
                          const simpleTimestampRegex = /(\d{1,2}:(?:\d{1,2}:)?\d{2})/g;
                          
                          let matches = [];
                          let match;
                          
                          // Try to extract timestamps with descriptions
                          while ((match = timestampRegex.exec(video.snippet.description)) !== null) {
                            matches.push(`${match[1]} - ${match[2].trim()}`);
                          }
                          
                          // If no structured timestamps found, just extract the time codes
                          if (matches.length === 0) {
                            const timeMatches = video.snippet.description.match(simpleTimestampRegex);
                            if (timeMatches && timeMatches.length > 0) {
                              matches = timeMatches;
                            }
                          }
                          
                          if (matches.length > 0) {
                            baseResult.timestamps = matches;
                          }
                        }
                        
                        return baseResult;
                      } catch (error) {
                        console.error(`Error fetching details for video ${videoId}:`, error);
                        return baseResult;
                      }
                    })
                  );

                  // Filter out null results
                  const validResults = processedResults.filter(
                    (result): result is VideoResult => result !== null
                  );

                  return {
                    results: validResults,
                  };
                } catch (error) {
                  console.error('YouTube search error:', error);
                  return { results: [], error: 'Failed to fetch YouTube results. Please try again later.' };
                }
              },
            }),
            reddit_search: tool({
              description: 'Search Reddit posts.',
              parameters: z.object({
                query: z.string().describe('The search query, use u/username for usernames'),
                startDate: z.string().optional().describe('The start date in YYYY-MM-DD format'),
                endDate: z.string().optional().describe('The end date in YYYY-MM-DD format'),
              }),
              execute: async ({
                query,
                startDate,
                endDate,
              }: {
                query: string;
                startDate?: string;
                endDate?: string;
              }) => {
                try {
                  const exa = new Exa(process.env.EXA_API_KEY as string);
            
                  // For Reddit, we need a different approach as date filtering doesn't work well
                  const result = await exa.searchAndContents(query, {
                    type: 'auto', // Use auto search for better results
                    numResults: 15,
                    text: true,
                    highlights: true,
                    includeDomains: ['reddit.com'],
                    sortBy: 'date', // Sort by date to get recent results
                    sortOrder: 'desc', // Descending order (newest first)
                    // Not using date parameters as they cause issues with Reddit
                  });
                  
                  // Extract Reddit post ID from URL
                  const extractRedditID = (url: string): string | null => {
                    const match = url.match(/reddit\.com\/r\/[^/]+\/comments\/([^/]+)/);
                    return match ? match[1] : null;
                  };
                  
                  // Extract author from URL or content??
                
                  
                  // Process and filter results
                  const processedResults = result.results.reduce<Array<RedditResult>>((acc, post) => {
                    const redditId = extractRedditID(post.url);
            
                    if (redditId) {
                      // Extract subreddit from URL robustly
                      let community = '';
                      try {
                        // Try to extract from post.url, but also fallback to post.text if needed
                        let communityMatch = post.url && post.url.match(/reddit.com\/r\/([^/]+)/i);
                        if (!communityMatch && post.text) {
                          communityMatch = post.text.match(/\br\/([a-zA-Z0-9_]+)/i);
                        }
                        if (communityMatch && communityMatch[1]) {
                          community = communityMatch[1];
                        }
                      } catch (e) {
                        community = '';
                      }
                      acc.push({
                        id: redditId,
                        url: post.url,
                        title: post.title || '',
                        text: post.text || post.title || '',
                        publishedDate: post.publishedDate || undefined,
                        highlights: post.highlights || undefined,
                     
                      });
                    }
                    return acc;
                  }, []);
            
                  return {
                    query: query,
                    results: processedResults,
                    timeRange: startDate && endDate
                    ? `from ${startDate} to ${endDate}`
                    : 'anytime'
                  }
                } catch (error) {
                  console.error('Reddit search error:', error);
                  throw error;
                }
              },
            }),
          },
          experimental_repairToolCall: async ({
            toolCall,
            tools,
            parameterSchema,
            error,
          }) => {
            if (NoSuchToolError.isInstance(error)) {
              return null; // do not attempt to fix invalid tool names
            }
            console.log("Fixing tool call================================");
            console.log("toolCall", toolCall);
            console.log("tools", tools);
            console.log("parameterSchema", parameterSchema);
            console.log("error", error);

            const tool = tools[toolCall.toolName as keyof typeof tools];
            const { object: repairedArgs } = await generateObject<any>({
              model: Yurei.languageModel("yurei-default"),
              prompt: [
                `The model tried to call the tool "${toolCall.toolName}"` +
                ` with the following arguments:`,
                JSON.stringify(toolCall.args),
                `The tool accepts the following schema:`,
                JSON.stringify(parameterSchema(toolCall)),
                'Please fix the arguments.',
                `Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
              ].join('\n'),
              schema: tool.parameters,
            });

            return { ...toolCall, args: JSON.stringify(repairedArgs) };
          }
        });

        try {
          // First stream the tool results
          await toolResult.mergeIntoDataStream(dataStream);
          
          // Extract tool result messages for the next phase
          const toolResponse = await toolResult.response;
          
          // Step 2: Generate and stream the final response
          const response = streamText({
            model: Yurei.languageModel('yurei-default'),
            system: responseGuidelines,
            experimental_transform: smoothStream({ 
              chunking: 'word', 
              delayInMs: 2
            }),
            messages: [
              ...convertToCoreMessages(messages),
              ...toolResponse.messages, // Include tool output messages
            ],
          });
          
          // Stream the final response
          await response.mergeIntoDataStream(dataStream);
        } catch (error: any) {
          console.error('Error streaming results:', error);
          
          // Extract the last user message to use in fallback
          const lastUserMessage = messages
            .filter((msg: any) => msg.role === 'user')
            .pop()?.content || '';
          
          // Add a fallback result if streaming fails
          dataStream.write(`0:${JSON.stringify({
            type: 'tool-call',
            toolCallId: 'fallback-tool-call',
            toolName: group === 'x' ? 'x_search' : group === 'youtube' ? 'youtube_search' : 'reddit_search',
            args: { query: lastUserMessage },
            state: 'result',
            result: [],
          })}\n`);
          
          // Add a fallback response
          dataStream.write(`0:${JSON.stringify({
            type: 'text',
            text: "I'm sorry, but I encountered an error processing your request. Please try again.",
          })}\n`);
        }
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred processing your search' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}