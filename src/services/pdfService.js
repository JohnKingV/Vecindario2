import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const pdfService = {
  async generateInvoicePDF(invoice, userProfile, condoInfo, logoUri) {
    const logoSrc = logoUri || 'https://i.imgur.com/7Z0A7yA.png';
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            :root {
              --primary: #1e293b;
              --secondary: #64748b;
              --accent: #2563eb;
              --success: #10b981;
              --border: #e2e8f0;
              --bg-light: #f8fafc;
              --text-main: #0f172a;
            }

            body { 
              font-family: 'Helvetica', 'Arial', sans-serif; 
              padding: 0; 
              margin: 0;
              color: var(--text-main); 
              line-height: 1.5;
            }

            .page {
              padding: 50px;
              background-color: #fff;
            }

            /* Header Section */
            .header-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              border-bottom: 2px solid var(--primary);
              padding-bottom: 30px;
              margin-bottom: 40px;
              align-items: center;
            }

            .logo-container img {
              max-width: 180px;
              height: auto;
            }

            .company-info {
              text-align: right;
            }

            .company-name {
              font-size: 18px;
              font-weight: 700;
              color: var(--primary);
              margin-bottom: 4px;
            }

            .company-details {
              font-size: 11px;
              color: var(--secondary);
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            /* Document Title Area */
            .doc-title-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 30px;
            }

            .doc-title {
              font-size: 28px;
              font-weight: 800;
              color: var(--primary);
              letter-spacing: -0.5px;
            }

            .status-badge {
              padding: 6px 14px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }

            /* Info Grid */
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 40px;
            }

            .info-card {
              background: var(--bg-light);
              padding: 20px;
              border-radius: 12px;
              border: 1px solid var(--border);
            }

            .card-label {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: var(--secondary);
              margin-bottom: 10px;
              letter-spacing: 1px;
              border-bottom: 1px solid var(--border);
              padding-bottom: 5px;
            }

            .card-value {
              font-size: 14px;
              font-weight: 600;
              color: var(--text-main);
              margin-bottom: 2px;
            }

            .card-subtext {
              font-size: 12px;
              color: var(--secondary);
            }

            /* Table Styles */
            .detail-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }

            .detail-table th {
              text-align: left;
              padding: 12px 15px;
              background: var(--primary);
              color: white;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .detail-table td {
              padding: 15px;
              border-bottom: 1px solid var(--border);
              font-size: 13px;
            }

            .detail-table tr:nth-child(even) {
              background-color: #fafbfc;
            }

            .item-name {
              font-weight: 600;
              color: var(--primary);
            }

            .item-price {
              text-align: right;
              font-weight: 700;
              font-family: monospace;
              font-size: 15px;
            }

            /* Totals Summary */
            .summary-section {
              display: flex;
              justify-content: flex-end;
            }

            .summary-box {
              width: 250px;
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
            }

            .total-row {
              background: var(--bg-light);
              padding: 15px;
              border-radius: 8px;
              margin-top: 10px;
              border: 2px solid var(--primary);
            }

            .total-label {
              font-size: 14px;
              font-weight: 800;
              color: var(--primary);
            }

            .total-amount {
              font-size: 20px;
              font-weight: 800;
              color: var(--accent);
            }

            /* Footer */
            .footer {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 1px solid var(--border);
              text-align: center;
            }

            .footer-text {
              font-size: 10px;
              color: var(--secondary);
              max-width: 500px;
              margin: 0 auto;
            }

            /* Watermark Styles */
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-15deg);
              width: 80%;
              height: 400px;
              opacity: 0.04;
              z-index: -1;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .watermark img {
              width: 100%;
              max-width: 450px;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="watermark">
            <img src="${logoSrc}" alt="" />
          </div>
          <div class="page">
            <header class="header-grid">
              <div class="logo-container">
                <!-- Logo removed per user request -->
              </div>
              <div class="company-info">
                <div class="company-name">${condoInfo?.nombre || 'Administración Central'}</div>
                <div class="company-details">
                  ${condoInfo?.direccion || 'S/D'}<br>
                  ${condoInfo?.ciudad || ''} • Chile
                </div>
              </div>
            </header>

            <div class="doc-title-row">
              <div class="doc-title">Resumen de Cobros</div>
              <div class="status-badge ${invoice.estado === 'pagado' ? 'status-paid' : 'status-pending'}">
                ${invoice.estado === 'pagado' ? 'Documento Pagado' : 'Pago Pendiente'}
              </div>
            </div>

            <div class="info-grid">
              <div class="info-card">
                <div class="card-label">Información del Residente</div>
                <div class="card-value">${userProfile?.nombre || 'Residente'}</div>
                <div class="card-subtext">${userProfile?.email || ''}</div>
                <div class="card-subtext" style="margin-top: 8px; font-weight: 500;">
                  Unidad: ${userProfile?.depto ? `Depto ${userProfile.depto}` : ''} 
                  ${userProfile?.torre ? ` • Torre ${userProfile.torre}` : ''}
                </div>
              </div>
              
              <div class="info-card">
                <div class="card-label">Detalles del Documento</div>
                <div class="card-value">Referencia: #${invoice.name}</div>
                <div class="card-subtext">Periodo: ${invoice.mes_periodo || 'Mensual'}</div>
                <div class="card-subtext">Vencimiento: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-CL') : 'N/A'}</div>
              </div>
            </div>

            <table class="detail-table">
              <thead>
                <tr>
                  <th>Descripción del Cargo</th>
                  <th style="text-align: right;">Monto (CLP)</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.lines?.length > 0 ? invoice.lines.map(line => `
                  <tr>
                    <td class="item-name">${line.name || 'Gasto General'}</td>
                    <td class="item-price">$${line.price_total?.toLocaleString('es-CL')}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td class="item-name">${invoice.description || 'Gasto Común'}</td>
                    <td class="item-price">$${invoice.monto?.toLocaleString('es-CL')}</td>
                  </tr>
                `}
              </tbody>
            </table>

            <div class="summary-section">
              <div class="summary-box">
                <div class="summary-row">
                  <span style="color: var(--secondary); font-size: 13px;">Subtotal</span>
                  <span style="font-weight: 600;">$${invoice.monto?.toLocaleString('es-CL')}</span>
                </div>
                <div class="total-row summary-row">
                  <span class="total-label">TOTAL FINAL</span>
                  <span class="total-amount">$${invoice.monto?.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>

            <footer class="footer">
              <div class="footer-text">
                Este comprobante tiene validez informativa para el residente. Los pagos realizados a través de la aplicación Vecindario están sujetos a validación por la administración del respectivo condominio.
              </div>
              <div class="stamp">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
                <div style="font-size: 8px; color: #2563eb; font-weight: 700; margin-top: 5px;">VERIFICADO POR VECINDARIO</div>
              </div>
            </footer>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      return uri;
    } catch (error) {
      console.error('[pdfService] Error generating PDF:', error);
      throw error;
    }
  }
};
