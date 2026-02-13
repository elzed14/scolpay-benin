# 📱 Guide d'installation PWA - ScolPay

## 🌐 Accéder à l'application

### En développement local :
```
http://localhost:3000
```

### Sur le réseau local (pour tester sur mobile) :
1. Trouvez l'IP de votre ordinateur :
   - Windows : `ipconfig` (chercher IPv4)
   - Exemple : `http://192.168.1.xxx:3000`

2. Accédez depuis votre mobile sur le même WiFi

## 📲 Installation sur Mobile

### Android (Chrome) :
1. Ouvrez Chrome sur votre téléphone
2. Allez sur l'URL de l'application
3. Vous verrez une bannière "Ajouter ScolPay à l'écran d'accueil"
4. Cliquez sur "Installer"
5. L'app s'ouvre comme une application native !

### iPhone (Safari) :
1. Ouvrez Safari sur votre iPhone
2. Allez sur l'URL de l'application
3. Appuyez sur le bouton "Partager" (icône carré avec flèche)
4. Sélectionnez "Sur l'écran d'accueil"
5. Cliquez sur "Ajouter"
6. L'icône ScolPay apparaît sur votre home screen

### Autres navigateurs :
- **Edge** : Menu ⋮ → Applications → Installer cette application
- **Samsung Internet** : Menu → Ajouter à l'écran d'accueil

## ✅ Vérifier l'installation

Une fois installée :
- L'application s'ouvre en plein écran (sans barre d'adresse)
- Elle fonctionne hors ligne
- Vous voyez l'indicateur "En ligne/Hors ligne" en haut
- Le scan QR code est accessible

## 🔧 Fonctionnalités PWA disponibles

| Fonctionnalité | Description |
|----------------|-------------|
| 📱 Installation | Ajout au home screen |
| 📴 Mode hors ligne | Fonctionne sans internet |
| 🔄 Synchronisation | Auto-sync quand la connexion revient |
| 📷 Scan QR | Scanner les cartes d'élèves |
| 🔔 Notifications | Alertes de paiement |

## 🧪 Tester le mode hors ligne

1. Installez l'application
2. Coupez le WiFi/4G
3. L'indicateur passe au rouge "Hors ligne"
4. Créez une transaction
5. Elle est sauvegardée localement
6. Réactivez internet → auto-synchronisation !
