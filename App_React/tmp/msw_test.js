const { setupServer } = require('msw/node');
const { rest } = require('msw');
const axios = require('axios');

const server = setupServer(
  rest.get('http://localhost:3004/health', (req, res, ctx) => {
    return res(ctx.json({ status: 'ok', uptime: 100, timestamp: new Date().toISOString() }));
  })
);

(async () => {
  server.listen();
  try {
    const r = await axios.get('http://localhost:3004/health');
    console.log('response', r.data);
  } catch (e) {
    console.error('request error', e.message, e.response && e.response.data);
  } finally {
    server.close();
  }
})();
