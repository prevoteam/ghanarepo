import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './DashboardPages.css';
import { ADMIN_API_BASE_URL } from '../../utils/api';

const MerchantDiscovery = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Fetch merchant discovery data
  const fetchMerchantData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ADMIN_API_BASE_URL}/merchant-discovery?limit=100`);
      const data = await response.json();

      if (data.status) {
        setTableData(data.results.merchants);
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, []);

  // Export table data to PDF
  const handleExportPDF = () => {
    if (tableData.length === 0) {
      alert('No data to export');
      return;
    }

    setExporting(true);

    try {
      const doc = new jsPDF('landscape');

      // Add header
      doc.setFontSize(18);
      doc.setTextColor(31, 58, 131); // GRA blue color
      doc.text('Ghana Unified E-Commerce Registration Portal', 14, 15);

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Merchant Discovery by PSP', 14, 25);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);

      // Define table columns
      const columns = [
        { header: 'Sr No.', dataKey: 'srNo' },
        { header: 'PSP Name', dataKey: 'pspName' },
        { header: 'Merchant Discovered', dataKey: 'merchantDiscovered' },
        { header: 'Registered', dataKey: 'registered' },
        { header: 'Unregistered', dataKey: 'unregistered' },
        { header: 'VAT Eligible', dataKey: 'vatEligible' },
        { header: 'Compliance Rate', dataKey: 'complianceRate' }
      ];

      // Prepare table data
      const rows = tableData.map((row, index) => ({
        srNo: String(index + 1).padStart(2, '0'),
        pspName: row.psp_provider || '-',
        merchantDiscovered: row.transaction_id || '-',
        registered: row.sender_account || '-',
        unregistered: row.receiver_account || '-',
        vatEligible: row.amount_ghs || '0.00',
        complianceRate: row.e_levy_amount || '0.00'
      }));

      // Add table using autoTable
      doc.autoTable({
        columns: columns,
        body: rows,
        startY: 40,
        theme: 'grid',
        headStyles: {
          fillColor: [31, 58, 131],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [0, 0, 0]
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { top: 40, left: 14, right: 14 }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        doc.text(
          'Ghana Revenue Authority - Confidential',
          14,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      // Save the PDF
      doc.save(`Merchant_Discovery_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-content">
        <div className="table-header-new row align-items-center">
          <div className='col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12'>
            <div className="table-title-section">
            <h2 className="table-title text-dark">Merchant Discovery by PSP</h2>
            <p className="table-subtitle text-muted">Breakdown of merchant entities identified through PSP data ingestion.</p>
          </div>
          </div> 
         <div className='col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12'>
          <div className="table-actions d-flex justify-content-end">
            <button className="action-btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
            </button>
            <button
              className="action-btn"
              onClick={handleExportPDF}
              disabled={exporting || loading || tableData.length === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
          </div>
        </div>
      <div className="table-card">
      

        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>PSP Name</th>
                  <th>Merchant Discovered</th>
                  <th>Registered</th>
                  <th>Unregistered</th>
                  <th>VAT Eligible</th>
                  <th>Compliance Rate</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{String(index + 1).padStart(2, '0')}</td>
                      <td className="font-medium">{row.psp_provider || '-'}</td>
                      <td>{row.transaction_id || '-'}</td>
                      <td>{row.sender_account || '-'}</td>
                      <td>{row.receiver_account || '-'}</td>
                      <td>{row.amount_ghs || '0.00'}</td>
                      <td>{row.e_levy_amount || '0.00'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantDiscovery;
