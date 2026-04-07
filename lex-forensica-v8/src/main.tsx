import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeLLM } from './services/llm'

// Initialize LLM Provider Layer before rendering
// Registers Gemini as the default provider; additional providers
// can be registered via registry.register() at runtime
initializeLLM(import.meta.env.VITE_GEMINI_API_KEY as string | undefined)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
