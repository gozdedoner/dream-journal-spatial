
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Fix Leaflet's default icon paths under Vite
import L from 'leaflet'
// @ts-ignore - vite can import assets
import iconUrl from 'leaflet/dist/images/marker-icon.png'
// @ts-ignore
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
// @ts-ignore
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
