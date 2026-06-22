# Setup guide

## 1. Create Firebase project

1. Go to console.firebase.google.com
2. Click **Add project** → name it (e.g. `lissi-babs-cal`) → disable Google Analytics → Create
3. In the project, go to **Build → Authentication → Get started**
   - Enable **Email/Password** provider
   - Add two users: one for Lissi, one for Babs (use **Add user** button)
4. Go to **Build → Firestore Database → Create database**
   - Choose **Start in production mode** → pick a region → Done
   - Go to **Rules** tab and paste the contents of `firestore.rules`

## 2. Get your config

1. In Firebase project settings (gear icon) → **General** → scroll to **Your apps**
2. Click **</>** (Web) → register app → copy the `firebaseConfig` object
3. Create a `.env` file in this folder (copy from `.env.example`) and fill in all values

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173 on your phone's browser (make sure phone is on same WiFi), or use ngrok for easier testing.

## 4. Deploy for free (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # set public dir to: dist
npm run build
firebase deploy
```

You'll get a free `*.web.app` URL both parents can bookmark on their home screen.

## Add to iPhone home screen

1. Open the URL in Safari
2. Tap the Share icon → **Add to Home Screen**
3. It will behave like a native app
