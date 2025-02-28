import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Results } from './pages/Results.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/results',
    element: <Results />,
  }
])

function Main() {
  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')!).render(
  <Main />,
)
