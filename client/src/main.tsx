import { createRoot } from 'react-dom/client'
import App from './pages/App.tsx'
import { Results } from './pages/Results.tsx'
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
  }
])

function Main() {
  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')!).render(
  <Main />,
)
