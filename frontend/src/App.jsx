import { useState, useEffect } from 'react'
import RegisterNow from './components/RegisterNow'
import TaxpayerPortalLogin from './components/TaxpayerPortalLogin'
import Login from './components/Login'
import ResidentLogin from './components/ResidentLogin'
import Dashboard from './components/Dashboard'
import ResidentDashboard from './components/ResidentDashboard'
import NonResidentDashboard from './components/NonResidentDashboard'
import MonitoringDashboard from './components/MonitoringDashboard'
import ConfigDashboard from './components/ConfigDashboard'
import AdminDashboard from './components/AdminDashboard'
import RegistrationForm from './components/RegistrationForm'
import ResidentRegistration from './components/ResidentRegistration'
import AboutUs from './components/AboutUs'
import ContactUs from './components/ContactUs'
import Guidelines from './components/Guidelines'
import FAQ from './components/FAQ'
import PSPOnboarding from './components/PSPOnboarding'
import DeveloperSandbox from './components/DeveloperSandbox'
import DeveloperPortal from './components/DeveloperPortal'
import TaxpayerCorner from './components/TaxpayerCorner'
import { Header, Footer } from './components/shared'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [loggedInUserId, setLoggedInUserId] = useState(null)
  const [userRole, setUserRole] = useState('maker')
  const [loginType, setLoginType] = useState('resident')
  const [pspCredentials, setPspCredentials] = useState(null)
  const [resetHomeCounter, setResetHomeCounter] = useState(0)
  const [isDashboardMode, setIsDashboardMode] = useState(false)

  // Views that should NOT have centralized Header/Footer (they have their own)
  const dashboardViews = ['dashboard', 'residentDashboard', 'nonResidentDashboard', 'monitoringDashboard', 'configDashboard', 'adminDashboard']

  // Restore session on page load
  useEffect(() => {
    const savedUserId = localStorage.getItem('loggedInUserId')
    const savedView = localStorage.getItem('currentView')
    const savedUserRole = localStorage.getItem('userRole')
    const savedLoginType = localStorage.getItem('loginType')

    // Restore session for any dashboard view
    const validDashboardViews = ['dashboard', 'residentDashboard', 'nonResidentDashboard', 'monitoringDashboard', 'configDashboard', 'adminDashboard']
    if (savedUserId && validDashboardViews.includes(savedView)) {
      setLoggedInUserId(savedUserId)
      setCurrentView(savedView)
      setUserRole(savedUserRole || 'resident')
      setLoginType(savedLoginType || 'resident')
    }
  }, [])

  const handleLoginSuccess = (uniqueId, role = 'resident') => {
    setLoggedInUserId(uniqueId)
    setUserRole(role)

    // Route based on user role:
    // - gra_maker, gra_checker -> ConfigDashboard
    // - monitoring -> MonitoringDashboard
    // - admin -> AdminDashboard
    // - resident, nonresident -> Dashboard (main merchant dashboard)
    let targetView = 'dashboard'
    let targetLoginType = 'resident'

    if (role === 'admin') {
      targetView = 'adminDashboard'
      targetLoginType = 'admin'
    } else if (role === 'gra_maker' || role === 'gra_checker') {
      targetView = 'configDashboard'
      targetLoginType = 'gra'
    } else if (role === 'monitoring') {
      targetView = 'monitoringDashboard'
      targetLoginType = 'monitoring'
    } else if (role === 'nonresident') {
      // Nonresident merchants go to main dashboard
      targetView = 'dashboard'
      targetLoginType = 'nonresident'
    } else if (role === 'resident') {
      // Resident merchants go to main dashboard
      targetView = 'dashboard'
      targetLoginType = 'resident'
    } else {
      targetView = 'dashboard'
      targetLoginType = 'resident'
    }

    setCurrentView(targetView)
    setLoginType(targetLoginType)

    localStorage.setItem('loggedInUserId', uniqueId)
    localStorage.setItem('currentView', targetView)
    localStorage.setItem('userRole', role)
    localStorage.setItem('loginType', targetLoginType)
  }

  const handleLogout = () => {
    setLoggedInUserId(null)
    setUserRole('resident')
    setLoginType('resident')
    setCurrentView('home')
    setIsDashboardMode(false)

    sessionStorage.clear()
    // Clear merchant session data
    localStorage.removeItem('loggedInUserId')
    localStorage.removeItem('currentView')
    localStorage.removeItem('userRole')
    localStorage.removeItem('loginType')
    // Clear GRA session data
    localStorage.removeItem('gra_session_id')
    localStorage.removeItem('gra_unique_id')
    localStorage.removeItem('gra_user_role')
    localStorage.removeItem('gra_token')
  }

  // Navigation handlers
  const handleGoHome = () => {
    setCurrentView('home')
    setPspCredentials(null)
    setResetHomeCounter(prev => prev + 1)
    setIsDashboardMode(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoToTaxpayerPortal = () => setCurrentView('residentLogin')
  const handleGoToRegistrationForm = () => setCurrentView('registration')
  const handleGoToResidentRegistration = () => setCurrentView('residentRegistration')
  const handleGoToAboutUs = () => setCurrentView('aboutUs')
  const handleGoToContactUs = () => setCurrentView('contactUs')
  const handleGoToGuidelines = () => setCurrentView('guidelines')
  const handleGoToFAQ = () => setCurrentView('faq')
  const handleGoToPSP = () => setCurrentView('pspOnboarding')
  const handleGoToTaxpayerCorner = () => setCurrentView('taxpayerCorner')

  const handleResidentLoginClick = () => {
    setCurrentView('residentLogin')
  }

  const handleNonResidentLoginClick = () => {
    setCurrentView('login')
  }

  const handlePSPSuccess = (credentials) => {
    setPspCredentials(credentials)
    setCurrentView('developerSandbox')
  }

  const handleGoToDeveloperPortal = () => {
    setCurrentView('developerPortal')
  }

  // Get active nav based on current view
  const getActiveNav = () => {
    switch (currentView) {
      case 'aboutUs': return 'about'
      case 'contactUs': return 'contact'
      case 'guidelines': return 'guidelines'
      case 'faq': return 'faq'
      case 'pspOnboarding': return 'psp'
      case 'taxpayerCorner': return 'taxpayer-corner'
      default: return ''
    }
  }

  // Check if current view should show Header/Footer
  const shouldShowHeaderFooter = !dashboardViews.includes(currentView) && !isDashboardMode

  // Render content based on current view
  const renderContent = () => {
    // Dashboard views (no centralized header/footer)
    if (currentView === 'monitoringDashboard' && loggedInUserId) {
      return <MonitoringDashboard onLogout={handleLogout} />
    }

    if (currentView === 'configDashboard' && loggedInUserId) {
      return <ConfigDashboard onLogout={handleLogout} userRole={userRole} />
    }

    if (currentView === 'adminDashboard' && loggedInUserId) {
      return <AdminDashboard onLogout={handleLogout} onLogoClick={handleGoHome} />
    }

    if (currentView === 'nonResidentDashboard' && loggedInUserId) {
      return <NonResidentDashboard uniqueId={loggedInUserId} onLogout={handleLogout} />
    }

    if (currentView === 'residentDashboard' && loggedInUserId) {
      return <ResidentDashboard uniqueId={loggedInUserId} onLogout={handleLogout} />
    }

    if (currentView === 'dashboard' && loggedInUserId) {
      return (
        <Dashboard
          uniqueId={loggedInUserId}
          onLogout={handleLogout}
          userRole={userRole}
          onLogoClick={handleGoHome}
          onAboutUsClick={handleGoToAboutUs}
          onContactUsClick={handleGoToContactUs}
          onGuidelinesClick={handleGoToGuidelines}
          onFAQClick={handleGoToFAQ}
          onPSPClick={handleGoToPSP}
          onTaxpayerCornerClick={handleGoToTaxpayerCorner}
        />
      )
    }

    // Pages with centralized header/footer
    switch (currentView) {
      case 'taxpayerPortal':
        return <TaxpayerPortalLogin onResidentLogin={handleResidentLoginClick} onNonResidentLogin={handleNonResidentLoginClick} />

      case 'residentLogin':
        return (
          <ResidentLogin
            onLoginSuccess={handleLoginSuccess}
            onRegisterNow={handleGoToResidentRegistration}
          />
        )

      case 'residentRegistration':
        return (
          <ResidentRegistration
            onBack={handleGoHome}
            onLoginRedirect={handleResidentLoginClick}
            onGoToDashboard={(uniqueId, role) => handleLoginSuccess(uniqueId, role || 'resident')}
          />
        )

      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onRegisterNow={handleGoToRegistrationForm}
          />
        )

      case 'registration':
        return (
          <RegistrationForm
            onBack={handleGoHome}
            onLoginRedirect={handleNonResidentLoginClick}
          />
        )

      case 'aboutUs':
        return <AboutUs onBack={handleGoHome} />

      case 'contactUs':
        return <ContactUs onBack={handleGoHome} />

      case 'guidelines':
        return <Guidelines onBack={handleGoHome} />

      case 'faq':
        return <FAQ onBack={handleGoHome} />

      case 'taxpayerCorner':
        return <TaxpayerCorner />

      case 'pspOnboarding':
        return <PSPOnboarding onBack={handleGoHome} onSuccess={handlePSPSuccess} />

      case 'developerSandbox':
        return (
          <DeveloperSandbox
            credentials={pspCredentials}
            onGoHome={handleGoHome}
            onGoToDeveloperPortal={handleGoToDeveloperPortal}
          />
        )

      case 'developerPortal':
        return <DeveloperPortal credentials={pspCredentials} onGoHome={handleGoHome} />

      default:
        return (
          <RegisterNow
            key={resetHomeCounter}
            onLoginClick={handleGoToTaxpayerPortal}
            onNonResidentLoginClick={handleNonResidentLoginClick}
            onGoToAboutUs={handleGoToAboutUs}
            onGoToContactUs={handleGoToContactUs}
            onGoToGuidelines={handleGoToGuidelines}
            onGoToFAQ={handleGoToFAQ}
            onGoToPSP={handleGoToPSP}
            onDashboardStateChange={setIsDashboardMode}
          />
        )
    }
  }

  // Dashboard views render without wrapper
  if (!shouldShowHeaderFooter) {
    return renderContent()
  }

  // All other views get centralized Header/Footer
  return (
    <div className="app-container">
      <Header
        onLogoClick={handleGoHome}
        activeNav={getActiveNav()}
        onAboutUsClick={handleGoToAboutUs}
        onContactUsClick={handleGoToContactUs}
        onGuidelinesClick={handleGoToGuidelines}
        onFAQClick={handleGoToFAQ}
        onPSPClick={handleGoToPSP}
        onTaxpayerCornerClick={handleGoToTaxpayerCorner}
        showPSPNav={currentView !== 'login'}
      />
      <main className="app-main">
        {renderContent()}
      </main>
      <Footer />
    </div>
  )
}

export default App
