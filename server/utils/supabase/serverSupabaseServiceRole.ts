import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { H3Event } from "h3";
import { useRuntimeConfig } from "#imports";
import type { Database } from "~/types/database.types";

export const serverSupabaseServiceRole: <T = Database>(
  event: H3Event
) => SupabaseClient<T> = <T = Database>(event: H3Event) => {
  const {
    supabase: { serviceKey },
    public: {
      supabase: { url },
    },
  } = useRuntimeConfig(event);

  // Make sure service key is set
  if (!serviceKey) {
    console.error("Missing `SUPABASE_SERVICE_KEY` in `.env`");
    console.error(process.env.SUPABASE_SERVICE_KEY);
    console.error(useRuntimeConfig(event));
    throw new Error("Missing `SUPABASE_SERVICE_KEY` in `.env`");
  }

  // No need to recreate client if exists in request context
  if (!event.context._supabaseServiceRole) {
    event.context._supabaseServiceRole = createClient<Database>(
      url,
      serviceKey,
      {
        auth: {
          detectSessionInUrl: false,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return event.context._supabaseServiceRole as SupabaseClient<T>;
};
