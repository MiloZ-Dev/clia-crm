import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CityDetail from './pages/CityDetail.jsx'
import Alerts from './pages/Alerts.jsx'
import Chat from './pages/Chat.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/city/:name" element={<CityDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
