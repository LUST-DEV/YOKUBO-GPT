# 『欲』 YOKUBO GPT — AI Assistant by LUST DEV

<p align="center">
  <img src="public/og-image.jpg" alt="YOKUBO GPT Logo" width="320" style="border-radius: 16px; box-shadow: 0 0 30px rgba(255, 0, 64, 0.4);" />
</p>

<p align="center">
  <strong>L'Assistant d'Intelligence Artificielle d'Élite par LUST DEV</strong><br />
  Routage multi-modèles dynamique, mode de raisonnement approfondi (Thinking Engine), orchestrateur de sécurité multi-IA et interface cyber-gothique ultra-réactive.
</p>

<p align="center">
  <a href="#fonctionnalités-clés">Fonctionnalités</a> •
  <a href="#raccourcis-clavier">Raccourcis Clavier</a> •
  <a href="#architecture--sécurité">Sécurité & Architecture</a> •
  <a href="#installation--démarrage">Installation</a> •
  <a href="#déploiement">Déploiement</a> •
  <a href="#contact">Contact</a>
</p>

---

## ⚡ Présentation

**YOKUBO GPT** est une plateforme conversationnelle avancée conçue pour les développeurs, créateurs et professionnels exigeant une sécurité maximale, un rendu esthétique sans compromis et la puissance des meilleurs modèles d'IA du marché (Google Gemini, Claude Sonnet, Mistral Large, DeepSeek V3).

Conçu et développé par **LUST DEV** (Valery Lusty).

---

## 🌟 Fonctionnalités Clés

- 🧠 **Routage Multi-Modèles & Moteur Hybride :**
  - **YOKUBO AUTO :** Routage prédictif intelligent sélectionnant automatiquement le meilleur modèle en fonction de la complexité de votre prompt.
  - **Google Gemini 2.5 Flash & Pro (avec Processus de Réflexion / Thinking Accordion).**
  - **Claude 3.5 Sonnet, Mistral Large & DeepSeek V3.**
- 🛡️ **Forteresse de Sécurité Multi-IA :**
  - Concertation automatisée entre 3 agents virtuels (*GOTHIC-GUARD-1*, *VIOLET-SCANNER-2*, *CYAN-SHIELD-3*) pour intercepter toute tentative de Prompt Injection, Jailbreak, SSRF ou exfiltration de secrets.
- 🎨 **Personnalisation & Identité Visuelle :**
  - Sélecteur d'avatars avec collection d'icônes géométriques cyber vectorielles ou téléversement de photo de profil personnalisée (compression client-side automatique).
- ⌨️ **Raccourcis Clavier Avancés (Hotkeys) :**
  - Navigation fluide à la vitesse de l'éclair (`Ctrl+/`, `Ctrl+K`, `Ctrl+N`, `Ctrl+S`, `Ctrl+Enter`, flèches directionnelles).
- 🔐 **Authentification & Robustesse de Sécurité :**
  - Jauge visuelle de complexité de mot de passe en temps réel (Password Strength Meter) avec validation des critères.
  - Double Authentification (2FA TOTP), sessions actives révocables, hachage Bcrypt et protection contre les attaques par force brute (Rate Limiting).
- 📜 **Audit & Observabilité :**
  - En-têtes de sécurité stricts (CSP, HSTS 1 an, X-Content-Type-Options `nosniff`, X-Frame-Options `DENY`).
  - Capture globale des exceptions client (`ErrorBoundary` & service `/api/logs/client-error`).
  - Graphiques de distribution d'utilisation IA en temps réel (Recharts) sur le tableau de bord Admin.
- 📱 **Progressive Web App (PWA) :**
  - Compatibilité mobile totale (iOS Apple Touch Icon, Android manifest.json, installation plein écran).

---

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
| :--- | :--- |
| **`Ctrl + /`** ou **`Cmd + /`** | Afficher / Masquer le guide interactif des raccourcis |
| **`Ctrl + K`** | Focaliser instantanément le champ de saisie du message |
| **`Ctrl + Entrée`** | Envoyer immédiatement le prompt / message |
| **`Ctrl + N`** | Créer une nouvelle discussion sécurisée |
| **`Ctrl + S`** | Ouvrir directement les Paramètres |
| **`↑` / `↓`** | Parcourir l'historique des discussions dans la barre latérale |
| **`Entrée`** | Ouvrir la discussion sélectionnée |
| **`Échap` (Esc)** | Fermer les fenêtres modales et retourner au chat |

---

## 🛠️ Stack Technique

- **Frontend :** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts.
- **Backend / Serveur :** Node.js, Express, TSX, esbuild.
- **Base de Données & Auth :** Google Cloud Firestore & Firebase Admin SDK.
- **Intelligence Artificielle :** `@google/genai` (SDK TypeScript officiel Google Gen AI).

---

## 🚀 Installation & Démarrage

### 1. Cloner le dépôt
```bash
git clone https://github.com/LUST-DEV/YOKUBO-GPT.git
cd YOKUBO-GPT
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
Copiez le modèle `.env.example` vers un fichier `.env` :
```bash
cp .env.example .env
```
Renseignez votre clé API Gemini (obligatoire) :
```env
GEMINI_API_KEY="votre-cle-api-gemini"
PORT=3000
```

### 4. Lancer le serveur de développement
```bash
npm run dev
```
L'application est accessible sur : `http://localhost:3000`

### 5. Compiler pour la production
```bash
npm run build
npm start
```

---

## 🌐 Déploiement

Ce projet est prêt pour le déploiement sur les plateformes Cloud :
- **Railway / Render :** Configurez simplement `npm start` comme commande de lancement et injectez la variable `GEMINI_API_KEY`.
- **Google Cloud Run / Docker :** Le serveur Express intègre Vite et sert les fichiers statiques de production de façon optimisée avec compression et en-têtes HTTP stricts.

---

## 👨‍💻 Auteur & Contact

Développé avec passion et exigence par **LUST DEV**.

<div align="center">

| Plateforme | Lien Officiel |
| :--- | :--- |
| **Email Officiel** | [![Email Support](https://img.shields.io/badge/Email-lustdev927%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:lustdev927@gmail.com) |
| **WhatsApp Support** | [![WhatsApp](https://img.shields.io/badge/WhatsApp-+1_(829)_478--6326-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/18294786326) |
| **Canal WhatsApp** | [![WhatsApp Channel](https://img.shields.io/badge/Canal_WhatsApp-LUST_DEV-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029VbCiqwyBVJl3Jv5T4I15) |
| **GitHub Officiel** | [![GitHub](https://img.shields.io/badge/GitHub-LUST--DEV-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/LUST-DEV) |

</div>

- 📧 **Email :** [lustdev927@gmail.com](mailto:lustdev927@gmail.com)
- 💬 **WhatsApp Direct :** [+1 (829) 478-6326](https://wa.me/18294786326)
- 📢 **Canal Communautaire :** [LUST DEV Channel](https://whatsapp.com/channel/0029VbCiqwyBVJl3Jv5T4I15)
- 🐙 **Dépôt & Profil :** [@LUST-DEV](https://github.com/LUST-DEV)

---

<p align="center">
  <em>"Beyond the clouds, beyond the limits." — LUST DEV</em>
</p>

