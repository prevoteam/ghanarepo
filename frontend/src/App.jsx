import { useState, useEffect } from 'react'
import RegisterNow from './components/RegisterNow'
import TaxpayerPortalLogin from './components/TaxpayerPortalLogin'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home') // 'home', 'taxpayerPortal', 'login', 'dashboard'
  const [loggedInUserId, setLoggedInUserId] = useState(null)

  // Restore session on page load
  useEffect(() => {
    const savedUserId = localStorage.getItem('loggedInUserId')
    const savedView = localStorage.getItem('currentView')

    if (savedUserId && savedView === 'dashboard') {
      setLoggedInUserId(savedUserId)
      setCurrentView('dashboard')
    }
  }, [])

  const handleLoginSuccess = (uniqueId) => {
    setLoggedInUserId(uniqueId)
    setCurrentView('dashboard')

    // Persist session
    localStorage.setItem('loggedInUserId', uniqueId)
    localStorage.setItem('currentView', 'dashboard')
  }

  const handleLogout = () => {
    setLoggedInUserId(null)
    setCurrentView('home')

    // Clear session storage
    sessionStorage.clear()
    localStorage.removeItem('loggedInUserId')
    localStorage.removeItem('currentView')
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
    return <Dashboard uniqueId={loggedInUserId} onLogout={handleLogout} />
  }

  return <RegisterNow onLoginClick={handleGoToTaxpayerPortal} />
}

export default App
