import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { getLocaleMessage, resolveLocalizedValue, translate } from '@/i18n'
import { useLanguageStore } from '@/stores/language'

export function useAppI18n() {
  const languageStore = useLanguageStore()
  languageStore.hydrate()

  const { currentLanguage } = storeToRefs(languageStore)

  const t = (key, params = {}) => translate(currentLanguage.value, key, params)
  const tm = (key) => getLocaleMessage(currentLanguage.value, key)
  const localize = (value) => resolveLocalizedValue(currentLanguage.value, value)

  return {
    currentLanguage,
    isZh: computed(() => currentLanguage.value === 'zh'),
    setLanguage: languageStore.setLanguage,
    toggleLanguage: languageStore.toggleLanguage,
    t,
    tm,
    localize,
  }
}
