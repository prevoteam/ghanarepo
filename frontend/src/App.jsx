import { useState, useEffect } from 'react'
import RegisterNow from './components/RegisterNow'
import TaxpayerPortalLogin from './components/TaxpayerPortalLogin'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home') // 'home', 'taxpayerPortal', 'login', 'dashboard'
  const [loggedInUserId, setLoggedInUserId] = useState(null)
  const [userRole, setUserRole] = useState('maker')

  // Restore session on page load
  useEffect(() => {
    const savedUserId = localStorage.getItem('loggedInUserId')
    const savedView = localStorage.getItem('currentView')
    const savedUserRole = localStorage.getItem('userRole')

    if (savedUserId && savedView === 'dashboard') {
      setLoggedInUserId(savedUserId)
      setCurrentView('dashboard')
      setUserRole(savedUserRole || 'maker')
    }
  }, [])

  const handleLoginSuccess = (uniqueId, role = 'maker') => {
    setLoggedInUserId(uniqueId)
    setUserRole(role)
    setCurrentView('dashboard')

    // Persist session
    localStorage.setItem('loggedInUserId', uniqueId)
    localStorage.setItem('currentView', 'dashboard')
    localStorage.setItem('userRole', role)
  }

  const handleLogout = () => {
    setLoggedInUserId(null)
    setUserRole('maker')
    setCurrentView('home')

    // Clear session storage
    sessionStorage.clear()
    localStorage.removeItem('loggedInUserId')
    localStorage.removeItem('currentView')
    localStorage.removeItem('userRole')
  }

  const handleGoToTaxpayerPortal = () => {
    console.log('Navigating to Taxpayer Portal...');
    setCurrentView('taxpayerPortal')
  }

  const handleGoToRegister = () => {
    console.log('Navigating to Register page...');
    setCurrentView('home')
  }

  const handleSelectLoginType = (loginType) => {
    // loginType will be 'resident' or 'nonresident'
    // For now, both redirect to the same login page
    setCurrentView('login')
  }

  if (currentView === 'taxpayerPortal') {
    return <TaxpayerPortalLogin onSelectLoginType={handleSelectLoginType} onRegisterNow={handleGoToRegister} />
  }

  if (currentView === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  if (currentView === 'dashboard' && loggedInUserId) {
    return <Dashboard uniqueId={loggedInUserId} onLogout={handleLogout} userRole={userRole} />
  }

  return <RegisterNow onLoginClick={handleGoToTaxpayerPortal} />
}

export default App
