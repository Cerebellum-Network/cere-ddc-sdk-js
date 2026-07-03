export const json = (body: ReadableStream) => new Response(body).json();
export const arrayBuffer = (body: ReadableStream) => new Response(body).arrayBuffer();
export const text = (body: ReadableStream) => new Response(body).text();
