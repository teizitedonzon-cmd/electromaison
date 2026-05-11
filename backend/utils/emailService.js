const nodemailer = require('nodemailer');

const emailActif = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = emailActif
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

const envoyerEmail = async (options) => {
  if (!transporter) {
    console.warn('Email non envoye: EMAIL_USER ou EMAIL_PASS manquant.');
    return;
  }

  await transporter.sendMail(options);
};

const envoyerEmailAdminNouveauVendeur = async (vendeurInfo) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@teyshop.com';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

  await envoyerEmail({
    from: `"TEYSHOP" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `Nouveau vendeur : ${vendeurInfo.prenom} ${vendeurInfo.nom}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fa;padding:20px">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#1A3A2A;padding:18px;color:#fff">
            <h2 style="margin:0">Nouveau vendeur inscrit</h2>
          </div>
          <div style="padding:20px">
            <p>Un nouveau vendeur attend votre validation.</p>
            <p><strong>Nom :</strong> ${vendeurInfo.prenom || ''} ${vendeurInfo.nom || ''}</p>
            <p><strong>Email :</strong> ${vendeurInfo.email}</p>
            <p><strong>Telephone :</strong> ${vendeurInfo.telephone || 'Non renseigne'}</p>
            <p>
              <a href="${frontendUrl}/admin/clients" style="background:#C8410A;color:#fff;padding:10px 18px;text-decoration:none;border-radius:8px">
                Gerer les vendeurs
              </a>
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

const envoyerEmailAdminConnexionVendeur = async (vendeurInfo, connexionReussie) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@teyshop.com';
  const statut = connexionReussie ? 'reussie' : 'echouee';

  await envoyerEmail({
    from: `"TEYSHOP" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `Connexion vendeur ${statut} : ${vendeurInfo.email}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fa;padding:20px">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:20px">
          <h2 style="margin-top:0;color:#1A3A2A">Tentative de connexion vendeur</h2>
          <p>Un vendeur a essaye de se connecter a son espace.</p>
          <p><strong>Nom :</strong> ${vendeurInfo.prenom || ''} ${vendeurInfo.nom || ''}</p>
          <p><strong>Email :</strong> ${vendeurInfo.email}</p>
          <p><strong>Resultat :</strong> ${statut}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  envoyerEmailAdminNouveauVendeur,
  envoyerEmailAdminConnexionVendeur,
};
