# yurei app

![home view](./public/home-view.png)

### still in progress, not live on https://yurei.app/ yet, but you can clone it and try it out

## a simple opensource social media researcher powered by exa ai api and youtube v3. built with vercel's ai sdk.

what it does:
- searches youtube for videos
- searches reddit for posts
- searches linkedin (kinda fucked rn, working on it)

using grok-21212 as the llm

### how to install

1. clone this repo
2. `npm install` or `yarn`
3. make a `.env.local` with:
   ```
    NEXT_PUBLIC_URL=http://localhost:3000  # For development
    NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback


    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    // v3 from google console
    YOUTUBE_API_KEY=

    EXA_API_KEY=
    XAI_API_KEY=


   ```

### how to run

1. `npm run dev` or `yarn dev`
2. open [http://localhost:3000](http://localhost:3000)

### tech stack

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Supabase](https://supabase.com/)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Exa API](https://exa.ai/) for search capabilities


### license

This project is licensed under Apache 2.0 - see [LICENSE](LICENSE) for details.
