import { createServer } from 'node:http';
import detectPort from 'detect-port';
import { repeatableFetch } from '../packages/content-addressable-storage/src/lib/repeatable-fetch';

describe('packages/content-addressable-storage/src/lib/repeatable-fetch.ts', () => {
    let error = true;
    let port = 3000;
    let url = `http://localhost:${port}`;

    beforeAll(async () => {
        port = await detectPort(port);
        url = `http://localhost:${port}`;
        const server = createServer((request, response) => {
            setTimeout(() => {
                if (error) {
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({
                        method: request.method?.toUpperCase(),
                        url: request.url,
                        reason: 'Internal server error',
                    }));
                } else {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({
                        method: request.method?.toUpperCase(),
                        url: request.url,
                        message: 'done',
                    }));
                }
            }, 100);
        });
        server.unref();
        server.listen(port);
    });

    beforeEach(() => {
        error = true;
    });

    it('should return success response for normal connection', async () => {
        error = false;
        const response = await repeatableFetch(url, {attempts: 5});
        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.method).toBe('GET');
        expect(body.message).toBe('done');
    });

    it('should fail for bad connection', async () => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10);
        const response = await repeatableFetch(url, {attempts: 5, signal: controller.signal}).catch(() => 'failed');
        expect(response).toBe('failed');
    });

    it('should return error for non recoverable server error', async () => {
        const response = await repeatableFetch(url, {attempts: 5});
        expect(response.ok).toBeFalsy();
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.method).toBe('GET');
        expect(body.reason).toBe('Internal server error');
    });

    it('should return result for recoverable connection', async () => {
        setTimeout(() => {
            error = false;
        }, 510);
        const response = await repeatableFetch(url, {attempts: 7});
        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.method).toBe('GET');
        expect(body.message).toBe('done');
    });
});
