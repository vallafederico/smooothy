/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Private key for the faucet wallet that holds MATE tokens */
  readonly FAUCET_PRIVATE_KEY?: string
  /** Base RPC URL for blockchain interactions */
  readonly BASE_RPC_URL?: string
  /** MATE token contract address on Base */
  readonly MATE_TOKEN_ADDRESS?: string
  /** Path to the claim store file (default: ./.data/claims.json) */
  readonly CLAIM_STORE_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
