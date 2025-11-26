import { useState, useEffect } from 'react'
import RegisterNow from './components/RegisterNow'
import TaxpayerPortalLogin from './components/TaxpayerPortalLogin'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import NonResidentDashboard from './components/NonResidentDashboard'
import RegistrationForm from './components/RegistrationForm'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home') // 'home', 'taxpayerPortal', 'login', 'dashboard'
  const [loggedInUserId, setLoggedInUserId] = useState(null)
  const [userRole, setUserRole] = useState('maker')
  const [loginType, setLoginType] = useState('resident') // 'resident' or 'nonresident'

  // Restore session on page load
  useEffect(() => {
    const savedUserId = localStorage.getItem('loggedInUserId')
    const savedView = localStorage.getItem('currentView')
    const savedUserRole = localStorage.getItem('userRole')
    const savedLoginType = localStorage.getItem('loginType')

    if (savedUserId && (savedView === 'dashboard' || savedView === 'nonResidentDashboard')) {
      setLoggedInUserId(savedUserId)
      setCurrentView(savedView)
      setUserRole(savedUserRole || 'maker')
      setLoginType(savedLoginType || 'resident')
    }
  }, [])

  const handleLoginSuccess = (uniqueId, role = 'maker') => {
    setLoggedInUserId(uniqueId)
    setUserRole(role)

    // Redirect to appropriate dashboard based on login type
    if (loginType === 'nonresident') {
      setCurrentView('nonResidentDashboard')
      localStorage.setItem('currentView', 'nonResidentDashboard')
      localStorage.setItem('loginType', 'nonresident')
    } else {
      setCurrentView('dashboard')
      localStorage.setItem('currentView', 'dashboard')
      localStorage.setItem('loginType', 'resident')
    }

    // Persist session
    localStorage.setItem('loggedInUserId', uniqueId)
    localStorage.setItem('userRole', role)
  }

  const handleLogout = () => {
    setLoggedInUserId(null)
    setUserRole('maker')
    setLoginType('resident')
    setCurrentView('home')

    // Clear session storage
    sessionStorage.clear()
    localStorage.removeItem('loggedInUserId')
    localStorage.removeItem('currentView')
    localStorage.removeItem('userRole')
    localStorage.removeItem('loginType')
  }

  const handleGoToTaxpayerPortal = () => {
    console.log('Navigating to Taxpayer Portal...');
    setCurrentView('taxpayerPortal')
  }

  const handleGoToRegister = () => {
    console.log('Navigating to Register page...');
    setCurrentView('home')
  }

  const handleGoToRegistrationForm = () => {
    console.log('Navigating to Registration Form...');
    setCurrentView('registration')
  }

  const handleSelectLoginType = (type) => {
    // type will be 'resident' or 'nonresident'
    setLoginType(type)
    setCurrentView('login')
  }

  const handleNonResidentLoginClick = () => {
    setLoginType('nonresident')
    setCurrentView('login')
  }

  if (currentView === 'taxpayerPortal') {
    return <TaxpayerPortalLogin onSelectLoginType={handleSelectLoginType} onRegisterNow={handleGoToRegister} />
  }

  if (currentView === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        loginType={loginType}
        onRegisterNow={handleGoToRegistrationForm}
      />
    )
  }

  if (currentView === 'registration') {
    return (
      <RegistrationForm
        onBack={handleGoToRegister}
        onLoginRedirect={handleNonResidentLoginClick}
      />
    )
  }

  if (currentView === 'nonResidentDashboard' && loggedInUserId) {
    return <NonResidentDashboard uniqueId={loggedInUserId} onLogout={handleLogout} />
  }

  if (currentView === 'dashboard' && loggedInUserId) {
    return <Dashboard uniqueId={loggedInUserId} onLogout={handleLogout} userRole={userRole} />
  }

  // Default: show landing page (also handles any unknown view state)
  return (
    <RegisterNow
      onLoginClick={handleGoToTaxpayerPortal}
      onNonResidentLoginClick={handleNonResidentLoginClick}
    />
  )
}

export default App
