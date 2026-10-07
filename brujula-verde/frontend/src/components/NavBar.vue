<template>
  <header class="topbar" :class="{ scrolled }">
    <router-link to="/" class="brand">
      <span class="brand-mark">
        <svg viewBox="0 0 40 40" class="compass-svg">
          <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M20 8 L24 20 L20 32 L16 20 Z" fill="currentColor" opacity=".9"/>
          <circle cx="20" cy="20" r="2.5" fill="#D98E48"/>
        </svg>
      </span>
      <span class="brand-text">Brújula<em>Verde</em></span>
    </router-link>

    <nav class="nav-links">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="{ activo: esActivo(link.to) }"
      >{{ link.texto }}</router-link>
    </nav>

    <button class="btn-session" type="button" @click="irALogin">
      <span class="dot" v-if="auth.estaLogueado"></span>
      {{ auth.estaLogueado ? auth.usuario?.nombre : 'Iniciar sesión' }}
    </button>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const scrolled = ref(false)

const links = [
  { to: '/', texto: 'Inicio' },
  { to: '/pueblos', texto: 'Atlas' },
  { to: '/#nosotros', texto: 'Nosotros' },
  { to: '/#testimonios', texto: 'Historias' },
]

// Vue Router ignora el #hash al marcar enlaces activos, así que "/",
// "/#nosotros" y "/#testimonios" quedarían los tres subrayados en el home.
// Aquí se compara ruta + hash para que solo se marque uno.
function esActivo(to: string) {
  const [path, hash = ''] = to.split('#')
  if (path === '/pueblos') return route.path.startsWith('/pueblo')
  return route.path === path && route.hash === (hash ? `#${hash}` : '')
}

function onScroll() {
  scrolled.value = window.scrollY > 12
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function irALogin() {
  if (auth.estaLogueado) return
  router.push('/login')
}
</script>

<style scoped>
.topbar{
  position:sticky;top:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 40px;
  background:#FCFBF7;
  border-bottom:1px solid transparent;
  transition:border-color .25s, box-shadow .25s, padding .25s;
}
.topbar.scrolled{
  border-bottom-color:#e4ddc9;
  box-shadow:0 2px 16px rgba(27,38,30,.06);
  padding:10px 40px;
}

.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#1B4332;}
.brand-mark{color:#1B4332;width:30px;height:30px;display:flex;}
.compass-svg{width:100%;height:100%;}
.brand:hover .compass-svg{animation:spin 1.2s ease;}
@keyframes spin{to{transform:rotate(360deg);}}
.brand-text{font-family:'Fraunces','Playfair Display',serif;font-weight:600;font-size:1.3rem;letter-spacing:-.01em;}
.brand-text em{font-style:normal;color:#C8763A;}

.nav-links{display:flex;gap:6px;}
.nav-links a{
  text-decoration:none;color:#445148;font-weight:600;font-size:.86rem;
  padding:8px 14px;border-radius:7px;position:relative;transition:color .2s, background .2s;
}
.nav-links a:hover{background:#eef3ec;color:#1B4332;}
.nav-links a.activo{color:#1B4332;}
.nav-links a.activo::after{
  content:'';position:absolute;left:14px;right:14px;bottom:2px;height:2px;background:#C8763A;border-radius:2px;
}

.btn-session{
  background:#1B4332;color:#FCFBF7;border:none;padding:9px 20px;
  border-radius:8px;font-weight:700;font-size:.84rem;cursor:pointer;
  display:flex;align-items:center;gap:7px;transition:background .2s, transform .15s;
}
.btn-session:hover{background:#2E7D5B;transform:translateY(-1px);}
.btn-session .dot{width:7px;height:7px;border-radius:50%;background:#8FD4A8;box-shadow:0 0 0 3px rgba(143,212,168,.25);}

@media (max-width:860px){
  .nav-links{display:none;}
  .topbar{padding:12px 20px;}
}
</style>
