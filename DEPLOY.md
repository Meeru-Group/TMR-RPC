# TMR RPC Vercel deployment

Important: upload the CONTENTS of this folder to the repository root.

Correct:
index.html
package.json
vercel.json
api/rpc.js

Incorrect:
TMR-RPC-main/TMR-RPC-main/index.html

Vercel Settings:
- Framework Preset: Other
- Build Command: empty
- Output Directory: empty
- Node.js: 22.x

Environment:
TMR_UPSTREAM_RPC_URL=https://YOUR-REAL-TMR-NODE/rpc
TMR_CHAIN_ID=TMR-CHAIN-1
TMR_NETWORK=testnet

After deployment:
https://YOUR-DOMAIN.vercel.app/rpc
https://YOUR-DOMAIN.vercel.app/rpc?method=tmr_chainId
