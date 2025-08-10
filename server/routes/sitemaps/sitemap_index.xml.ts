// import { serverSupabaseServiceRole } from "~/utils/supabase";
// import { SitemapStream, streamToPromise } from "sitemap";

export default defineEventHandler(async (event) => {

  return {
    status: "ok",
  }

//   const BASE_URL = "https://threadseeker.app";
//   const supabase = serverSupabaseServiceRole(event);
//   const batchSize = 2500;

//   const { data: reportData, error: reportDataError } = await supabase.rpc(
//     "get_report_ids",
//     {
//       cursor_id: null,
//       batch_size: batchSize,
//     }
//   );

//   if (reportDataError) {
//     throw createError({
//       statusCode: 500,
//       message: reportDataError.message,
//     });
//   }

//   const allReportData = [...reportData];
//   let hasMore = reportData.length > 0 && reportData.at(-1).has_more;
//   let lastCursor = reportData.at(-1).id;

//   while (hasMore) {
//     const { data: nextReportData, error: nextReportDataError } =
//       await supabase.rpc("get_report_ids", {
//         cursor_id: lastCursor,
//         batch_size: batchSize,
//       });

//     if (nextReportDataError) {
//       throw createError({
//         statusCode: 500,
//         message: nextReportDataError.message,
//       });
//     }

//     allReportData.push(...nextReportData);
//     hasMore = nextReportData.length > 0 && nextReportData.at(-1).has_more;
//     lastCursor = nextReportData.at(-1)?.id;
//   }

//   // Create index sitemap
//   const indexSitemap = new SitemapStream({
//     hostname: BASE_URL,
//   });

//   const chunkSize = 10_000;
//   let chunkIndex = 0;

//   for (let i = 0; i < allReportData.length; i += chunkSize) {
//     const chunk = allReportData.slice(i, i + chunkSize);
//     const sitemap = new SitemapStream({
//       hostname: BASE_URL,
//     });

//     for (const report of chunk) {
//       sitemap.write({
//         url: `/report/${report.id}`,
//         changefreq: "monthly",
//       });
//     }
//     sitemap.end();

//     const sitemapBuffer = await streamToPromise(sitemap);
//     const sitemapFilename = `sitemap-${chunkIndex}.xml`;

//     // save to supabase storage
//     const { error: uploadError } = await supabase.storage
//       .from("threadseeker-sitemap")
//       .upload(sitemapFilename, sitemapBuffer, {
//         upsert: true,
//       });

//     if (uploadError) {
//       throw createError({
//         statusCode: 500,
//         message: uploadError.message,
//       });
//     }

//     indexSitemap.write({
//       url: `${BASE_URL}/sitemaps/${sitemapFilename}`,
//     });

//     chunkIndex++;
//   }

//   indexSitemap.end();

//   return streamToPromise(indexSitemap);
});
