import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ComponentPreview from './ComponentPreview.tsx'

// Switch between App and ComponentPreview by changing the component below
const CurrentApp = window.location.pathname === '/preview' ? ComponentPreview : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CurrentApp />
  </StrictMode>,
)
