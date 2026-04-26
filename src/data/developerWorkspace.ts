export interface WorkspaceSeedFile {
  name: string
  content: string
  language: string
}

export interface SnippetListing {
  id: string
  title: string
  description: string
  technologies: string[]
  price: number
  rating: number
  sales: number
  updatedAt: string
  language: string
  type: 'snippet' | 'widget' | 'integration'
  author: string
  files: WorkspaceSeedFile[]
}

export interface ProjectTemplateDefinition {
  id: string
  name: string
  description: string
  category: 'saas' | 'portfolio' | 'api' | 'commerce'
  technologies: string[]
  rating: number
  downloads: number
  estimatedSetup: string
  files: WorkspaceSeedFile[]
}

export interface WorkspaceNotification {
  id: string
  title: string
  message: string
  createdAt: string
  type: 'sale' | 'project' | 'system'
  unread: boolean
}

export const defaultWorkspaceFiles: WorkspaceSeedFile[] = [
  {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DevBloxi Workspace</title>
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <main class="shell">
    <span class="badge">Live workspace</span>
    <h1>Ship faster with templates, snippets, and collaboration.</h1>
    <p>Change the files on the left and watch the preview refresh automatically.</p>
    <button id="action">Run preview</button>
    <pre id="output"></pre>
  </main>
  <script src="./script.js"></script>
</body>
</html>`,
  },
  {
    name: 'style.css',
    language: 'css',
    content: `:root {
  color-scheme: dark;
  --bg: #0f172a;
  --panel: rgba(15, 23, 42, 0.84);
  --accent: #2dd4bf;
  --text: #e2e8f0;
  --muted: #94a3b8;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Inter, system-ui, sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(45, 212, 191, 0.2), transparent 26%),
    radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.18), transparent 22%),
    linear-gradient(180deg, #020617, #0f172a 48%, #111827);
  display: grid;
  place-items: center;
  padding: 24px;
}

.shell {
  width: min(760px, 100%);
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: var(--panel);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 30px 120px -48px rgba(15, 23, 42, 0.9);
}

.badge {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(45, 212, 191, 0.14);
  color: #99f6e4;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 22px 0 12px;
  font-size: clamp(2rem, 5vw, 3.6rem);
  line-height: 1.05;
}

p {
  color: var(--muted);
  max-width: 58ch;
  line-height: 1.7;
}

button {
  margin-top: 24px;
  border: 0;
  border-radius: 999px;
  padding: 14px 22px;
  font-weight: 700;
  color: #042f2e;
  background: linear-gradient(135deg, #5eead4, #2dd4bf);
  cursor: pointer;
}

#output {
  min-height: 56px;
  margin-top: 18px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.76);
  color: #cbd5e1;
}`,
  },
  {
    name: 'script.js',
    language: 'javascript',
    content: `const button = document.getElementById('action');
const output = document.getElementById('output');

button?.addEventListener('click', () => {
  const now = new Date().toLocaleTimeString();
  output.textContent = "Preview refreshed at " + now + ". Collaboration and deployment hooks are ready.";
});`,
  },
]

export const snippetMarketplaceSeed: SnippetListing[] = [
  {
    id: 'snippet-ai-command-palette',
    title: 'AI Command Palette',
    description: 'Reusable command palette with fuzzy search, grouped actions, and keyboard shortcuts.',
    technologies: ['react', 'typescript', 'monaco', 'tailwind'],
    price: 39,
    rating: 4.9,
    sales: 124,
    updatedAt: '2026-04-25T15:30:00.000Z',
    language: 'typescript',
    type: 'widget',
    author: 'developer',
    files: [
      {
        name: 'CommandPalette.tsx',
        language: 'typescript',
        content: `import { useEffect, useMemo, useState } from 'react';

type Command = {
  id: string;
  label: string;
  keywords: string[];
  run: () => void;
};

export function CommandPalette({ commands }: { commands: Command[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return commands;

    return commands.filter((command) =>
      [command.label, ...command.keywords].join(' ').toLowerCase().includes(value),
    );
  }, [commands, query]);

  if (!open) return null;

  return (
    <div className="palette-backdrop">
      <div className="palette">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find command" />
        <div className="palette-results">
          {filtered.map((command) => (
            <button key={command.id} onClick={command.run}>
              {command.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}`,
      },
    ],
  },
  {
    id: 'snippet-live-comments',
    title: 'Live Comments Sidebar',
    description: 'WebSocket-ready discussion panel for code review and inline feedback.',
    technologies: ['react', 'websocket', 'node', 'css'],
    price: 52,
    rating: 4.7,
    sales: 81,
    updatedAt: '2026-04-24T10:15:00.000Z',
    language: 'javascript',
    type: 'integration',
    author: 'devmaster',
    files: [
      {
        name: 'live-comments.js',
        language: 'javascript',
        content: `export function createLiveComments(socketUrl) {
  const socket = new WebSocket(socketUrl);

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'presence', channel: 'workspace' }));
  });

  return {
    publish(comment) {
      socket.send(JSON.stringify({ type: 'comment', payload: comment }));
    },
    destroy() {
      socket.close();
    },
  };
}`,
      },
    ],
  },
  {
    id: 'snippet-billing-table',
    title: 'Billing Pricing Table',
    description: 'High-conversion pricing block with toggles for monthly and annual plans.',
    technologies: ['html', 'css', 'javascript'],
    price: 24,
    rating: 4.5,
    sales: 205,
    updatedAt: '2026-04-20T08:00:00.000Z',
    language: 'html',
    type: 'snippet',
    author: 'coder123',
    files: [
      {
        name: 'pricing.html',
        language: 'html',
        content: `<!DOCTYPE html>
<section class="pricing-grid">
  <article class="plan featured">
    <span>Pro</span>
    <h2>$39</h2>
    <p>Everything needed for a fast-moving SaaS team.</p>
  </article>
</section>`,
      },
    ],
  },
]

export const projectTemplateSeed: ProjectTemplateDefinition[] = [
  {
    id: 'template-saas-starter',
    name: 'SaaS Starter Workspace',
    description: 'Landing page, onboarding flow, and metrics shell for shipping an MVP quickly.',
    category: 'saas',
    technologies: ['react', 'typescript', 'tailwind'],
    rating: 4.9,
    downloads: 582,
    estimatedSetup: '25 min',
    files: [
      {
        name: 'App.tsx',
        language: 'typescript',
        content: `export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <section className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-white/[0.04] p-10">
        <span className="rounded-full bg-teal-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
          SaaS starter
        </span>
        <h1 className="mt-8 text-5xl font-bold">Build the launch page, dashboard, and onboarding flow in one repo.</h1>
      </section>
    </main>
  );
}`,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  background: #020617;
}`,
      },
    ],
  },
  {
    id: 'template-portfolio-motion',
    name: 'Portfolio Motion Kit',
    description: 'Personal site with hero reveal, project grid, and case study sections.',
    category: 'portfolio',
    technologies: ['html', 'css', 'javascript'],
    rating: 4.8,
    downloads: 331,
    estimatedSetup: '18 min',
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio Motion Kit</title>
</head>
<body>
  <section class="hero">
    <p class="eyebrow">Creative developer</p>
    <h1>Interfaces with rhythm, clarity, and intent.</h1>
  </section>
</body>
</html>`,
      },
      {
        name: 'style.css',
        language: 'css',
        content: `body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(180deg, #111827, #020617);
  color: #f8fafc;
  font-family: "Space Grotesk", sans-serif;
}`,
      },
    ],
  },
  {
    id: 'template-api-launchpad',
    name: 'API Launchpad',
    description: 'Starter backend with health checks, auth hooks, and resource scaffolding.',
    category: 'api',
    technologies: ['node', 'express', 'typescript'],
    rating: 4.6,
    downloads: 194,
    estimatedSetup: '12 min',
    files: [
      {
        name: 'server.ts',
        language: 'typescript',
        content: `import express from 'express';

const app = express();
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'api-launchpad' });
});

app.listen(3000, () => {
  console.log('API Launchpad ready on http://localhost:3000');
});`,
      },
    ],
  },
]

export const workspaceNotificationsSeed: WorkspaceNotification[] = [
  {
    id: 'notif-sale-1',
    title: 'New snippet sale',
    message: 'AI Command Palette was purchased 3 times in the last 24 hours.',
    createdAt: '2026-04-26T08:15:00.000Z',
    type: 'sale',
    unread: true,
  },
  {
    id: 'notif-project-1',
    title: 'Fresh project brief',
    message: 'A buyer is looking for a React + Monaco live editor with preview and comments.',
    createdAt: '2026-04-26T07:10:00.000Z',
    type: 'project',
    unread: true,
  },
  {
    id: 'notif-system-1',
    title: 'Workspace updated',
    message: 'Hot reload, collaboration channel, and deployment preview are now active in the editor.',
    createdAt: '2026-04-25T19:25:00.000Z',
    type: 'system',
    unread: false,
  },
]
