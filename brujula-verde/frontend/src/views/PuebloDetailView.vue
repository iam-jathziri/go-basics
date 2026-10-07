<template>
  <div class="vista">
    <NavBar />

    <div v-if="pueblo" class="detalle-page">
      <!-- HERO -->
      <section class="hero-detalle" :style="{ backgroundImage: `url(${pueblo.imagenPrincipal})` }">
        <div class="hero-overlay"></div>
        <div class="hero-info">
          <button class="volver" type="button" @click="router.back()">← Volver</button>
          <span class="badge">{{ pueblo.categoria }}</span>
          <h1>{{ pueblo.nombre }}</h1>
          <p class="ubicacion">📍 {{ pueblo.estado }}</p>
          <div class="hero-actions">
            <button class="btn-fav" type="button" @click="toggleFavorito">
              {{ esFavorito ? '♥ En favoritos' : '♡ Agregar a favoritos' }}
            </button>
            <span v-if="pueblo.fechaNombramiento" class="fecha-chip">
              Pueblo Mágico desde {{ pueblo.fechaNombramiento }}
            </span>
          </div>
        </div>
      </section>

      <div class="contenido">
        <!-- DESCRIPCIÓN -->
        <section class="bloque">
          <h2><span class="icono">📖</span> Acerca de {{ pueblo.nombre }}</h2>
          <p class="texto-grande">{{ pueblo.descripcion }}</p>
        </section>

        <!-- HISTORIA -->
        <section class="bloque">
          <h2><span class="icono">🏛️</span> Historia</h2>
          <p v-if="pueblo.historia">{{ pueblo.historia }}</p>
          <p v-else class="placeholder">Estamos documentando la historia completa de este pueblo. Vuelve pronto para conocer más sobre su pasado.</p>
        </section>

        <!-- GALERÍA -->
        <section class="bloque" v-if="pueblo.galeria && pueblo.galeria.length">
          <h2><span class="icono">🖼️</span> Galería</h2>
          <div class="galeria">
            <div
              v-for="(img, i) in pueblo.galeria"
              :key="i"
              class="galeria-item"
              @click="imagenAbierta = img"
            >
              <img :src="img" :alt="`${pueblo.nombre} ${i + 1}`" loading="lazy">
            </div>
          </div>
        </section>
        <section class="bloque" v-else>
          <h2><span class="icono">🖼️</span> Galería</h2>
          <p class="placeholder">Próximamente más fotos de este destino.</p>
        </section>

        <!-- DOS COLUMNAS: ATRACTIVOS Y GASTRONOMÍA -->
        <div class="dos-columnas">
          <section class="bloque columna">
            <h2><span class="icono">🧭</span> Actividades y atractivos</h2>
            <ul class="lista-chips">
              <li v-for="(a, i) in pueblo.atractivos" :key="i">{{ a }}</li>
            </ul>
          </section>

          <section class="bloque columna">
            <h2><span class="icono">🍽️</span> Gastronomía típica</h2>
            <ul class="lista-chips gastronomia">
              <li v-for="(g, i) in pueblo.gastronomia" :key="i">{{ g }}</li>
            </ul>
          </section>
        </div>

        <!-- MAPA -->
        <section class="bloque">
          <h2><span class="icono">🗺️</span> Ubicación</h2>
          <div class="mapa-wrap">
            <iframe
              class="mapa"
              loading="lazy"
              :src="`https://www.google.com/maps?q=${pueblo.lat},${pueblo.lng}&z=12&output=embed`"
            ></iframe>
          </div>
          <p class="coords">Lat: {{ pueblo.lat }} · Lng: {{ pueblo.lng }}</p>
        </section>

        <!-- COMENTARIOS -->
        <section class="bloque">
          <h2><span class="icono">💬</span> Comentarios de viajeros</h2>

          <div v-if="auth.estaLogueado" class="form-comentario">
            <textarea v-model="nuevoComentario" placeholder="Comparte tu experiencia en este pueblo..." rows="3"></textarea>
            <button type="button" @click="agregarComentario" :disabled="!nuevoComentario.trim()">Publicar comentario</button>
          </div>
          <div v-else class="pide-login">
            <p>Inicia sesión para dejar tu comentario sobre {{ pueblo.nombre }}.</p>
            <button type="button" @click="irALogin">Iniciar sesión</button>
          </div>

          <div class="lista-comentarios">
            <div v-for="(c, i) in comentarios" :key="i" class="comentario">
              <div class="avatar">{{ c.nombre.charAt(0) }}</div>
              <div>
                <strong>{{ c.nombre }}</strong>
                <p>{{ c.texto }}</p>
              </div>
            </div>
            <p v-if="!comentarios.length" class="placeholder">Sé el primero en comentar sobre este pueblo.</p>
          </div>
        </section>
      </div>

      <!-- LIGHTBOX -->
      <div v-if="imagenAbierta" class="lightbox" @click="imagenAbierta = null">
        <img :src="imagenAbierta" alt="">
      </div>
    </div>

    <div v-else class="no-encontrado">
      <p>No encontramos este pueblo.</p>
      <router-link to="/pueblos">← Volver al listado</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPuebloPorId } from '@/data/pueblosMock'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const puebloId = computed(() => Number(route.params.id))
const pueblo = computed(() => getPuebloPorId(puebloId.value))

const favoritos = ref<number[]>([])
const esFavorito = computed(() => favoritos.value.includes(puebloId.value))

const imagenAbierta = ref<string | null>(null)
const nuevoComentario = ref('')
const comentarios = ref<{ nombre: string; texto: string }[]>([])

function toggleFavorito() {
  if (!auth.estaLogueado) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  const idx = favoritos.value.indexOf(puebloId.value)
  if (idx >= 0) favoritos.value.splice(idx, 1)
  else favoritos.value.push(puebloId.value)
}

function irALogin() {
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

function agregarComentario() {
  if (!nuevoComentario.value.trim()) return
  comentarios.value.unshift({
    nombre: auth.usuario?.nombre || 'Viajero',
    texto: nuevoComentario.value.trim()
  })
  nuevoComentario.value = ''
}
</script>

<style scoped>
.detalle-page{background:#fff;min-height:100vh;}

/* ===== HERO ===== */
.hero-detalle{
  position:relative;height:60vh;min-height:420px;background-size:cover;background-position:center;
  display:flex;align-items:flex-end;
}
.hero-overlay{
  position:absolute;inset:0;
  background:linear-gradient(0deg, rgba(15,46,33,.92) 0%, rgba(15,46,33,.5) 50%, rgba(15,46,33,.15) 100%);
}
.hero-info{position:relative;z-index:2;padding:0 48px 42px;max-width:900px;}
.volver{
  background:rgba(255,255,255,.15);backdrop-filter:blur(6px);color:#fff;border:none;
  padding:8px 16px;border-radius:30px;font-size:.82rem;font-weight:600;cursor:pointer;margin-bottom:18px;
}
.volver:hover{background:rgba(255,255,255,.25);}
.badge{
  display:inline-block;background:#D98E48;color:#fff;font-size:.75rem;font-weight:700;
  padding:5px 14px;border-radius:20px;letter-spacing:.5px;margin-bottom:10px;
}
.hero-info h1{font-family:'Playfair Display',serif;color:#fff;font-size:clamp(2rem,5vw,3.4rem);margin-bottom:6px;}
.ubicacion{color:#D8F3DC;font-weight:600;margin-bottom:18px;}
.hero-actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center;}
.btn-fav{
  background:#fff;color:#1B4332;border:none;padding:11px 22px;border-radius:30px;
  font-weight:700;font-size:.9rem;cursor:pointer;transition:transform .2s;
}
.btn-fav:hover{transform:translateY(-2px);}
.fecha-chip{color:rgba(255,255,255,.85);font-size:.82rem;background:rgba(255,255,255,.12);padding:8px 16px;border-radius:20px;}

/* ===== CONTENIDO ===== */
.contenido{max-width:900px;margin:0 auto;padding:50px 24px 100px;}
.bloque{margin-bottom:48px;}
.bloque h2{
  font-family:'Playfair Display',serif;color:#1B4332;font-size:1.5rem;
  display:flex;align-items:center;gap:10px;margin-bottom:16px;
}
.icono{font-size:1.2rem;}
.texto-grande{font-size:1.05rem;line-height:1.7;color:#3d4d43;}
.bloque p{color:#4a5c50;line-height:1.65;}
.placeholder{color:#a8b3ac;font-style:italic;}

/* ===== GALERÍA ===== */
.galeria{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;}
.galeria-item{border-radius:14px;overflow:hidden;cursor:pointer;height:160px;}
.galeria-item img{width:100%;height:100%;object-fit:cover;transition:transform .3s;}
.galeria-item:hover img{transform:scale(1.08);}

.lightbox{
  position:fixed;inset:0;background:rgba(10,20,15,.9);z-index:300;
  display:flex;align-items:center;justify-content:center;padding:30px;cursor:zoom-out;
}
.lightbox img{max-width:90%;max-height:90%;border-radius:12px;}

/* ===== DOS COLUMNAS ===== */
.dos-columnas{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:40px;}
.lista-chips{list-style:none;display:flex;flex-direction:column;gap:10px;}
.lista-chips li{
  background:#F5F9F6;border-left:3px solid #2E7D5B;padding:11px 16px;border-radius:0 10px 10px 0;
  color:#3d4d43;font-size:.92rem;
}
.lista-chips.gastronomia li{border-left-color:#D98E48;}

/* ===== MAPA ===== */
.mapa-wrap{border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(27,67,50,.12);}
.mapa{width:100%;height:320px;border:none;display:block;}
.coords{font-size:.78rem;color:#a8b3ac;margin-top:8px;}

/* ===== COMENTARIOS ===== */
.form-comentario{display:flex;flex-direction:column;gap:12px;margin-bottom:28px;}
.form-comentario textarea{
  padding:14px 16px;border-radius:14px;border:1.5px solid #dce7e0;font-family:'Poppins';
  font-size:.92rem;resize:vertical;outline:none;transition:border-color .2s;
}
.form-comentario textarea:focus{border-color:#2E7D5B;}
.form-comentario button{
  align-self:flex-end;background:linear-gradient(120deg,#1B4332,#2E7D5B);color:#fff;border:none;
  padding:11px 24px;border-radius:30px;font-weight:700;cursor:pointer;transition:opacity .2s;
}
.form-comentario button:disabled{opacity:.4;cursor:not-allowed;}

.pide-login{
  background:#F5F9F6;border-radius:14px;padding:20px;text-align:center;margin-bottom:28px;
}
.pide-login p{margin-bottom:12px;}
.pide-login button{
  background:#D98E48;color:#fff;border:none;padding:10px 22px;border-radius:30px;
  font-weight:700;cursor:pointer;
}

.lista-comentarios{display:flex;flex-direction:column;gap:16px;}
.comentario{display:flex;gap:14px;align-items:flex-start;}
.avatar{
  width:38px;height:38px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(120deg,#1B4332,#2E7D5B);color:#fff;
  display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'Playfair Display',serif;
}
.comentario strong{color:#1B4332;font-size:.9rem;}
.comentario p{font-size:.88rem;margin-top:2px;}

/* ===== NO ENCONTRADO ===== */
.no-encontrado{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#5c6b60;}
.no-encontrado a{color:#2E7D5B;font-weight:700;text-decoration:none;}

@media (max-width:640px){
  .hero-info{padding:0 20px 30px;}
}
</style>