import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const brujulaVerdeTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#2E7D5B',
    'primary-darken-1': '#1B4332',
    secondary: '#74C69D',
    accent: '#D98E48',
    error: '#C0392B',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'brujulaVerdeTheme',
    themes: { brujulaVerdeTheme },
  },
})
