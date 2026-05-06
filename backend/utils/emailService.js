const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const envoyerEmailAdminNouveauVendeur = async (vendeurInfo) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@teyshop.com';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:Arial;background:#f5f7fa;padding:20px">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px">
        <div style="background:#1A3A2A;padding:20px;text-align:center;color:#fff">
          <h2>🏪 Nouveau vendeur inscrit</h2>
        </div>
        <div style="padding:20px">
          <p>Un nouveau vendeur attend votre validation.</p>
          <div style="background:#f5f5f5;padding:15px;border-radius:10px;margin:15px 0">
            <p><strong>👤 Nom :</strong> ${vendeurInfo.prenom} ${vendeurInfo.nom}</p>
            <p><strong>📧 Email :</strong> ${vendeurInfo.email}</p>
            <p><strong>📞 Téléphone :</strong> ${vendeurInfo.telephone || 'Non renseigné'}</p>
          </div>
          <div style="text-align:center">
            <a href="${process.env.FRONTEND_URL}/admin/clients" style="background:#C8410A;color:#fff;padding:10px 20px;text-decoration:none;border-radius:8px">📊 Gérer les vendeurs</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"TEYSHOP" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🔔 Nouveau vendeur : ${vendeurInfo.prenom} ${vendeurInfo.nom}`,
    html: htmlContent
  });
};

module.exports = { envoyerEmailAdminNouveauVendeur };