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

  try {
    return await transporter.sendMail(options);
  } catch (error) {
    console.error('Erreur envoi email:', error.message);
    console.error('Options email:', {
      from: options.from,
      to: options.to,
      subject: options.subject,
    });
    throw error;
  }
};

const envoyerEmailAdminNouveauVendeur = async (vendeurInfo, tokenApprove, tokenReject) => {
  // Destinataire admin : teyshopmarket@gmail.com (pour approver/rejeter)
  const adminEmail = process.env.ADMIN_EMAIL || 'teyshopmarket@gmail.com';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const backendUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:5000';

  // Adresse d'expéditeur : elowenlea@gmail.com (compte SMTP authentifié)
  const smtpUser = process.env.EMAIL_USER || 'elowenlea@gmail.com';

  const approveUrl = `${backendUrl.replace(/\/+$/, '')}/api/admin/vendor-action?token=${encodeURIComponent(tokenApprove)}`;
  const rejectUrl = `${backendUrl.replace(/\/+$/, '')}/api/admin/vendor-action?token=${encodeURIComponent(tokenReject)}`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f5f7fa;padding:28px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eee">
        <div style="background:linear-gradient(90deg,#1A3A2A,#243B35);padding:20px;color:#fff">
          <h1 style="margin:0;font-size:18px">Nouvel·le vendeur·se inscrit·e</h1>
        </div>
        <div style="padding:20px;color:#333">
          <p>Bonjour,</p>
          <p>Un·e nouveau·elle vendeur·se a créé un compte et attend votre validation.</p>
          <table style="width:100%;margin:12px 0;border-collapse:collapse">
            <tr><td style="padding:6px 0;font-weight:600;width:120px">Nom</td><td style="padding:6px 0">${vendeurInfo.prenom || ''} ${vendeurInfo.nom || ''}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Email</td><td style="padding:6px 0">${vendeurInfo.email}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Téléphone</td><td style="padding:6px 0">${vendeurInfo.telephone || 'Non renseigné'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Statut</td><td style="padding:6px 0">${vendeurInfo.statutVendeur || 'en_attente'}</td></tr>
          </table>

          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">
            <a href="${approveUrl}" style="background:#28a745;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700">Approuver</a>
            <a href="${rejectUrl}" style="background:#dc3545;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700">Rejeter</a>
            <a href="${frontendUrl.replace(/\/+$/, '')}/admin/clients" style="background:#6c757d;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Voir dans l'admin</a>
          </div>

          <p style="color:#777;margin-top:18px;font-size:13px">Ce lien expire dans 7 jours. Si vous n'avez pas demandé cette action, ignorez cet email.</p>
        </div>
        <div style="background:#fafafa;border-top:1px solid #eee;padding:12px 20px;font-size:12px;color:#666">ElectroMaison • <a href="${frontendUrl}" style="color:#666;text-decoration:underline">Visiter le site</a></div>
      </div>
    </div>
  `;

  await envoyerEmail({
    from: `"ElectroMaison" <${smtpUser}>`,
    to: adminEmail,
    replyTo: 'elowenlea@gmail.com',
    subject: `Nouvel·le vendeur·se en attente : ${vendeurInfo.prenom || ''} ${vendeurInfo.nom || ''}`,
    html,
    envelope: { from: process.env.EMAIL_USER || smtpUser, to: adminEmail }
  });
};

const envoyerEmailDecisionVendeur = async (utilisateur, statut) => {
  const destinataire = utilisateur.email;
  const smtpUser = process.env.EMAIL_USER || 'no-reply@electromaison.local';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

  const titre = statut === 'approuve' ? 'Votre compte vendeur a été approuvé' : 'Votre demande de vendeur a été rejetée';
  const message = statut === 'approuve'
    ? `<p>Félicitations ${utilisateur.prenom}, votre compte vendeur a été approuvé. Vous pouvez désormais ajouter des produits et gérer vos ventes.</p>`
    : `<p>Bonjour ${utilisateur.prenom}, votre demande de vendeur a été examinée et malheureusement rejetée. Pour plus d'informations, contactez l'administrateur.</p>`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f7f8fa;padding:20px">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:10px;padding:18px;border:1px solid #eee;color:#333">
        <h2 style="margin-top:0">${titre}</h2>
        ${message}
        <p style="margin-top:14px"><a href="${frontendUrl}" style="background:#C8410A;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">Accéder au site</a></p>
      </div>
    </div>
  `;

  await envoyerEmail({
    from: `"ElectroMaison" <${smtpUser}>`,
    to: destinataire,
    subject: titre,
    html,
    envelope: { from: process.env.EMAIL_USER || smtpUser, to: destinataire }
  });
};

const envoyerEmailAdminConnexionVendeur = async (vendeurInfo, connexionReussie) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'teyshopmarket@gmail.com';
  const fromAddress = process.env.EMAIL_USER || 'elowenlea@gmail.com';
  const statut = connexionReussie ? 'reussie' : 'echouee';

  await envoyerEmail({
    from: `"ElectroMaison" <${fromAddress}>`,
    to: adminEmail,
    replyTo: 'elowenlea@gmail.com',
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

const envoyerEmailNotificationInscription = async (utilisateur) => {
  const destinataire = process.env.NOTIFY_SIGNUP_EMAIL || 'teyshopmarket@gmail.com';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const fromAddress = process.env.EMAIL_USER || 'elowenlea@gmail.com';

  await envoyerEmail({
    from: `"ElectroMaison" <${fromAddress}>`,
    to: destinataire,
    replyTo: 'elowenlea@gmail.com',
    subject: `Nouvelle inscription utilisateur : ${utilisateur.email}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fa;padding:20px">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#1A3A2A;padding:18px;color:#fff">
            <h2 style="margin:0">Nouvelle inscription</h2>
          </div>
          <div style="padding:20px">
            <p>Un nouvel vendeur vient de s'inscrire sur Teyshop bien vouloir l'approuver ou non.</p>
            <p><strong>Nom :</strong> ${utilisateur.prenom || ''} ${utilisateur.nom || ''}</p>
            <p><strong>Email :</strong> ${utilisateur.email}</p>
            <p><strong>Telephone :</strong> ${utilisateur.telephone || 'Non renseigne'}</p>
            <p><strong>Role :</strong> ${utilisateur.role || 'client'}</p>
            <p>
              <a href="${frontendUrl}/" style="background:#C8410A;color:#fff;padding:10px 18px;text-decoration:none;border-radius:8px">
                Voir le site
              </a>
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

const envoyerEmailResetPassword = async (utilisateur, token) => {
  const destinataire = utilisateur.email;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const smtpUser = process.env.EMAIL_USER || 'elowenlea@gmail.com';

  const resetUrl = `${frontendUrl.replace(/\/+$/, '')}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f7f8fa;padding:20px">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:10px;padding:18px;border:1px solid #eee;color:#333">
        <h2 style="margin-top:0">Réinitialisation du mot de passe</h2>
        <p>Bonjour ${utilisateur.prenom || ''},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans 1 heure.</p>
        <p style="margin-top:14px"><a href="${resetUrl}" style="background:#C8410A;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">Réinitialiser mon mot de passe</a></p>
        <p style="color:#777;margin-top:18px;font-size:13px">Si vous n'avez pas demandé cette action, ignorez cet e-mail.</p>
      </div>
    </div>
  `;

  await envoyerEmail({
    from: `"ElectroMaison" <${smtpUser}>`,
    to: destinataire,
    replyTo: 'elowenlea@gmail.com',
    subject: `Réinitialisation du mot de passe - ElectroMaison`,
    html,
    envelope: { from: process.env.EMAIL_USER || smtpUser, to: destinataire }
  });
};

module.exports = {
  envoyerEmailAdminNouveauVendeur,
  envoyerEmailAdminConnexionVendeur,
  envoyerEmailNotificationInscription,
  envoyerEmailResetPassword,
};
