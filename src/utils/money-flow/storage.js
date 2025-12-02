const SETTINGS_KEY = 'salaryCalculatorSettings'

export const StorageUtils = {
  saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  },

  loadSettings() {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY)
      if (savedSettings)
        return JSON.parse(savedSettings)
    } catch (error) {
      console.error('加载设置出错:', error)
    }
    return null
  },
}
