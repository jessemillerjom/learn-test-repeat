import { Mistral } from '@mistralai/mistralai'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Missing MISTRAL_API_KEY environment variable')
}

export const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
}) 