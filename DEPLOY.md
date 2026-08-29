# TMR RPC Vercel deployment

## 1. Upload the contents of this folder to GitHub

Important: `vercel.json`, `index.html`, `package.json` and the `api/` folder must be at the repository ROOT.

Correct:

```text
TMR-RPC-main/
  index.html
  vercel.json
  package.json
  api/
    rpc.js
```

Do NOT upload a ZIP so that Vercel ends up with an extra nested folder.

## 2. Import the GitHub repository into Vercel

If Vercel asks for Root Directory, leave it as the repository root when the files above are directly inside it.

## 3. Environment Variables

Set:

```env
TMR_UPSTREAM_RPC_URL=https://YOUR-REAL-TMR-NODE/rpc
TMR_CHAIN_ID=TMR-CHAIN-1
TMR_NETWORK=testnet
```

Optional:

```env
RPC_API_KEY=YOUR_LONG_RANDOM_KEY
```

## 4. Redeploy

After changing Environment Variables, create a new deployment.

## 5. Test

Open:

`https://YOUR-DOMAIN.vercel.app/`

Then:

`https://YOUR-DOMAIN.vercel.app/rpc`

Then:

`https://YOUR-DOMAIN.vercel.app/rpc?method=tmr_chainId`

A JSON-RPC client should use POST.

### 404 explanation

A 404 on the bare Vercel domain means the deployed project did not have a root page or Vercel was pointed at the wrong directory. This version includes `index.html` at the correct root, so `/` is no longer a 404.

If `/rpc` itself is 404, check that `api/rpc.js` is at the repository root and redeploy.
