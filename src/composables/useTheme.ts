import { ref, onMounted } from 'vue'

export function useTheme() {
  const isDarkMode = ref(true)

  const initTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      isDarkMode.value = saved === 'dark'
    } else {
      isDarkMode.value = !window.matchMedia('(prefers-color-scheme: light)').matches
    }
    applyTheme()
  }

  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  }

  onMounted(initTheme)

  return {
    isDarkMode,
    toggleTheme
  }
}
