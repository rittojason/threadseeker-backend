import { serverSupabaseServiceRole } from '~/utils/supabase/serverSupabaseServiceRole'
import jwt from 'jsonwebtoken'
import { z } from 'zod'


const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().transform(val => {
    const parsed = val ? Number.parseInt(val) : 15;
    return Math.min(parsed, 15); // Ensure limit doesn't exceed 15
  }).optional(),
  type: z.string().optional(),
  search: z.string().optional()
})

function validateQuery(query: Record<string, any>) {
  const result = querySchema.safeParse(query)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid query parameters',
      data: result.error.format()
    })
  }
  return result.data
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const validatedQuery = validateQuery(query)
    const cursor = validatedQuery.cursor as string | undefined
    const limit = validatedQuery.limit as number
    const type = validatedQuery.type as string | undefined
    const search = validatedQuery.search as string | undefined

    const client = serverSupabaseServiceRole(event)
    let supabaseQuery = client
      .from('events_posts')
      .select('*')
      .eq('event_name', 'k-flow')
      .neq('type', 'non_relevant')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1) // Fetch one extra to determine if there are more results

    // Apply cursor if provided
    if (cursor) {
      try{
        const { timestamp: timestampStr, uuid: uuidStr } = await verifyCursorToken(cursor)
        const cursorDate = new Date(timestampStr)
        const formattedTimestamp = cursorDate.toISOString()
        supabaseQuery = supabaseQuery.or(`created_at.lt.${formattedTimestamp},and(created_at.eq.${formattedTimestamp},id.lt.${uuidStr})`)
      } catch {
        throw createError({
          statusCode: 400,
          message: 'Invalid or expired pagination token'
        })
      }
    }

    if (type && type !== 'all') {
      supabaseQuery = supabaseQuery.eq('type', type)
    }

    if (search) {
      supabaseQuery = supabaseQuery.or(`author_username.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data, error } = await supabaseQuery

    if (error) {
      console.error(error)
      throw error
    }

    const transformProfilePicUrl = (url: string) => {
      const cdnUrl = new URL(url);
      const reqHost = getHeader(event, "host");
      const HOSTNAME =
        reqHost === "localhost:3000"
          ? "http://localhost:3000"
          : "https://threadseeker.app";
      return `${HOSTNAME}/proxy/image${cdnUrl.pathname}${cdnUrl.search}`;
    };

    // Check if there are more results
    const hasMore = data.length > limit
    const items = data.slice(0, limit) // Remove the extra item we fetched

    // Generate next cursor from the last item (using id instead of created_at)
    const nextCursor = hasMore && items.length > 0
      ? `${items.at(-1).created_at}|${items.at(-1).id}`
      : null

    const cursorToken = nextCursor ? await generateCursorToken({ timestamp: items.at(-1).created_at, uuid: items.at(-1).id }) : null

    return {
      status: 'ok',
      data: {
        posts: items.map(post => ({
          ...post,
          author_avatar_url: transformProfilePicUrl(post.author_avatar_url)
        })),
        has_more: hasMore,
        cursor: cursorToken
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})

async function generateCursorToken({ timestamp, uuid }: { timestamp: string, uuid: string }): Promise<string> {
  const payload = {
    timestamp,
    uuid,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiration
  }
  return jwt.sign(payload, process.env.JWT_SECRET as string)
}

async function verifyCursorToken(token: string): Promise<{timestamp: string, uuid: string}> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      timestamp: string;
      uuid: string;
      exp: number;
    }
    return {
      timestamp: decoded.timestamp,
      uuid: decoded.uuid
    }
  } catch {
    throw new Error('Invalid or expired pagination token')
  }
}
