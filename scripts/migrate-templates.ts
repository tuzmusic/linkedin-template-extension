import { readFileSync } from 'fs';
import { createInterface } from 'readline';

function loadEnvFile(filePath: string) {
  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
}

interface ChromeTemplate {
  id: string;
  title: string;
  template: string;
}

interface AuthResponse {
  access_token: string;
  user: { id: string };
}

export async function authenticate(
  email: string,
  password: string,
  supabaseUrl: string,
  anonKey: string
): Promise<{ accessToken: string; userId: string }> {
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anonKey },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Auth failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as AuthResponse;
  return { accessToken: data.access_token, userId: data.user.id };
}

export async function insertTemplate(
  template: ChromeTemplate,
  userId: string,
  accessToken: string,
  supabaseUrl: string,
  anonKey: string
): Promise<void> {
  const res = await fetch(`${supabaseUrl}/rest/v1/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      id: template.id,
      user_id: userId,
      title: template.title,
      content: template.template,
    }),
  });
  if (!res.ok) {
    throw new Error(`Insert failed (${res.status}): ${await res.text()}`);
  }
}

export async function migrateTemplates(
  templates: ChromeTemplate[],
  userId: string,
  accessToken: string,
  supabaseUrl: string,
  anonKey: string
): Promise<{ succeeded: number; failed: number }> {
  let succeeded = 0;
  let failed = 0;
  for (const t of templates) {
    process.stdout.write(`Saving: "${t.title}"... `);
    try {
      await insertTemplate(t, userId, accessToken, supabaseUrl, anonKey);
      console.log('✓');
      succeeded++;
    } catch (err) {
      console.log(`✗ ${(err as Error).message}`);
      failed++;
    }
  }
  return { succeeded, failed };
}

async function readPassword(promptText: string): Promise<string> {
  process.stdout.write(promptText);
  const isTTY = process.stdin.isTTY;
  if (isTTY) process.stdin.setRawMode(true);
  process.stdin.resume();

  return new Promise((resolve) => {
    let password = '';
    const handler = (chunk: Buffer) => {
      const char = chunk.toString('utf8');
      if (char === '\r' || char === '\n' || char === '') {
        if (isTTY) process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', handler);
        process.stdout.write('\n');
        resolve(password);
      } else if (char === '' || char === '\b') {
        if (password.length > 0) password = password.slice(0, -1);
      } else {
        password += char;
      }
    };
    process.stdin.on('data', handler);
  });
}

async function readLine(promptText: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const envFileArg = process.argv.find((a) => a.startsWith('--env-file='));
  if (!envFileArg) {
    console.error('Usage: npm run migrate -- --env-file=.env.remote.local');
    process.exit(1);
  }
  try {
    loadEnvFile(envFileArg.slice('--env-file='.length));
  } catch {
    console.error(`Could not read env file: ${envFileArg}`);
    process.exit(1);
  }

  const exportFile = new URL('../scripts/templates-export.json', import.meta.url).pathname;

  let templates: ChromeTemplate[];
  try {
    templates = JSON.parse(readFileSync(exportFile, 'utf8')) as ChromeTemplate[];
  } catch {
    console.error(`Could not read ${exportFile}`);
    console.error('Run the export snippet in DevTools first (scripts/export-chrome-templates.js)');
    process.exit(1);
  }

  if (templates.length === 0) {
    console.log('No templates found in export file.');
    process.exit(0);
  }

  console.log(`Found ${templates.length} template(s) to migrate.\n`);

  const email = process.env.MIGRATION_EMAIL ?? (await readLine('Email: '));
  const password = process.env.MIGRATION_PASSWORD ?? (await readPassword('Password: '));

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !anonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env');
    process.exit(1);
  }

  console.log('\nAuthenticating...');
  let accessToken: string;
  let userId: string;
  try {
    ({ accessToken, userId } = await authenticate(email, password, supabaseUrl, anonKey));
    console.log('✓ Authenticated\n');
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
    process.exit(1);
  }

  const { succeeded, failed } = await migrateTemplates(
    templates,
    userId,
    accessToken,
    supabaseUrl,
    anonKey
  );

  console.log(`\nDone: ${succeeded} saved, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

// Only run when executed directly, not when imported by tests
if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  main();
}
