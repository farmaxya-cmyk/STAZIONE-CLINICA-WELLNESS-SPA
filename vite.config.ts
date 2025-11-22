// FIX: Removed reference to "node" types which was causing an unresolved type definition error.
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // FIX: Replaced `process.cwd()` with `'.'` to resolve a typing error where `cwd` was not found on `process`.
  // `.` is resolved relative to the project root by `loadEnv`, achieving the same result.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Expose environment variables to the client
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
