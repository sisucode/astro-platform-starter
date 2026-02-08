import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import { uploadDisabled } from '../../utils';
import type { BlobParameterProps } from '../../types';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    if (uploadDisabled) {
        return new Response(JSON.stringify({ message: 'Sorry, uploads are disabled' }), { status: 403 });
    }

    let parameters: Partial<BlobParameterProps>;
    try {
        parameters = await request.json();
    } catch (_e) {
        return new Response('Bad Request: Invalid JSON', { status: 400 });
    }

    if (!parameters?.name || typeof parameters.name !== 'string') {
        return new Response(JSON.stringify({ message: 'Invalid name. Name is required and must be a string.' }), { status: 400 });
    }

    if (parameters.name.length > 100) {
        return new Response(JSON.stringify({ message: 'Invalid name. Max length is 100 characters.' }), { status: 400 });
    }

    // Allow alphanumeric, hyphens, underscores
    if (!/^[a-zA-Z0-9\-_]+$/.test(parameters.name)) {
        return new Response(JSON.stringify({ message: 'Invalid name. Must contain only alphanumeric characters, hyphens, and underscores.' }), { status: 400 });
    }

    // Basic validation for other parameters to prevent massive values
    if (parameters.size !== undefined && (typeof parameters.size !== 'number' || parameters.size < 0 || parameters.size > 5000)) {
         return new Response(JSON.stringify({ message: 'Invalid size. Must be a number between 0 and 5000.' }), { status: 400 });
    }

    if (parameters.edges !== undefined && (typeof parameters.edges !== 'number' || parameters.edges < 0 || parameters.edges > 500)) {
         return new Response(JSON.stringify({ message: 'Invalid edges. Must be a number between 0 and 500.' }), { status: 400 });
    }

    if (parameters.growth !== undefined && (typeof parameters.growth !== 'number' || parameters.growth < 0 || parameters.growth > 500)) {
         return new Response(JSON.stringify({ message: 'Invalid growth. Must be a number between 0 and 500.' }), { status: 400 });
    }

    const blobStore = getStore('shapes');
    const key = parameters.name;
    await blobStore.setJSON(key, parameters);
    return new Response(
        JSON.stringify({
            message: `Stored shape "${key}"`
        })
    );
};

export const GET: APIRoute = async () => {
    try {
        const blobStore = getStore({ name: 'shapes', consistency: 'strong' });
        const data = await blobStore.list();
        const keys = data.blobs.map(({ key }) => key);
        return new Response(
            JSON.stringify({
                keys
            })
        );
    } catch (e) {
        console.error(e);
        return new Response(
            JSON.stringify({
                keys: [],
                error: 'Failed listing blobs'
            })
        );
    }
};
