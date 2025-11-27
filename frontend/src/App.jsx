import { useState, useEffect } from 'react'
import RegisterNow from './components/RegisterNow'
import TaxpayerPortalLogin from './components/TaxpayerPortalLogin'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import NonResidentDashboard from './components/NonResidentDashboard'
import RegistrationForm from './components/RegistrationForm'
import AboutUs from './components/AboutUs'
import ContactUs from './components/ContactUs'
import Guidelines from './components/Guidelines'
import FAQ from './components/FAQ'
import PSPOnboarding from './components/PSPOnboarding'
import DeveloperSandbox from './components/DeveloperSandbox'
import DeveloperPortal from './components/DeveloperPortal'
import { Header, Footer } from './components/shared'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [loggedInUserId, setLoggedInUserId] = useState(null)
  const [userRole, setUserRole] = useState('maker')
  const [loginType, setLoginType] = useState('resident')
  const [pspCredentials, setPspCredentials] = useState(null)
  const [resetHomeCounter, setResetHomeCounter] = useState(0)

  // Views that should NOT have centralized Header/Footer (they have their own)
  const dashboardViews = ['dashboard', 'nonResidentDashboard', 'monitoringDashboard', 'configDashboard']

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

    if (loginType === 'nonresident') {
      setCurrentView('nonResidentDashboard')
      localStorage.setItem('currentView', 'nonResidentDashboard')
      localStorage.setItem('loginType', 'nonresident')
    } else {
      setCurrentView('dashboard')
      localStorage.setItem('currentView', 'dashboard')
      localStorage.setItem('loginType', 'resident')
    }

    localStorage.setItem('loggedInUserId', uniqueId)
    localStorage.setItem('userRole', role)
  }

  const handleLogout = () => {
    setLoggedInUserId(null)
    setUserRole('maker')
    setLoginType('resident')
    setCurrentView('home')

    sessionStorage.clear()
    localStorage.removeItem('loggedInUserId')
    localStorage.removeItem('currentView')
    localStorage.removeItem('userRole')
    localStorage.removeItem('loginType')
  }

  // Navigation handlers
  const handleGoHome = () => {
    setCurrentView('home')
    setPspCredentials(null)
    setResetHomeCounter(prev => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoToTaxpayerPortal = () => setCurrentView('taxpayerPortal')
  const handleGoToRegistrationForm = () => setCurrentView('registration')
  const handleGoToAboutUs = () => setCurrentView('aboutUs')
  const handleGoToContactUs = () => setCurrentView('contactUs')
  const handleGoToGuidelines = () => setCurrentView('guidelines')
  const handleGoToFAQ = () => setCurrentView('faq')
  const handleGoToPSP = () => setCurrentView('pspOnboarding')

  const handleSelectLoginType = (type) => {
    setLoginType(type)
    setCurrentView('login')
  }

  const handleNonResidentLoginClick = () => {
    setLoginType('nonresident')
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
      default: return ''
    }
  }

  // Check if current view should show Header/Footer
  const shouldShowHeaderFooter = !dashboardViews.includes(currentView)

  // Render content based on current view
  const renderContent = () => {
    // Dashboard views (no centralized header/footer)
    if (currentView === 'nonResidentDashboard' && loggedInUserId) {
      return <NonResidentDashboard uniqueId={loggedInUserId} onLogout={handleLogout} />
    }

    if (currentView === 'dashboard' && loggedInUserId) {
      return <Dashboard uniqueId={loggedInUserId} onLogout={handleLogout} userRole={userRole} />
    }

    // Pages with centralized header/footer
    switch (currentView) {
      case 'taxpayerPortal':
        return <TaxpayerPortalLogin onSelectLoginType={handleSelectLoginType} onRegisterNow={handleGoHome} />

      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            loginType={loginType}
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
