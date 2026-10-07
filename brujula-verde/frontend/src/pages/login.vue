<template>
  <div class="login-page">
    <div class="texture"></div>

    <router-link to="/" class="back-brand">
      <svg viewBox="0 0 40 40" class="compass-svg">
        <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M20 8 L24 20 L20 32 L16 20 Z" fill="currentColor" opacity=".9"/>
        <circle cx="20" cy="20" r="2.5" fill="#D98E48"/>
      </svg>
      <span>Brújula<em>Verde</em></span>
    </router-link>

    <div class="login-grid">
      <!-- Columna informativa -->
      <div class="login-side">
        <span class="kicker">— Acceso al atlas —</span>
        <h1>Tu cuaderno de<br><em>viaje personal</em></h1>
        <p>Guarda pueblos favoritos, deja comentarios y lleva el registro de cada destino que ya exploraste.</p>

        <ul class="checklist">
          <li><span>✓</span> 84 pueblos documentados a detalle</li>
          <li><span>✓</span> Favoritos sincronizados a tu cuenta</li>
          <li><span>✓</span> Comentarios de otros viajeros reales</li>
        </ul>
      </div>

      <!-- Tarjeta de formulario -->
      <div class="login-card">
        <div class="tabs">
          <button type="button" :class="{ active: modo === 'login' }" @click="modo = 'login'">Iniciar sesión</button>
          <button type="button" :class="{ active: modo === 'registro' }" @click="modo = 'registro'">Crear cuenta</button>
          <span class="tabs-indicator" :class="{ right: modo === 'registro' }"></span>
        </div>

        <transition name="swap" mode="out-in">
          <form v-if="modo === 'login'" key="login" @submit.prevent="iniciarSesion">
            <label>Correo electrónico
              <input v-model="form.email" type="email" placeholder="tucorreo@ejemplo.com" required>
            </label>
            <label>Contraseña
              <input v-model="form.password" type="password" placeholder="••••••••" required>
            </label>

            <transition name="pop">
              <p v-if="error" class="error">⚠ {{ error }}</p>
            </transition>

            <button type="submit" class="btn-main">Entrar al atlas</button>
            <p class="demo">Demo — admin@brujulaverde.com · cliente@brujulaverde.com · contraseña <b>1234</b></p>
          </form>

          <form v-else key="registro" @submit.prevent="registrar">
            <label>Nombre
              <input v-model="form.nombre" type="text" placeholder="Tu nombre" required>
            </label>
            <label>Correo electrónico
              <input v-model="form.email" type="email" placeholder="tucorreo@ejemplo.com" required>
            </label>
            <label>Contraseña
              <input v-model="form.password" type="password" placeholder="••••••••" required>
            </label>

            <transition name="pop">
              <p v-if="error" class="error">⚠ {{ error }}</p>
            </transition>

            <button type="submit" class="btn-main">Crear mi cuenta</button>
          </form>
        </transition>

        <p class="volver"><router-link to="/">← Seguir explorando sin cuenta</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const modo = ref<'login' | 'registro'>('login')
const error = ref('')
const form = reactive({ nombre: '', email: '', password: '' })

const usuariosMock = [
  { id: 1, nombre: 'Admin Brújula', email: 'admin@brujulaverde.com', password: '1234', role: 'admin' as const },
  { id: 2, nombre: 'Turista Demo', email: 'cliente@brujulaverde.com', password: '1234', role: 'client' as const }
]

function iniciarSesion() {
  error.value = ''
  const encontrado = usuariosMock.find(u => u.email === form.email && u.password === form.password)
  if (!encontrado) {
    error.value = 'Correo o contraseña incorrectos'
    return
  }
  auth.login(
    { id: encontrado.id, nombre: encontrado.nombre, email: encontrado.email, role: encontrado.role },
    'token-falso-' + encontrado.id
  )
  router.push((route.query.redirect as string) || '/')
}

function registrar() {
  error.value = ''
  auth.login({ id: 99, nombre: form.nombre, email: form.email, role: 'client' }, 'token-falso-nuevo')
  router.push('/')
}
</script>

<style scoped>
.login-page{
  position:relative;min-height:100vh;background:#1B4332;color:#fff;
  padding:28px 40px 60px;overflow:hidden;
}
.texture{position:absolute;inset:0;opacity:.07;pointer-events:none;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:16px 16px;}

.back-brand{position:relative;z-index:2;display:inline-flex;align-items:center;gap:9px;text-decoration:none;color:#fff;}
.compass-svg{width:26px;height:26px;}
.back-brand span{font-family:'Fraunces','Playfair Display',serif;font-weight:600;font-size:1.15rem;}
.back-brand em{font-style:normal;color:#D98E48;}

.login-grid{
  position:relative;z-index:2;max-width:1100px;margin:0 auto;padding-top:60px;
  display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center;
}

.login-side{color:#fff;}
.kicker{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:#9FCDAE;font-weight:700;}
.login-side h1{font-family:'Fraunces','Playfair Display',serif;font-weight:600;font-size:clamp(2rem,4vw,2.9rem);line-height:1.08;margin:16px 0 18px;}
.login-side h1 em{font-style:italic;color:#D98E48;}
.login-side > p{color:#C9DECB;max-width:380px;line-height:1.6;margin-bottom:28px;}
.checklist{list-style:none;display:flex;flex-direction:column;gap:12px;}
.checklist li{color:#dcebdf;font-size:.9rem;display:flex;align-items:center;gap:10px;}
.checklist span{width:22px;height:22px;border-radius:50%;background:#2E7D5B;display:flex;align-items:center;justify-content:center;font-size:.7rem;flex-shrink:0;}

.login-card{
  background:#FCFBF7;color:#20291f;border-radius:8px;padding:38px 36px 32px;
  box-shadow:0 30px 70px rgba(0,0,0,.35);
  animation:cardIn .5s cubic-bezier(.22,.9,.3,1) both;
}
@keyframes cardIn{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}

.tabs{position:relative;display:flex;background:#EFEADA;border-radius:8px;padding:4px;margin-bottom:24px;}
.tabs button{
  position:relative;z-index:1;flex:1;border:none;background:none;padding:10px;
  font-weight:700;font-size:.85rem;color:#6b7368;cursor:pointer;transition:color .2s;
}
.tabs button.active{color:#fff;}
.tabs-indicator{
  position:absolute;top:4px;left:4px;width:calc(50% - 4px);height:calc(100% - 8px);
  background:#1B4332;border-radius:6px;transition:transform .3s cubic-bezier(.65,0,.35,1);
}
.tabs-indicator.right{transform:translateX(100%);}

form{display:flex;flex-direction:column;gap:14px;}
label{display:flex;flex-direction:column;gap:6px;font-size:.78rem;font-weight:700;color:#3d4a3a;}
input{
  padding:12px 14px;border-radius:7px;border:1.5px solid #e3ddc6;background:#fff;
  font-family:'Poppins';font-size:.92rem;outline:none;transition:border-color .2s, box-shadow .2s;
}
input:focus{border-color:#1B4332;box-shadow:0 0 0 3px rgba(27,67,50,.12);}

.error{color:#a4402a;font-size:.82rem;background:#fbe9e4;padding:8px 12px;border-radius:7px;font-weight:600;}

.btn-main{
  margin-top:6px;background:#1B4332;color:#fff;border:none;padding:13px;
  border-radius:8px;font-weight:700;font-size:.95rem;cursor:pointer;transition:background .2s, transform .15s;
}
.btn-main:hover{background:#2E7D5B;transform:translateY(-1px);}

.demo{margin-top:4px;text-align:center;font-size:.72rem;color:#8a9387;background:#F0EDDD;border-radius:7px;padding:8px 10px;line-height:1.4;}
.demo b{color:#1B4332;}

.volver{text-align:center;margin-top:22px;font-size:.84rem;}
.volver a{color:#1B4332;font-weight:700;text-decoration:none;}
.volver a:hover{text-decoration:underline;}

.swap-enter-active,.swap-leave-active{transition:all .22s ease;}
.swap-enter-from{opacity:0;transform:translateX(10px);}
.swap-leave-to{opacity:0;transform:translateX(-10px);}
.pop-enter-active{transition:all .22s cubic-bezier(.34,1.56,.64,1);}
.pop-enter-from{opacity:0;transform:scale(.85) translateY(-4px);}

@media (max-width:860px){
  .login-page{padding:24px 20px 50px;}
  .login-grid{grid-template-columns:1fr;gap:40px;padding-top:40px;}
  .login-side{text-align:center;}
  .checklist{align-items:center;}
}
</style>