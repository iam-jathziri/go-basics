<template>
  <div class="vista">
    <NavBar />

    <div class="home">
      <!-- ===== MASTHEAD / HERO ===== -->
      <section class="masthead" id="inicio">
        <div class="texture"></div>
        <div class="masthead-grid">
          <div class="masthead-copy">
            <p class="kicker">— Cuaderno de viaje · México 2026 —</p>
            <h1>Un atlas vivo de<br><em>177 Pueblos Mágicos</em></h1>
            <p class="sub">Documentamos cada destino con su historia, su gastronomía y sus atractivos reales — para que armes tu propia ruta, guardes favoritos y compartas lo que descubras.</p>

            <div class="searchline">
              <span class="searchline-icon">⌕</span>
              <input v-model="busqueda" type="text" placeholder="¿A dónde quieres ir?" @keyup.enter="buscar">
              <button type="button" @click="buscar">Buscar</button>
            </div>

            <div class="mini-stats">
              <div v-for="s in stats" :key="s.label" class="mini-stat">
                <strong>{{ contadores[s.label] ?? 0 }}{{ s.suffix || '' }}</strong>
                <span>{{ s.label }}</span>
              </div>
            </div>
          </div>

          <div class="masthead-stack">
            <figure v-for="(foto, i) in fotosFlotantes" :key="i" class="stack-photo" :class="'sp' + (i+1)">
              <img :src="foto.img" :alt="foto.nombre">
              <figcaption>{{ foto.nombre }}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <!-- ===== TICKER ===== -->
      <div class="ticker-wrap">
        <div class="ticker">
          <span v-for="(e, i) in [...estadosMarquee, ...estadosMarquee]" :key="i">{{ e }}<i>◆</i></span>
        </div>
      </div>

      <!-- ===== PUEBLO DEL DÍA ===== -->
      <section class="section destacado-wrap">
        <div class="section-head">
          <span class="region-num">00</span>
          <h2>Entrada destacada de hoy</h2>
          <span class="region-line"></span>
        </div>

        <article class="destacado" @click="verDetalle(puebloDelDia.id)">
          <div class="destacado-foto">
            <img :src="puebloDelDia.imagenPrincipal" :alt="puebloDelDia.nombre">
            <span class="destacado-sello">{{ puebloDelDia.categoria }}</span>
          </div>
          <div class="destacado-cuerpo">
            <span class="estado-tag">{{ puebloDelDia.estado }} · N.º {{ String(puebloDelDia.id).padStart(3, '0') }}</span>
            <h3>{{ puebloDelDia.nombre }}</h3>
            <p>{{ puebloDelDia.descripcion }}</p>
            <span class="leer-mas grande">Leer la entrada completa <i>→</i></span>
          </div>
        </article>
      </section>

      <!-- ===== CATEGORÍAS ===== -->
      <section class="section categorias-wrap">
        <div class="section-head">
          <span class="region-num">01</span>
          <h2>Explora por tipo de experiencia</h2>
          <span class="region-line"></span>
        </div>
        <div class="categorias">
          <button
            v-for="(cat, i) in categorias"
            :key="cat"
            type="button"
            class="categoria-chip"
            :style="{ '--hue': huePorIndice(i) }"
            @click="explorarCategoria(cat)"
          >{{ cat }}</button>
        </div>
      </section>

      <!-- ===== MAPA DEL ATLAS ===== -->
      <section class="section mapa-wrap">
        <div class="section-head">
          <span class="region-num">02</span>
          <h2>El atlas, de un vistazo</h2>
          <span class="region-line"></span>
          <span class="ranking-nota">Toca un estado para explorar sus pueblos</span>
        </div>

        <div class="mapa-layout">
          <div class="mapa-svg-wrap">
            <svg :viewBox="mexicoViewBox" class="mapa-svg" role="img" aria-label="Mapa de México por estado">
              <path
                v-for="(e, i) in mapaEstados"
                :key="e.id"
                :d="e.d"
                class="estado-path"
                :class="{ activo: estadoHover === e.estado }"
                :style="{ '--hue': e.hue, '--luz': e.luz, '--delay': (i * 0.012) + 's' }"
                @mouseenter="estadoHover = e.estado"
                @mouseleave="estadoHover = null"
                @focus="estadoHover = e.estado"
                @click="explorarEstado(e.estado)"
                tabindex="0"
              >
                <title>{{ e.estado }} — {{ e.count }} {{ e.count === 1 ? 'pueblo' : 'pueblos' }}</title>
              </path>
            </svg>
          </div>

          <div class="mapa-panel">
            <transition name="pop" mode="out-in">
              <div v-if="estadoHoverInfo" :key="estadoHoverInfo.estado" class="mapa-info">
                <span class="kicker">— Estado —</span>
                <h3>{{ estadoHoverInfo.estado }}</h3>
                <p><strong>{{ estadoHoverInfo.count }}</strong> {{ estadoHoverInfo.count === 1 ? 'pueblo documentado' : 'pueblos documentados' }}</p>
                <span class="mapa-info-cta">Ver destinos →</span>
              </div>
              <div v-else key="vacio" class="mapa-info mapa-info--vacio">
                <span class="kicker">— Leyenda —</span>
                <h3>Pasa el cursor sobre un estado</h3>
                <p>Cada estado tiene su propio color. Tócalo para ver sus pueblos documentados.</p>
              </div>
            </transition>
          </div>
        </div>
      </section>

      <!-- ===== DESTACADOS ===== -->
      <section class="section" id="pueblos">
        <div class="section-head">
          <span class="region-num">03</span>
          <h2>Entradas recientes del atlas</h2>
          <span class="region-line"></span>
          <router-link to="/pueblos" class="ver-todos">Ver los 84 destinos →</router-link>
        </div>

        <div class="tarjetas">
          <article
            v-for="(pueblo, i) in pueblos"
            :key="pueblo.id"
            class="tarjeta"
            :style="{ '--hue': huePorIndice(i), '--delay': (i * 0.07) + 's' }"
            @click="verDetalle(pueblo.id)"
          >
            <div class="tarjeta-foto">
              <img :src="pueblo.imagenPrincipal" :alt="pueblo.nombre" loading="lazy">
              <span class="sello">{{ pueblo.categoria }}</span>
              <button class="fav-stamp" type="button" :class="{ on: favoritos.includes(pueblo.id) }" @click.stop="toggleFavorito(pueblo.id)">♥</button>
              <span class="entry-id">N.º {{ String(pueblo.id).padStart(3, '0') }}</span>
            </div>
            <div class="tarjeta-cuerpo">
              <span class="estado-tag">{{ pueblo.estado }}</span>
              <h3>{{ pueblo.nombre }}</h3>
              <p>{{ pueblo.descripcion }}</p>
              <span class="leer-mas">Explorar destino <i>→</i></span>
            </div>
          </article>
        </div>
      </section>

      <!-- ===== POR QUÉ ===== -->
      <section class="manifiesto" id="nosotros">
        <div class="texture light"></div>
        <div class="manifiesto-head">
          <span class="kicker light">— Nuestro enfoque —</span>
          <h2>Tres principios detrás de cada entrada del atlas</h2>
        </div>
        <div class="columnas">
          <div class="columna" v-for="(f, i) in features" :key="f.titulo">
            <span class="columna-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3>{{ f.titulo }}</h3>
            <p>{{ f.texto }}</p>
          </div>
        </div>
      </section>

      <!-- ===== TESTIMONIOS / POSTALES ===== -->
      <section class="section" id="testimonios">
        <div class="section-head">
          <span class="region-num">04</span>
          <h2>Postales de otros viajeros</h2>
          <span class="region-line"></span>
        </div>

        <div class="postales">
          <figure class="postal" v-for="(t, i) in testimonios" :key="t.nombre" :style="{ '--hue': huePorIndice(i + 2) }">
            <blockquote>“{{ t.texto }}”</blockquote>
            <figcaption>
              <span class="avatar">{{ t.nombre.charAt(0) }}</span>
              <span>
                <strong>{{ t.nombre }}</strong>
                <em>{{ t.lugar }}</em>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <!-- ===== CTA ===== -->
      <section class="cta">
        <div class="texture light"></div>
        <h2>Empieza tu propio cuaderno de ruta</h2>
        <p>Crea una cuenta para guardar favoritos, dejar comentarios y llevar el registro de los pueblos que ya visitaste.</p>
        <button type="button" @click="irALogin">Crear mi cuenta — es gratis</button>
      </section>

      <!-- ===== FOOTER ===== -->
      <footer class="footer">
        <div class="footer-brand">
          <svg viewBox="0 0 40 40" class="compass-svg">
            <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M20 8 L24 20 L20 32 L16 20 Z" fill="currentColor" opacity=".9"/>
            <circle cx="20" cy="20" r="2.5" fill="#D98E48"/>
          </svg>
          <span>Brújula<em>Verde</em></span>
        </div>
        <p>Un proyecto escolar documentando los Pueblos Mágicos de México.</p>
        <p class="copy">© 2026 Brújula Verde</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { pueblosMock, pueblosPorEstado } from '@/data/pueblosMock'
import { mexicoPaths, mexicoViewBox } from '@/data/mexicoPaths'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const auth = useAuthStore()

const pueblos = ref(pueblosMock.slice(0, 6))
const busqueda = ref('')
const favoritos = ref<number[]>([])

// Pueblo destacado del día: rota automáticamente, sin necesidad de backend
const puebloDelDia = computed(() => {
  const indice = new Date().getDate() % pueblosMock.length
  return pueblosMock[indice]
})

// Categorías únicas presentes en los datos, en el orden en que aparecen
const categorias = computed(() => {
  const vistas = new Set<string>()
  pueblosMock.forEach(p => vistas.add(p.categoria))
  return Array.from(vistas)
})

function explorarCategoria(cat: string) {
  router.push({ path: '/pueblos', query: { q: cat } })
}

// ===== Mapa real de México: geometría oficial de cada estado (32 paths) =====
const estadoHover = ref<string | null>(null)

// paleta de tonos variados, uno distinto por estado, estilo "mapa de pines"
const paletaMapa = [8, 28, 45, 95, 142, 165, 190, 205, 225, 262, 300, 330, 350, 18, 60, 120]

const mapaEstados = computed(() => {
  return mexicoPaths.map((p, i) => ({
    id: p.id,
    estado: p.estado,
    d: p.d,
    count: pueblosPorEstado[p.estado]?.length || 0,
    hue: paletaMapa[i % paletaMapa.length],
    luz: 72
  }))
})

const estadoHoverInfo = computed(() => {
  if (!estadoHover.value) return null
  return mapaEstados.value.find(e => e.estado === estadoHover.value) || null
})

function explorarEstado(estado: string) {
  router.push({ path: '/pueblos', query: { estado } })
}

const fotosFlotantes = pueblosMock.slice(0, 3).map(p => ({ img: p.imagenPrincipal, nombre: p.nombre }))
const estadosMarquee = ['OAXACA', 'JALISCO', 'QUINTANA ROO', 'MORELOS', 'SAN LUIS POTOSÍ', 'PUEBLA', 'CHIAPAS', 'GUANAJUATO', 'YUCATÁN', 'MICHOACÁN']

const hues = [152, 28, 190, 340, 45, 205]
function huePorIndice(i: number) {
  return hues[i % hues.length]
}

const stats = [
  { label: 'Pueblos documentados', target: 84 },
  { label: 'Estados cubiertos', target: 32 },
  { label: 'Años del programa', target: 25, suffix: '+' }
]
const contadores = reactive<Record<string, number>>({})

const features = [
  { titulo: 'Información verificada', texto: 'Historia, gastronomía y atractivos de cada pueblo, documentados entrada por entrada como un catálogo real.' },
  { titulo: 'Comunidad de viajeros', texto: 'Comenta, guarda tus favoritos y lee la experiencia de otras personas que ya recorrieron el destino.' },
  { titulo: 'Turismo consciente', texto: 'Promovemos visitar con respeto: apoyar comercio local y cuidar el entorno de cada comunidad.' }
]

const testimonios = [
  { nombre: 'María Fernanda', lugar: 'CDMX', texto: 'Encontré rincones de Tepoztlán que ni sabía que existían. Se siente como un mapa vivo, no una lista más.' },
  { nombre: 'Diego Ramírez', lugar: 'Guadalajara', texto: 'Guardé mis pueblos favoritos y organicé todo mi viaje por Jalisco en una tarde.' },
  { nombre: 'Ana Lucía', lugar: 'Puebla', texto: 'Me encantó leer comentarios reales de otros viajeros antes de decidir a dónde ir.' }
]

function verDetalle(id: number) {
  router.push(`/pueblo/${id}`)
}
function buscar() {
  router.push({ path: '/pueblos', query: busqueda.value ? { q: busqueda.value } : {} })
}
function irALogin() {
  if (auth.estaLogueado) return
  router.push('/login')
}
function toggleFavorito(id: number) {
  if (!auth.estaLogueado) {
    router.push({ path: '/login', query: { redirect: '/' } })
    return
  }
  const idx = favoritos.value.indexOf(id)
  if (idx >= 0) favoritos.value.splice(idx, 1)
  else favoritos.value.push(id)
}

let countObserver: IntersectionObserver
onMounted(() => {
  countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        stats.forEach(s => {
          let current = 0
          const step = Math.max(1, Math.ceil(s.target / 50))
          const tick = () => {
            current += step
            contadores[s.label] = Math.min(current, s.target)
            if (current < s.target) requestAnimationFrame(tick)
          }
          tick()
        })
        countObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.4 })
  const el = document.querySelector('.mini-stats')
  if (el) countObserver.observe(el)
})
onUnmounted(() => countObserver?.disconnect())
</script>

<style scoped>
.home{background:#FCFBF7;color:#20291f;}

/* ===== MASTHEAD ===== */
.masthead{position:relative;overflow:hidden;background:#1B4332;color:#FCFBF7;padding:60px 40px 70px;}
.texture{position:absolute;inset:0;opacity:.07;pointer-events:none;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:16px 16px;}
.texture.light{opacity:.5;background-image:radial-gradient(circle,#1B4332 1px,transparent 1px);}

.masthead-grid{position:relative;max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.1fr .9fr;gap:60px;align-items:center;}
.kicker{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:#9FCDAE;font-weight:700;margin-bottom:18px;}
.kicker.light{color:#5e8a6f;}

.masthead-copy h1{font-family:'Fraunces','Playfair Display',serif;font-weight:600;font-size:clamp(2.2rem,4.6vw,3.6rem);line-height:1.06;letter-spacing:-.01em;}
.masthead-copy h1 em{font-style:italic;color:#D98E48;}
.sub{margin-top:20px;max-width:480px;color:#C9DECB;font-size:1rem;line-height:1.65;}

.searchline{
  margin-top:30px;max-width:460px;display:flex;align-items:center;gap:8px;
  background:#FCFBF7;border-radius:10px;padding:5px 6px 5px 18px;box-shadow:0 10px 30px rgba(0,0,0,.22);
}
.searchline-icon{color:#1B4332;font-weight:700;}
.searchline input{flex:1;border:none;outline:none;padding:12px 0;font-family:'Poppins';font-size:.92rem;background:transparent;color:#20291f;}
.searchline button{background:#1B4332;color:#fff;border:none;padding:11px 20px;border-radius:7px;font-weight:700;font-size:.85rem;cursor:pointer;transition:background .2s;}
.searchline button:hover{background:#2E7D5B;}

.mini-stats{display:flex;gap:34px;margin-top:38px;flex-wrap:wrap;}
.mini-stat{display:flex;flex-direction:column;}
.mini-stat strong{font-family:'Fraunces','Playfair Display',serif;font-size:1.9rem;color:#D98E48;line-height:1;}
.mini-stat span{font-size:.72rem;color:#9FCDAE;text-transform:uppercase;letter-spacing:.06em;margin-top:6px;}

.masthead-stack{position:relative;height:420px;}
.stack-photo{
  position:absolute;border-radius:5px;overflow:hidden;box-shadow:0 20px 44px rgba(0,0,0,.35);
  border:5px solid #FCFBF7;
}
.stack-photo img{width:100%;height:100%;object-fit:cover;display:block;}
.stack-photo figcaption{
  position:absolute;bottom:0;left:0;right:0;padding:8px 10px 6px;
  background:linear-gradient(0deg,rgba(0,0,0,.6),transparent);
  color:#fff;font-size:.72rem;font-weight:700;
}
.sp1{width:230px;height:290px;top:0;left:30px;transform:rotate(-5deg);z-index:3;}
.sp2{width:190px;height:240px;top:190px;left:230px;transform:rotate(4deg);z-index:2;}
.sp3{width:170px;height:210px;top:30px;right:0;transform:rotate(7deg);z-index:1;}
@media (max-width:1040px){ .masthead-grid{grid-template-columns:1fr;} .masthead-stack{display:none;} }

/* ===== TICKER ===== */
.ticker-wrap{overflow:hidden;background:#D98E48;padding:11px 0;white-space:nowrap;}
.ticker{display:inline-block;animation:slide 28s linear infinite;color:#fff;font-weight:700;font-size:.82rem;letter-spacing:.04em;}
.ticker span{margin:0 22px;}
.ticker i{font-style:normal;margin-left:22px;opacity:.6;font-size:.6rem;}
@keyframes slide{to{transform:translateX(-50%);}}

/* ===== SECTIONS ===== */
.section{max-width:1240px;margin:0 auto;padding:70px 40px;}
.section-head{display:flex;align-items:baseline;gap:16px;margin-bottom:34px;flex-wrap:wrap;}
.region-num{font-family:'Fraunces','Playfair Display',serif;font-size:1rem;color:#C8763A;font-weight:700;opacity:.7;}
.section-head h2{font-family:'Fraunces','Playfair Display',serif;font-size:1.7rem;font-weight:600;color:#1B4332;}
.region-line{flex:1;height:1px;background:#e3ddc6;min-width:30px;}
.ver-todos{color:#1B4332;font-weight:700;font-size:.85rem;text-decoration:none;white-space:nowrap;}
.ver-todos:hover{text-decoration:underline;}

/* ===== TARJETAS (comparten lenguaje con PueblosView) ===== */
.tarjetas{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:24px;}
.tarjeta{
  background:#fff;border-radius:4px;overflow:hidden;cursor:pointer;border:1px solid #ece7d6;
  box-shadow:0 1px 2px rgba(27,38,30,.04);transition:transform .22s, box-shadow .22s, border-color .22s;
  animation:riseIn .5s cubic-bezier(.22,.9,.3,1) both;animation-delay:var(--delay,0s);
}
@keyframes riseIn{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
.tarjeta:hover{transform:translateY(-6px);border-color:hsl(var(--hue) 45% 55%);box-shadow:0 18px 34px -12px hsl(var(--hue) 50% 30% / .35);}
.tarjeta-foto{position:relative;height:180px;overflow:hidden;background:#eee;}
.tarjeta-foto img{width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.22,.9,.3,1);}
.tarjeta:hover .tarjeta-foto img{transform:scale(1.1) rotate(.4deg);}
.sello{position:absolute;top:10px;left:10px;background:hsl(var(--hue) 55% 28%);color:#fff;font-size:.65rem;font-weight:700;text-transform:uppercase;padding:5px 10px;border-radius:3px;}
.fav-stamp{position:absolute;top:8px;right:8px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.92);border:none;cursor:pointer;color:#c7c2ab;display:flex;align-items:center;justify-content:center;font-size:.95rem;transition:transform .18s,color .18s;}
.fav-stamp:hover{transform:scale(1.15);}
.fav-stamp.on{color:#C8763A;}
.entry-id{position:absolute;bottom:8px;left:10px;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:#fff;background:rgba(0,0,0,.35);padding:2px 7px;border-radius:3px;}
.tarjeta-cuerpo{padding:16px 18px 20px;}
.estado-tag{font-size:.7rem;font-weight:700;color:#8a9387;letter-spacing:.04em;text-transform:uppercase;}
.tarjeta-cuerpo h3{font-family:'Fraunces','Playfair Display',serif;font-size:1.12rem;font-weight:600;color:#1B4332;margin:4px 0 7px;}
.tarjeta-cuerpo p{font-size:.83rem;line-height:1.5;color:#5e6b5c;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:12px;}
.leer-mas{font-size:.78rem;font-weight:700;color:hsl(var(--hue) 50% 30%);display:inline-flex;align-items:center;gap:4px;}
.leer-mas i{font-style:normal;transition:transform .2s;}
.tarjeta:hover .leer-mas i{transform:translateX(4px);}

/* ===== PUEBLO DEL DÍA ===== */
.destacado{
  display:grid;grid-template-columns:1fr 1fr;gap:0;background:#fff;
  border:1px solid #ece7d6;border-radius:6px;overflow:hidden;cursor:pointer;
  box-shadow:0 1px 2px rgba(27,38,30,.04);transition:box-shadow .25s, transform .25s;
}
.destacado:hover{transform:translateY(-4px);box-shadow:0 22px 44px -16px rgba(27,67,50,.3);}
.destacado-foto{position:relative;min-height:280px;overflow:hidden;}
.destacado-foto img{width:100%;height:100%;object-fit:cover;transition:transform .6s;}
.destacado:hover .destacado-foto img{transform:scale(1.06);}
.destacado-sello{
  position:absolute;top:16px;left:16px;background:#1B4332;color:#fff;
  font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;
  padding:6px 12px;border-radius:3px;
}
.destacado-cuerpo{padding:38px 36px;display:flex;flex-direction:column;justify-content:center;}
.destacado-cuerpo h3{font-family:'Fraunces','Playfair Display',serif;font-size:2rem;font-weight:600;color:#1B4332;margin:10px 0 14px;}
.destacado-cuerpo p{color:#4e5a4c;line-height:1.65;font-size:.96rem;margin-bottom:20px;}
.leer-mas.grande{font-size:.88rem;}
@media (max-width:760px){ .destacado{grid-template-columns:1fr;} .destacado-foto{min-height:220px;} .destacado-cuerpo{padding:28px 24px;} }

/* ===== CATEGORÍAS ===== */
.categorias{display:flex;flex-wrap:wrap;gap:10px;}
.categoria-chip{
  background:#fff;border:1.5px solid #e3ddc6;color:hsl(var(--hue) 50% 28%);
  font-weight:700;font-size:.82rem;padding:10px 20px;border-radius:30px;cursor:pointer;
  transition:all .18s;
}
.categoria-chip:hover{background:hsl(var(--hue) 55% 42%);color:#fff;border-color:transparent;transform:translateY(-2px);}

/* ===== MAPA ===== */
.ranking-nota{font-size:.78rem;color:#8a9387;font-style:italic;}
.mapa-layout{
  display:grid;grid-template-columns:1fr 280px;gap:36px;align-items:start;
}
.mapa-svg-wrap{
  background:#fff;border:1px solid #ece7d6;border-radius:14px;padding:18px;
  box-shadow:0 1px 2px rgba(27,38,30,.04);
}
.mapa-svg{width:100%;height:auto;display:block;}
.estado-path{
  fill:hsl(var(--hue) 62% var(--luz,72%));
  stroke:#FCFBF7;stroke-width:1.4;stroke-linejoin:round;
  cursor:pointer;
  transform-box:fill-box;transform-origin:center;
  transition:fill .18s, transform .18s, filter .18s;
  animation:fadeInMapa .5s ease both;
  animation-delay:var(--delay,0s);
  outline:none;
}
.estado-path:hover,
.estado-path:focus-visible,
.estado-path.activo{
  filter:brightness(.88) saturate(1.15);
  transform:scale(1.015);
}
@keyframes fadeInMapa{from{opacity:0;}to{opacity:1;}}

.mapa-panel{position:sticky;top:90px;}
.mapa-info{
  background:#1B4332;color:#fff;border-radius:10px;padding:26px 24px;
  min-height:190px;display:flex;flex-direction:column;gap:6px;
}
.mapa-info .kicker{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:#9FCDAE;font-weight:700;}
.mapa-info h3{font-family:'Fraunces','Playfair Display',serif;font-weight:600;font-size:1.3rem;margin:6px 0 2px;}
.mapa-info p{color:#C9DECB;font-size:.88rem;line-height:1.5;}
.mapa-info strong{color:#fff;font-family:'Fraunces','Playfair Display',serif;font-size:1.1rem;}
.mapa-info-cta{margin-top:auto;color:#D98E48;font-weight:700;font-size:.82rem;}
.mapa-info--vacio{background:#F0EDDD;color:#2b352a;}
.mapa-info--vacio .kicker{color:#8a9387;}
.mapa-info--vacio h3{color:#1B4332;font-size:1.1rem;}
.mapa-info--vacio p{color:#5c6658;}
.pop-enter-active{transition:all .22s cubic-bezier(.34,1.56,.64,1);}
.pop-enter-from{opacity:0;transform:translateY(6px);}
.pop-leave-active{transition:opacity .12s;}
.pop-leave-to{opacity:0;}

@media (max-width:760px){
  .mapa-layout{grid-template-columns:1fr;}
  .mapa-panel{position:static;}
}

/* ===== MANIFIESTO ===== */
.manifiesto{position:relative;overflow:hidden;background:#F0EDDD;padding:70px 40px;}
.manifiesto-head{position:relative;text-align:center;max-width:560px;margin:0 auto 46px;}
.manifiesto-head h2{font-family:'Fraunces','Playfair Display',serif;font-size:clamp(1.5rem,3.4vw,2.2rem);color:#1B4332;margin-top:10px;}
.columnas{position:relative;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:40px;}
.columna{border-top:2px solid #1B4332;padding-top:18px;}
.columna-num{font-family:'Fraunces','Playfair Display',serif;font-size:1.6rem;color:#C8763A;font-weight:600;}
.columna h3{font-family:'Fraunces','Playfair Display',serif;font-size:1.15rem;color:#1B4332;margin:10px 0 8px;}
.columna p{font-size:.88rem;line-height:1.6;color:#4e5a4c;}

/* ===== POSTALES ===== */
.postales{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:26px;}
.postal{
  background:#fff;border:1px solid #ece7d6;border-left:4px solid hsl(var(--hue) 50% 42%);
  padding:26px 24px;position:relative;box-shadow:0 1px 2px rgba(27,38,30,.04);
}
.postal blockquote{font-family:'Fraunces','Playfair Display',serif;font-style:italic;color:#2b352a;font-size:1.02rem;line-height:1.55;margin-bottom:20px;}
.postal figcaption{display:flex;align-items:center;gap:12px;}
.avatar{width:36px;height:36px;border-radius:50%;background:hsl(var(--hue) 50% 42%);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'Fraunces','Playfair Display',serif;flex-shrink:0;}
.postal figcaption strong{display:block;color:#1B4332;font-size:.88rem;}
.postal figcaption em{font-style:normal;color:#8a9387;font-size:.74rem;}

/* ===== CTA ===== */
.cta{position:relative;overflow:hidden;background:#1B4332;color:#fff;text-align:center;padding:80px 24px;margin:0 40px 70px;border-radius:6px;}
.cta h2{position:relative;font-family:'Fraunces','Playfair Display',serif;font-size:clamp(1.6rem,3.6vw,2.3rem);margin-bottom:14px;}
.cta p{position:relative;color:#C9DECB;max-width:460px;margin:0 auto 28px;}
.cta button{position:relative;background:#D98E48;color:#fff;border:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:.95rem;cursor:pointer;transition:transform .2s;}
.cta button:hover{transform:translateY(-2px);}

/* ===== FOOTER ===== */
.footer{text-align:center;padding:40px 20px 50px;color:#8a9387;}
.footer-brand{display:flex;align-items:center;justify-content:center;gap:9px;color:#1B4332;margin-bottom:10px;}
.compass-svg{width:26px;height:26px;}
.footer-brand span{font-family:'Fraunces','Playfair Display',serif;font-weight:600;font-size:1.15rem;}
.footer-brand em{font-style:normal;color:#C8763A;}
.footer p{font-size:.85rem;}
.footer .copy{margin-top:10px;font-size:.74rem;color:#b1b9ad;}

@media (max-width:640px){
  .masthead{padding:40px 20px 50px;}
  .section{padding:50px 20px;}
  .manifiesto{padding:50px 20px;}
  .cta{margin:0 20px 50px;padding:56px 20px;}
}
</style>