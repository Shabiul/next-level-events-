import admin from "firebase-admin";

/**
 * Verifies Firebase Auth ID tokens server-side. This intentionally does NOT
 * need a service-account key: verifying an ID token only checks its
 * signature against Google's public certs + the `aud`/`iss` claims against
 * our project id, none of which requires authenticated admin credentials.
 * (Only Admin SDK calls that *act on* Firebase, e.g. Firestore or minting
 * custom tokens, would need a service account.)
 */
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "thedecorparty-9fef9";

if (!admin.apps.length) {
  admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
}

export interface VerifiedGoogleIdentity {
  uid: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  photoURL: string;
}

/**
 * Verifies a Firebase Auth ID token (minted client-side by
 * `signInWithPopup`/`signInWithRedirect` against a `GoogleAuthProvider`) and
 * returns the identity Google actually vouches for. Throws on any invalid,
 * expired, or forged token -- callers must not fall back to trusting the
 * request body if this rejects.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdentity> {
  const decoded = await admin.auth().verifyIdToken(idToken);

  if (!decoded.email) {
    throw Object.assign(new Error("Google account has no email address."), { statusCode: 400 });
  }

  // Extra guard: only accept tokens that actually came from the Google
  // Sign-In provider, not some other Firebase Auth method.
  const signInProvider = decoded.firebase?.sign_in_provider;
  if (signInProvider !== "google.com") {
    throw Object.assign(new Error("Unsupported sign-in provider."), { statusCode: 400 });
  }

  const fullName = typeof decoded.name === "string" ? decoded.name.trim() : "";
  const [firstName, ...rest] = fullName ? fullName.split(/\s+/) : [""];

  return {
    uid: decoded.uid,
    email: decoded.email,
    emailVerified: Boolean(decoded.email_verified),
    firstName: firstName || "",
    lastName: rest.join(" "),
    photoURL: typeof decoded.picture === "string" ? decoded.picture : "",
  };
}

export default admin;
