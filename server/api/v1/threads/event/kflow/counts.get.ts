import { serverSupabaseServiceRole } from '~/utils/supabase/serverSupabaseServiceRole'

export default defineEventHandler(async (event) => {
  try {
    const client = serverSupabaseServiceRole(event)
    
    // Define all queries to run concurrently
    const queries = [
      // Total count (all types except non_relevant)
      client
        .from('events_posts')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'k-flow')
        .neq('type', 'non_relevant'),
      
      // Supply count
      client
        .from('events_posts')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'k-flow')
        .eq('type', 'supply'),
      
      // Demand count
      client
        .from('events_posts')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'k-flow')
        .eq('type', 'demand'),
      
      // Swap count
      client
        .from('events_posts')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'k-flow')
        .eq('type', 'swap'),
      
      // Other count
      client
        .from('events_posts')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'k-flow')
        .eq('type', 'other')
    ]
    
    // Execute all queries concurrently
    const results = await Promise.all(queries)
    
    // Check for errors and extract counts
    const [totalResult, supplyResult, demandResult, swapResult, otherResult] = results
    
    if (totalResult.error) throw totalResult.error
    if (supplyResult.error) throw supplyResult.error
    if (demandResult.error) throw demandResult.error
    if (swapResult.error) throw swapResult.error
    if (otherResult.error) throw otherResult.error
    
    return {
      status: 'ok',
      data: {
        counts: {
          total: totalResult.count || 0,
          supply: supplyResult.count || 0,
          demand: demandResult.count || 0,
          swap: swapResult.count || 0,
          other: otherResult.count || 0
        }
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})
