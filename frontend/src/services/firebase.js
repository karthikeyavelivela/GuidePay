import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Only init if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    const result = await signInWithPopup(auth, provider)
    return {
      uid: result.user.uid,
      name: result.user.displayName,
      email: result.user.email,
      photo: result.user.photoURL,
      phone: result.user.phoneNumber,
    }
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
      throw new Error('Popup was blocked. Please allow popups for this site.')
    }
    throw err
  }
}

export const setupRecaptcha = (containerId) => {
  if (!window.recaptchaVerifier) {
    // Create container if it doesn't exist in DOM
    let el = document.getElementById(containerId)
    if (!el) {
      el = document.createElement('div')
      el.id = containerId
      document.body.appendChild(el)
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, el, {
      size: 'invisible',
      callback: () => {},
    })
  }
  return window.recaptchaVerifier
}
