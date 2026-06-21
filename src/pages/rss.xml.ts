import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { listRecalls, withRetry } from '@/lib/api';

const SITE = 'https://consumer-product-recalls.info';

export async function GET(context: APIContext) {
  const page = await withRetry(() => listRecalls({ limit: 50 }));
  return rss({
    title: 'Latest Consumer Product Recalls',
    description:
      'The 50 most recent U.S. consumer product recalls across CPSC, FDA, USDA, NHTSA, and USCG.',
    site: context.site ?? SITE,
    items: page.items.map((r) => ({
      title: r.title ?? `${r.source} ${r.source_recall_id}`,
      pubDate: new Date(r.published_at),
      link: `/recalls/${r.source}/${encodeURIComponent(r.source_recall_id)}`,
      description: [r.source, r.primary_firm_name].filter(Boolean).join(' · '),
    })),
  });
}
