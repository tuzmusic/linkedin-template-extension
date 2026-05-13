import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticate, insertTemplate, migrateTemplates } from './migrate-templates';

const TEST_URL = 'https://test.supabase.co';
const TEST_KEY = 'test-anon-key';
const TEST_TOKEN = 'test-access-token';
const TEST_USER_ID = 'user-uuid-123';

const mockTemplate = { id: 'tmpl-uuid-1', title: 'My Template', template: 'Hello {{firstName}}!' };

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});
describe('migrate-templates', () => {
  describe('authenticate', () => {
    it('posts to the correct auth endpoint with email and password', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: TEST_TOKEN, user: { id: TEST_USER_ID } }), {
          status: 200
        })
      );

      await authenticate('me@example.com', 'secret', TEST_URL, TEST_KEY);

      expect(fetch).toHaveBeenCalledWith(
        `${TEST_URL}/auth/v1/token?grant_type=password`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ apikey: TEST_KEY }),
          body: JSON.stringify({ email: 'me@example.com', password: 'secret' })
        })
      );
    });

    it('returns accessToken and userId from the response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: TEST_TOKEN, user: { id: TEST_USER_ID } }), {
          status: 200
        })
      );

      const result = await authenticate('me@example.com', 'secret', TEST_URL, TEST_KEY);
      expect(result).toEqual({ accessToken: TEST_TOKEN, userId: TEST_USER_ID });
    });

    it('throws on auth failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('Invalid credentials', { status: 400 })
      );

      await expect(authenticate('me@example.com', 'wrong', TEST_URL, TEST_KEY)).rejects.toThrow(
        'Auth failed'
      );
    });
  });

  describe('insertTemplate', () => {
    it('maps template field to content and preserves id', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 201 }));

      await insertTemplate(mockTemplate, TEST_USER_ID, TEST_TOKEN, TEST_URL, TEST_KEY);

      const call = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(call[1]!.body as string);
      expect(body.content).toBe(mockTemplate.template);
      expect(body.id).toBe(mockTemplate.id);
      expect(body.user_id).toBe(TEST_USER_ID);
      expect(body.title).toBe(mockTemplate.title);
      expect(body).not.toHaveProperty('template');
    });

    it('sends Authorization header with Bearer token', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 201 }));

      await insertTemplate(mockTemplate, TEST_USER_ID, TEST_TOKEN, TEST_URL, TEST_KEY);

      const headers = vi.mocked(fetch).mock.calls[0][1]!.headers as Record<string, string>;
      expect(headers['Authorization']).toBe(`Bearer ${TEST_TOKEN}`);
    });

    it('throws on insert failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('duplicate key', { status: 409 })
      );

      await expect(
        insertTemplate(mockTemplate, TEST_USER_ID, TEST_TOKEN, TEST_URL, TEST_KEY)
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('migrateTemplates', () => {
    it('logs each template name', async () => {
      const templates = [
        { id: 'id-1', title: 'First', template: 'Hi {{firstName}}' },
        { id: 'id-2', title: 'Second', template: 'Hey {{firstName}}' }
      ];
      vi.mocked(fetch)
        .mockResolvedValueOnce(new Response('', { status: 201 }))
        .mockResolvedValueOnce(new Response('', { status: 201 }));

      const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      });

      await migrateTemplates(templates, TEST_USER_ID, TEST_TOKEN, TEST_URL, TEST_KEY);

      expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('"First"'));
      expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('"Second"'));

      writeSpy.mockRestore();
      logSpy.mockRestore();
    });

    it('returns succeeded/failed counts', async () => {
      const templates = [
        { id: 'id-1', title: 'Good', template: 'text' },
        { id: 'id-2', title: 'Bad', template: 'text' }
      ];
      vi.mocked(fetch)
        .mockResolvedValueOnce(new Response('', { status: 201 }))
        .mockResolvedValueOnce(new Response('conflict', { status: 409 }));

      vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      vi.spyOn(console, 'log').mockImplementation(() => {
      });

      const result = await migrateTemplates(templates, TEST_USER_ID, TEST_TOKEN, TEST_URL, TEST_KEY);
      expect(result).toEqual({ succeeded: 1, failed: 1 });

      vi.restoreAllMocks();
    });

    it('continues migrating remaining templates after a failure', async () => {
      const templates = [
        { id: 'id-1', title: 'Fail', template: 'text' },
        { id: 'id-2', title: 'Pass', template: 'text' }
      ];
      vi.mocked(fetch)
        .mockResolvedValueOnce(new Response('conflict', { status: 409 }))
        .mockResolvedValueOnce(new Response('', { status: 201 }));

      vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      vi.spyOn(console, 'log').mockImplementation(() => {
      });

      const result = await migrateTemplates(templates, TEST_USER_ID, TEST_TOKEN, TEST_URL, TEST_KEY);
      expect(result).toEqual({ succeeded: 1, failed: 1 });
      expect(fetch).toHaveBeenCalledTimes(2);

      vi.restoreAllMocks();
    });
  });
});
