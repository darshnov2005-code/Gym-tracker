import { Routes, Route, NavLink } from 'react-router-dom'
import { Dumbbell, History, BarChart3, User, List } from 'lucide-react'
import { cn } from './lib/utils'
import Home from './pages/Home'
import WorkoutSession from './pages/WorkoutSession'
import HistoryPage from './pages/History'
import ProgressPage from './pages/Progress'
import RoutinesPage from './pages/Routines'
import ProfilePage from './pages/Profile'

const navItems = [
  { to: '/', icon: Dumbbell, label: 'Train' },
  { to: '/routines', icon: List, label: 'Routines' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' }
]

export default function App() {
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-slate-950">
      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workout" element={<WorkoutSession />} />
          <Route path="/workout/:routineId" element={<WorkoutSession />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-slate-900/95 backdrop-blur border-t border-slate-800 safe-area-pb">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-full h-full gap-0.5 text-xs transition-colors',
                  isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
                )
              }
            >
              <Icon size={22} strokeWidth={isActive => (isActive ? 2.5 : 2)} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}