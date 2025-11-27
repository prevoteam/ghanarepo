import './Guidelines.css';

const Guidelines = ({ onBack }) => {
  return (
    <div className="guidelines-page">
      <div className="guidelines-content">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>

        <h1 className="guidelines-title">Guidelines</h1>

        <section className="guideline-section">
          <h2 className="section-title">1. Introduction</h2>
          <ul className="section-list">
            <li>GRA is responsible for assessing, collecting, and accounting for tax revenue in Ghana.</li>
            <li>Ensures efficient, fair, and transparent tax administration.</li>
            <li>Promotes voluntary compliance and taxpayer education.</li>
          </ul>
        </section>

        <section className="guideline-section">
          <h2 className="section-title">2. Mandate of the GRA</h2>
          <ul className="section-list">
            <li>Ensure effective tax administration nationwide.</li>
            <li>Combat tax evasion and fraud.</li>
            <li>Facilitate customs and trade operations at borders.</li>
            <li>Provide taxpayer guidance and support.</li>
            <li>Implement tax laws and ensure compliance.</li>
          </ul>
        </section>

        <section className="guideline-section">
          <h2 className="section-title">3. Taxpayer Responsibilities</h2>
          <ul className="section-list">
            <li>Register for a Tax Identification Number (TIN) or use the Ghana Card PIN.</li>
            <li>File accurate and timely tax returns.</li>
            <li>Pay taxes by due dates using approved channels.</li>
            <li>Maintain proper financial and business records.</li>
            <li>Cooperate with GRA officials during audits or inspections.</li>
          </ul>
        </section>

        <section className="guideline-section">
          <h2 className="section-title">4. Key Tax Types in Ghana</h2>
          <ul className="section-list">
            <li>Personal Income Tax (PIT).</li>
            <li>Corporate Income Tax (CIT).</li>
            <li>Pay As You Earn (PAYE).</li>
            <li>Withholding Tax.</li>
            <li>Capital Gains Tax.</li>
            <li>Value Added Tax (VAT).</li>
            <li>NHIL and GETFund Levies.</li>
            <li>Import duties, export duties, and excise duties.</li>
          </ul>
        </section>

        <section className="guideline-section">
          <h2 className="section-title">5. Filing and Payment Procedures</h2>
          <ul className="section-list">
            <li>File returns through the taxpayer portal or at GRA offices.</li>
            <li>Ensure all figures and declarations are accurate.</li>
            <li>Pay taxes through banks, online platforms, or mobile money.</li>
            <li>Keep payment receipts and acknowledgement slips.</li>
            <li>Upload or submit proof of payment when required.</li>
          </ul>
        </section>

        <section className="guideline-section">
          <h2 className="section-title">6. Record Keeping</h2>
          <ul className="section-list">
            <li>Maintain business and financial records for at least six years.</li>
            <li>Keep sales, purchase records, VAT invoices, payroll data, and banking documents.</li>
            <li>Retain import/export documentation and accounting books.</li>
          </ul>
        </section>

        <section className="guideline-section">
          <h2 className="section-title">7. Compliance and Enforcement</h2>
          <ul className="section-list">
            <li>GRA conducts periodic audits and compliance checks.</li>
            <li>Penalties apply for late filing, late payments, and non-compliance.</li>
            <li>Interest may be charged on unpaid taxes.</li>
            <li>Prosecution may occur in cases of tax evasion.</li>
            <li>Voluntary disclosure reduces penalties.</li>
          </ul>
        </section>
      </div>

      {/* Decorative circles */}
      <div className="guidelines-circles">
        <div className="guidelines-circle guidelines-circle-1"></div>
        <div className="guidelines-circle guidelines-circle-2"></div>
        <div className="guidelines-circle guidelines-circle-3"></div>
      </div>
    </div>
  );
};

export default Guidelines;
