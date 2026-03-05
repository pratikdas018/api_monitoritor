import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD8bvhftBDard3kWh4Kj85oGEXRY1R0-vc",
  authDomain: "api-hub-9951e.firebaseapp.com",
  projectId: "api-hub-9951e",
  storageBucket: "api-hub-9951e.firebasestorage.app",
  messagingSenderId: "707666160380",
  appId: "1:707666160380:web:55827fd4f6498f3ddfc579",
  measurementId: "G-DVWEQMV9M5",
};

// Avoid duplicate initialization during HMR.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

if (typeof window !== "undefined") {
  analyticsSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch((error) => {
      console.error("[firebase] analytics init failed", error);
    });
}

export { app, auth, googleProvider };
