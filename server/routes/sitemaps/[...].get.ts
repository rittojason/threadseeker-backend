// import { serverSupabaseServiceRole } from "~/utils/supabase";
// import { sendProxy } from "h3";

export default defineEventHandler(async (event) => {

  return {
    status: "ok",
  }
//   const { _: fullPath } = getRouterParams(event) as { _: string };

//   const { data, error } = await serverSupabaseServiceRole(event)
//     .storage.from("threadseeker-sitemap")
//     .download(fullPath);

//   if (error || !data) {
//     throw createError({
//       statusCode: 404,
//       statusMessage: "Not Found",
//     });
//   }

//   // Serve the raw data directly to the client
//   event.res.setHeader("Content-Type", "application/xml");
//   event.res.setHeader("Content-Length", data.size);
//   return data;
});
