const nodemailer = require('nodemailer');

// Vérification de la présence des variables d'environnement essentielles
const emailActif = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

// Configuration robuste pour la production (Render) et le local
const transporter = emailActif
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // false pour le port 587 (TLS requis en environnement Cloud)
      auth: {
        user: process.env.EMAIL_USER, // Sera configuré sur : elowenlea@gmail.com
        pass: process.env.EMAIL_PASS, // Mot de passe d'application de 16 caractères
      },
      tls: {
        rejectUnauthorized: false // Empêche le blocage des certificats SSL par les serveurs Render
      }
    })
  : null;

// Fonction centrale d'envoi d'e-mail
const envoyerEmail = async (options) => {
  if (!transporter) {
    console.warn('Email non envoyé : EMAIL_USER ou EMAIL_PASS manquant dans les variables d\'environnement.');
    return;
  }

  try {
    return await transporter.sendMail(options);
  } catch (error) {
    console.error('Erreur envoi email (Détails techniques) :', error.message);
    console.error('Options de l\'e-mail tenté :', {
      from: options.from,
      to: options.to,
      subject: options.subject,
    });
    throw error;
  }
};

// Fonctions utilitaires pour le formatage des URLs et délais
const nettoyerUrl = (url) => String(url || '').trim().replace(/\/+$/, '');

const obtenirFrontendUrl = () =>
  nettoyerUrl(process.env.FRONTEND_URL) || 'http://localhost:3001';

const obtenirBackendUrl = () =>
  nettoyerUrl(process.env.BACKEND_URL) ||
  nettoyerUrl(process.env.RENDER_EXTERNAL_URL) ||
  'http://localhost:5000';

const formatDelaiExpedition = (delai) => ({
  moins_24h: 'Moins de 24 heures',
  '1_2_jours': '1 à 2 jours',
  '3_5_jours': '3 à 5 jours',
  plus_5_jours: 'Plus de 5 jours',
}[delai] || 'Non renseigné');


// 1. Notification à l'admin lors de l'inscription d'un nouveau vendeur
const envoyerEmailAdminNouveauVendeur = async (vendeurInfo, tokenApprove, tokenReject) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'teyshop@gmail.com';
  const srvEmail = process.env.EMAIL_USER; // Expéditeur authentifié obligatoire

  const backendUrl = obtenirBackendUrl();
  const frontendUrl = obtenirFrontendUrl();
  const verification = vendeurInfo.verificationVendeur || {};
  const typesProduits = Array.isArray(verification.typesProduits) && verification.typesProduits.length
    ? verification.typesProduits.join(', ')
    : 'Non renseigné';

  const approveUrl = `${backendUrl}/api/admin/vendor-action?token=${encodeURIComponent(tokenApprove)}`;
  const rejectUrl = `${backendUrl}/api/admin/vendor-action?token=${encodeURIComponent(tokenReject)}`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f5f7fa;padding:28px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eee">
        <div style="background:linear-gradient(90deg,#1A3A2A,#243B35);padding:20px;color:#fff">
          <h1 style="margin:0;font-size:18px">Nouvel·le vendeur·se inscrit·e</h1>
        </div>
        <div style="padding:20px;color:#333">
          <p>Bonjour,</p>
          <p>Un nouveau vendeur a créé un compte et attend votre validation.</p>
          <table style="width:100%;margin:12px 0;border-collapse:collapse">
            <tr><td style="padding:6px 0;font-weight:600;width:120px">Nom</td><td style="padding:6px 0">${vendeurInfo.prenom || ''} ${vendeurInfo.nom || ''}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Email</td><td style="padding:6px 0">${vendeurInfo.email}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Téléphone</td><td style="padding:6px 0">${vendeurInfo.telephone || 'Non renseigné'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Statut</td><td style="padding:6px 0">${vendeurInfo.statutVendeur || 'en_attente'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Nom complet</td><td style="padding:6px 0">${verification.nomComplet || 'Non renseigné'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">CNI / Passport</td><td style="padding:6px 0">${verification.numeroPieceIdentite || 'Non renseigné'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Résidence</td><td style="padding:6px 0">${verification.villeResidence || 'Ville non renseignée'} - ${verification.quartierResidence || 'Quartier non renseigné'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Produits</td><td style="padding:6px 0">${typesProduits}${verification.autreTypeProduit ? ` (${verification.autreTypeProduit})` : ''}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Expédition</td><td style="padding:6px 0">${formatDelaiExpedition(verification.delaiExpedition)}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Déclaration</td><td style="padding:6px 0">${verification.declarationAcceptee ? 'Acceptée' : 'Non acceptée'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600">Signature</td><td style="padding:6px 0">${verification.signatureElectronique || 'Non renseignée'}</td></tr>
            ${verification.photoIdentiteEnMain ? `<tr><td style="padding:6px 0;font-weight:600">Photo identité</td><td style="padding:6px 0"><a href="${verification.photoIdentiteEnMain}">Voir la photo</a></td></tr>` : ''}
          </table>

          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">
            <a href="${approveUrl}" style="background:#28a745;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700">Approuver</a>
            <a href="${rejectUrl}" style="background:#dc3545;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700">Rejeter</a>
            <a href="${frontendUrl}/admin/clients" style="background:#6c757d;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Voir dans l'admin</a>
          </div>

          <p style="color:#777;margin-top:18px;font-size:13px">Ce lien expire dans 7 jours. Si vous n'avez pas demandé cette action, ignorez cet e-mail.</p>
        </div>
        <div style="background:#fafafa;border-top:1px solid #eee;padding:12px 20px;font-size:12px;color:#666">TeyShop Marketplace • <a href="${frontendUrl}" style="color:#666;text-decoration:underline">Visiter le site</a></div>
      </div>
    </div>
  `;

  await envoyerEmail({
    from: `"TeyShop Marketplace" <${srvEmail}>`,
    to: adminEmail,
    replyTo: srvEmail,
    subject: `Nouveau vendeur en attente : ${vendeurInfo.prenom || ''} ${vendeurInfo.nom || ''}`,
    html,
    envelope: { from: srvEmail, to: adminEmail } // Empêche l'erreur de Content Filtering (Anti-Spam) de Gmail
  });
};


// 2. Notification au vendeur concernant la décision de l'admin (Approuvé / Rejeté)
const envoyerEmailDecisionVendeur = async (utilisateur, statut) => {
  const destinataire = utilisateur.email;
  const srvEmail = process.env.EMAIL_USER;
  const frontendUrl = obtenirFrontendUrl();

  const titre = statut === 'approuve' ? 'Votre compte vendeur a été approuvé' : 'Votre demande de vendeur a été rejetée';
  const message = statut === 'approuve'
    ? `<p>Félicitations ${utilisateur.prenom || ''}, votre compte vendeur a été approuvé. Vous pouvez désormais ajouter des produits et gérer vos ventes.</p>`
    : `<p>Bonjour ${utilisateur.prenom || ''}, votre demande de vendeur a été examinée et malheureusement rejetée. Pour plus d'informations, contactez l'administrateur.</p>`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f7f8fa;padding:20px">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:10px;padding:18px;border:1px solid #eee;color:#333">
        <h2 style="margin-top:0; color:#1A3A2A">${titre}</h2>
        ${message}
        <p style="margin-top:14px"><a href="${frontendUrl}" style="background:#C8410A;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">Accéder au site</a></p>
      </div>
    </div>
  `;

  await envoyerEmail({
    from: `"TeyShop Marketplace" <${srvEmail}>`,
    to: destinataire,
    subject: titre,
    html,
    envelope: { from: srvEmail, to: destinataire }
  });
};


// 3. Alerte à l'admin lors de la connexion d'un vendeur
const envoyerEmailAdminConnexionVendeur = async (vendeurInfo, connexionReussie) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'teyshop@gmail.com';
  const srvEmail = process.env.EMAIL_USER;
  const statut = connexionReussie ? 'réussie' : 'échouée';

  await envoyerEmail({
    from: `"TeyShop Marketplace" <${srvEmail}>`,
    to: adminEmail,
    replyTo: srvEmail,
    subject: `Connexion vendeur ${statut} : ${vendeurInfo.email}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fa;padding:20px">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:20px">
          <h2 style="margin-top:0;color:#1A3A2A">Tentative de connexion vendeur</h2>
          <p>Un vendeur a essayé de se connecter à son espace.</p>
          <p><strong>Nom :</strong> ${vendeurInfo.prenom || ''} ${vendeurInfo.nom || ''}</p>
          <p><strong>Email :</strong> ${vendeurInfo.email}</p>
          <p><strong>Résultat :</strong> ${statut}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    `,
    envelope: { from: srvEmail, to: adminEmail }
  });
};


// 4. Notification générale d'une nouvelle inscription
const envoyerEmailNotificationInscription = async (utilisateur) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'teyshop@gmail.com';
  const frontendUrl = obtenirFrontendUrl();
  const srvEmail = process.env.EMAIL_USER;

  await envoyerEmail({
    from: `"TeyShop Marketplace" <${srvEmail}>`,
    to: adminEmail,
    replyTo: srvEmail,
    subject: `Nouvelle inscription utilisateur : ${utilisateur.email}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fa;padding:20px">
        <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#1A3A2A;padding:18px;color:#fff">
            <h2 style="margin:0">Nouvelle inscription</h2>
          </div>
          <div style="padding:20px">
            <p>Un nouvel utilisateur vient de s'inscrire sur TeyShop.</p>
            <p><strong>Nom :</strong> ${utilisateur.prenom || ''} ${utilisateur.nom || ''}</p>
            <p><strong>Email :</strong> ${utilisateur.email}</p>
            <p><strong>Téléphone :</strong> ${utilisateur.telephone || 'Non renseigné'}</p>
            <p><strong>Rôle :</strong> ${utilisateur.role || 'client'}</p>
            <p>
              <a href="${frontendUrl}/" style="background:#C8410A;color:#fff;padding:10px 18px;text-decoration:none;border-radius:8px">
                Voir le site
              </a>
            </p>
          </div>
        </div>
      </div>
    `,
    envelope: { from: srvEmail, to: adminEmail }
  });
};


// 5. Réinitialisation du mot de passe oublié
const envoyerEmailResetPassword = async (utilisateur, token) => {
  const destinataire = utilisateur.email;
  const frontendUrl = obtenirFrontendUrl();
  const srvEmail = process.env.EMAIL_USER;

  const resetUrl = `${frontendUrl}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f7f8fa;padding:20px">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:10px;padding:18px;border:1px solid #eee;color:#333">
        <h2 style="margin-top:0; color:#1A3A2A">Réinitialisation du mot de passe</h2>
        <p>Bonjour ${utilisateur.prenom || ''},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans 1 heure.</p>
        <p style="margin-top:14px"><a href="${resetUrl}" style="background:#C8410A;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none">Réinitialiser mon mot de passe</a></p>
        <p style="color:#777;margin-top:18px;font-size:13px">Si vous n'avez pas demandé cette action, ignorez cet e-mail.</p>
      </div>
    </div>
  `;

  await envoyerEmail({
    from: `"TeyShop Marketplace" <${srvEmail}>`,
    to: destinataire,
    subject: `Réinitialisation du mot de passe - TeyShop`,
    html,
    envelope: { from: srvEmail, to: destinataire }
  });
};

module.exports = {
  envoyerEmailAdminNouveauVendeur,
  envoyerEmailDecisionVendeur,
  envoyerEmailAdminConnexionVendeur,
  envoyerEmailNotificationInscription,
  envoyerEmailResetPassword,
};