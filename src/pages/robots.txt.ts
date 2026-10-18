import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const GET: APIRoute = () => {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap-index.xml
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
