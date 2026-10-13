import { httpsCallable } from 'firebase/functions'
import { functions, firebaseConfigured } from '../firebase'

export function assertFirebaseConfigured() {
  if (!firebaseConfigured || !functions) {
    throw new Error('Firebase is not configured.')
  }
  return functions
}

export async function callFirebaseRpc(rpcName: string, params: Record<string, unknown> = {}): Promise<{ data: unknown; error: unknown }> {
  try {
    const fn = assertFirebaseConfigured()
    const callable = httpsCallable(fn, rpcName)
    const result = await callable(params)
    return { data: result.data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}
