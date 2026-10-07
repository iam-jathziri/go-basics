import { defineStore } from 'pinia'

interface Usuario {
  id: number
  nombre: string
  email: string
  role: 'admin' | 'client'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: null as Usuario | null,
    token: localStorage.getItem('token') || ''
  }),
  getters: {
    estaLogueado: (state) => !!state.token,
    esAdmin: (state) => state.usuario?.role === 'admin'
  },
  actions: {
    login(usuario: Usuario, token: string) {
      this.usuario = usuario
      this.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
    },
    logout() {
      this.usuario = null
      this.token = ''
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    },
    restaurarSesion() {
      const guardado = localStorage.getItem('usuario')
      if (guardado && this.token) this.usuario = JSON.parse(guardado)
    }
  }
})