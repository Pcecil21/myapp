import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Meals from './pages/Meals'
import Trends from './pages/Trends'
import BodyWeight from './pages/BodyWeight'
import Settings from './pages/Settings'
import Supplements from './pages/Supplements'
import WhoopCallback from './pages/WhoopCallback'
import { useAuth } from './contexts/AuthContext'

export default function App() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-dvh bg-base text-white">
      <main className="flex-1 pb-24">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
          <Route path="/meals" element={<ProtectedRoute><Meals /></ProtectedRoute>} />
          <Route path="/trends" element={<ProtectedRoute><Trends /></ProtectedRoute>} />
          <Route path="/body" element={<ProtectedRoute><BodyWeight /></ProtectedRoute>} />
          <Route path="/supplements" element={<ProtectedRoute><Supplements /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/whoop/callback" element={<ProtectedRoute><WhoopCallback /></ProtectedRoute>} />
        </Routes>
      </main>
      {user && <BottomNav />}
    </div>
  )
}
