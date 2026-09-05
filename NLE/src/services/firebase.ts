import { initializeApp } from "firebase/app";
import { isSupported as isAnalyticsSupported, getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBl0x0yHXJPv1FOvGYmhkyG1L7jo05TDLo",
  authDomain: "thedecorparty-9fef9.firebaseapp.com",
  projectId: "thedecorparty-9fef9",
  storageBucket: "thedecorparty-9fef9.firebasestorage.app",
  messagingSenderId: "152215460267",
  appId: "1:152215460267:web:95e34d71adf2f1bd0b1aee",
  measurementId: "G-37R8BGG9G9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { RecaptchaVerifier, signInWithPhoneNumber };

// Firebase Analytics only works in a real browser with the Measurement API
// available (not SSR, not every browser/privacy-mode) -- `isSupported()`
// resolves false rather than throwing in those cases, so gate on it instead
// of calling getAnalytics() unconditionally at module scope.
export let analytics: Analytics | undefined;
isAnalyticsSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(app);
  })
  .catch(() => {
    /* analytics is best-effort; never block the app on it */
  });
