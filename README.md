# TMR Blockchain RPC — Vercel

## Deploy
1. Put these files in the root of the GitHub repository.
2. Import the repository into Vercel.
3. Framework Preset: **Other**.
4. Build Command: **leave empty**.
5. Output Directory: **leave empty**.
6. Node.js version: **22.x**.
7. Add environment variables if needed:
   - `TMR_UPSTREAM_RPC_URL=https://YOUR-REAL-TMR-NODE/rpc`
   - `TMR_CHAIN_ID=TMR-CHAIN-1`
   - `TMR_NETWORK=testnet`
   - `RPC_API_KEY=your-secret-key` (optional)

## Test
- `/` — status page
- `/rpc` — browser-readable RPC information
- `/rpc?method=tmr_chainId`
- `/rpc?method=tmr_status`

JSON-RPC POST:
```bash
curl -X POST https://YOUR-DOMAIN.vercel.app/rpc   -H "Content-Type: application/json"   -d '{"jsonrpc":"2.0","method":"tmr_chainId","params":[],"id":1}'
```

The project intentionally does not require a database. It can run without `DATABASE_URL`.
