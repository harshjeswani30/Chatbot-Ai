import { NhostClient } from '@nhost/react'

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'your-subdomain',
  region: import.meta.env.VITE_NHOST_REGION || 'your-region',
  // OAuth providers will be automatically configured from Nhost dashboard
  // No additional configuration needed here
})
