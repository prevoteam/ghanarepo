import './StepBar.css';

const StepBar = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'Identity' },
    { number: 3, label: 'Business' },
    { number: 4, label: 'Agent' },
    { number: 5, label: 'Market' },
    { number: 6, label: 'Eligibility' },
    { number: 7, label: 'Review' },
    { number: 8, label: 'Completed' }
  ];

  return (
    <div className="progress-container">
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div key={step.number} className="progress-step-wrapper">
            <div className="progress-step-info">
              <div className="progress-step-label">Step {step.number} of 8</div>
              <div
                className={`progress-circle ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              >
                {currentStep > step.number ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span></span>
                )}
              </div>
              <div className="progress-step-name">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`progress-line ${currentStep > step.number ? 'completed' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepBar;
