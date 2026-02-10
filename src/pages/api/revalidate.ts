import type { APIRoute } from 'astro';
import { purgeCache } from '@netlify/functions';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const token = request.headers.get('x-revalidate-token');
    const secret = process.env.REVALIDATION_TOKEN;

    if (!secret || token !== secret) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { tags } = await request.json();

        if (!Array.isArray(tags)) {
            return new Response(`Bad Request: expected tags attribute with array of strings in the body, got ${typeof tags}`, { status: 400 });
        }

        await purgeCache({ tags });
        return new Response(
            JSON.stringify({
                invalidated: tags
            })
        );
    } catch (_e) {
        return new Response('Bad Request: Invalid JSON body', { status: 400 });
    }
};
