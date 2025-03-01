import { createRoot } from 'react-dom/client'
import App from './pages/App.tsx'
import { Results } from './pages/Results.tsx'
import { About } from './pages/About.tsx'
import { Donate } from './pages/Donate.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'

// Multi page routing
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Refers to App.tsx
  },
  {
    path: '/results',
    element: <Results />, // Refers to Results.tsx
  },
  {
    path: '/about',
    element: <About />, // Refers to Results.tsx
  },
  {
    path: '/donate',
    element: <Donate />, // Refers to Results.tsx
  }
])
function Main() {
  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')!).render(
  <Main />,
)
