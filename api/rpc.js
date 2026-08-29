const CHAIN_ID = process.env.TMR_CHAIN_ID || "TMR-CHAIN-1";
const NETWORK = process.env.TMR_NETWORK || "testnet";
const UPSTREAM = process.env.TMR_UPSTREAM_RPC_URL || "";

const METHODS = [
  "web3_clientVersion",
  "net_version",
  "eth_chainId",
  "tmr_chainId",
  "tmr_status",
  "tmr_getBlockHeight",
  "tmr_getBalance",
  "tmr_getBlockByHeight",
  "tmr_getBlockByHash"
];

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  return res.end(JSON.stringify(body));
}

function error(id, code, message, data) {
  const out = { jsonrpc: "2.0", error: { code, message }, id: id ?? null };
  if (data !== undefined) out.error.data = data;
  return out;
}

function localResult(payload) {
  const { method, id } = payload;
  switch (method) {
    case "web3_clientVersion":
      return { jsonrpc: "2.0", result: "TMR-Blockchain-RPC/1.1.0", id };
    case "net_version":
      return { jsonrpc: "2.0", result: NETWORK === "mainnet" ? "1" : "0", id };
    case "eth_chainId":
      return { jsonrpc: "2.0", result: CHAIN_ID, id };
    case "tmr_chainId":
      return { jsonrpc: "2.0", result: CHAIN_ID, id };
    case "tmr_status":
      return {
        jsonrpc: "2.0",
        result: {
          chain: "TMR Blockchain",
          chain_id: CHAIN_ID,
          network: NETWORK,
          status: "online",
          rpc: "vercel",
          upstream_configured: Boolean(UPSTREAM)
        },
        id
      };
    default:
      return null;
  }
}

async function upstream(payload) {
  if (!UPSTREAM) {
    return error(payload.id, -32001, "TMR_UPSTREAM_RPC_URL is not configured");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const r = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const text = await r.text();
    try {
      return JSON.parse(text);
    } catch {
      return error(payload.id, -32002, "Upstream returned non-JSON", text.slice(0, 300));
    }
  } catch (e) {
    return error(
      payload.id,
      -32003,
      e.name === "AbortError" ? "Upstream RPC timeout" : "Upstream RPC connection failed"
    );
  } finally {
    clearTimeout(timeout);
  }
}

function parseGet(req) {
  const u = new URL(req.url, "https://tmr.local");
  const method = u.searchParams.get("method");
  if (!method) return null;
  let params = [];
  const raw = u.searchParams.get("params");
  if (raw) {
    try { params = JSON.parse(raw); }
    catch { params = [raw]; }
  }
  return {
    jsonrpc: "2.0",
    id: u.searchParams.get("id") || 1,
    method,
    params
  };
}

function authorized(req) {
  const key = process.env.RPC_API_KEY;
  if (!key) return true;
  return req.headers.authorization === `Bearer ${key}`;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 204, "");

  if (!authorized(req)) {
    return send(res, 401, error(null, -32010, "Unauthorized"));
  }

  // Browser-friendly GET tests.
  if (req.method === "GET") {
    const payload = parseGet(req);

    if (!payload) {
      return send(res, 200, {
        jsonrpc: "2.0",
        result: {
          chain_id: CHAIN_ID,
          network: NETWORK,
          mode: "browser-readonly",
          status: "online",
          post_required_for_transactions: true,
          upstream_configured: Boolean(UPSTREAM),
          methods: METHODS
        },
        id: null
      });
    }

    if (!METHODS.includes(payload.method)) {
      return send(res, 200, error(payload.id, -32601, "Method not found"));
    }

    const local = localResult(payload);
    if (local) return send(res, 200, local);

    return send(res, 200, await upstream(payload));
  }

  if (req.method !== "POST") {
    return send(res, 405, error(null, -32600, "POST or GET required"));
  }

  let payload = req.body;
  if (typeof payload === "string") {
    try { payload = JSON.parse(payload); }
    catch { return send(res, 400, error(null, -32700, "Invalid JSON")); }
  }

  if (!payload || payload.jsonrpc !== "2.0" || typeof payload.method !== "string") {
    return send(res, 400, error(payload?.id ?? null, -32600, "Valid JSON-RPC 2.0 POST required"));
  }

  const local = localResult(payload);
  if (local) return send(res, 200, local);

  return send(res, 200, await upstream(payload));
};
