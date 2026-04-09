import { useWorkerStore } from '../store/workerStore'
import { TRANSLATIONS } from './index'

export const useTranslation = () => {
  const language = useWorkerStore(s => s.language) || 'en'
  
  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS['en']
    return langDict[key] || TRANSLATIONS['en'][key] || key
  }
  
  return { t, language }
}
