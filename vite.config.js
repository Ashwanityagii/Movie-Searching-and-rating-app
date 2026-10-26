import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'node:https'

function trailerApiPlugin() {
  const cache = new Map();

  return {
    name: 'trailer-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/trailer')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost:5173');
        const query = urlObj.searchParams.get('q') || '';
        if (!query.trim()) {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ trailerId: null }));
        }

        const cleanQ = query.trim().toLowerCase();
        if (cache.has(cleanQ)) {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ trailerId: cache.get(cleanQ) }));
        }

        try {
          const ytUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' official trailer');
          const ytReq = https.get(
            ytUrl,
            {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
              }
            },
            (ytRes) => {
              let data = '';
              ytRes.on('data', (chunk) => {
                data += chunk;
              });
              ytRes.on('end', () => {
                const matches = [...data.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
                let trailerId = null;
                if (matches.length > 0) {
                  trailerId = matches[0][1];
                } else {
                  const fallback = [...data.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)];
                  trailerId = fallback.length > 0 ? fallback[0][1] : null;
                }

                if (trailerId) {
                  cache.set(cleanQ, trailerId);
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ trailerId }));
              });
            }
          );

          ytReq.on('error', () => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ trailerId: null }));
          });

          ytReq.setTimeout(4000, () => {
            ytReq.destroy();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ trailerId: null }));
          });
        } catch {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ trailerId: null }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), trailerApiPlugin()]
})
