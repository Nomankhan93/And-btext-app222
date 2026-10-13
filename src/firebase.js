import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getRuntimeConfig } from './lib/env'

const config = getRuntimeConfig()

const firebaseConfig = {
  apiKey: config.firebaseApiKey,
  authDomain: config.firebaseAuthDomain,
  projectId: config.firebaseProjectId,
  storageBucket: config.firebaseStorageBucket,
  messagingSenderId: config.firebaseMessagingSenderId,
  appId: config.firebaseAppId,
  measurementId: config.firebaseMeasurementId,
}

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = config.firebaseConfigured ? getAuth(app) : null
export const db = config.firebaseConfigured ? getFirestore(app) : null
export const functions = config.firebaseConfigured ? getFunctions(app) : null
export const firebaseConfigured = config.firebaseConfigured
