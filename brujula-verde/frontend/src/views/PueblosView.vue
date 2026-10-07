<template>
  <div class="vista">
    <NavBar />

    <div class="atlas-page">
      <!-- MASTHEAD -->
      <section class="masthead">
        <div class="texture"></div>
        <p class="kicker">— Atlas de viaje · Edición 2026 —</p>
        <h1>Los <em>84</em> destinos<br>que estamos documentando</h1>
        <p class="sub">De los 177 Pueblos Mágicos de México, reunimos los más representativos de cada uno de los 32 estados. Busca por nombre, filtra por región, o simplemente déjate llevar.</p>

        <div class="searchline">
          <span class="searchline-icon">⌕</span>
          <input v-model="busqueda" type="text" placeholder="Tepoztlán, Oaxaca, costero…">
          <span class="searchline-count">{{ totalResultados }} resultados</span>
        </div>
      </section>

      <!-- INDEX / RAIL DE ESTADOS -->
      <nav class="rail" aria-label="Filtrar por estado">
        <button
          type="button"
          class="rail-item"
          :class="{ active: estadoActivo === 'todos' }"
          @click="estadoActivo = 'todos'"
        >Todos los estados</button>
        <button
          v-for="estado in estadosLista"
          :key="estado"
          type="button"
          class="rail-item"
          :class="{ active: estadoActivo === estado }"
          @click="estadoActivo = estado"
        >{{ estado }}</button>
      </nav>

      <!-- CONTENIDO -->
      <main class="contenido">
        <template v-if="estadosFiltrados.length">
          <section v-for="(estado, bi) in estadosFiltrados" :key="estado" class="region" :style="{ '--hue': huePorIndice(bi) }">
            <div class="region-head">
              <span class="region-num">{{ String(bi + 1).padStart(2, '0') }}</span>
              <h2>{{ estado }}</h2>
              <span class="region-line"></span>
              <span class="region-count">{{ puebloFiltrados(estado).length }} pueblo{{ puebloFiltrados(estado).length === 1 ? '' : 's' }}</span>
            </div>

            <div class="tarjetas">
              <article
                v-for="(pueblo, ci) in puebloFiltrados(estado)"
                :key="pueblo.id"
                class="tarjeta"
                :style="{ '--delay': (ci * 0.06) + 's' }"
                @click="verDetalle(pueblo.id)"
              >
                <div class="tarjeta-foto">
                  <img :src="pueblo.imagenPrincipal" :alt="pueblo.nombre" loading="lazy">
                  <span class="sello">{{ pueblo.categoria }}</span>
                  <button class="fav-stamp" type="button" :class="{ on: favoritos.includes(pueblo.id) }" @click.stop="toggleFavorito(pueblo.id)">
                    ♥
                  </button>
                  <span class="entry-id">N.º {{ String(pueblo.id).padStart(3, '0') }}</span>
                </div>
                <div class="tarjeta-cuerpo">
                  <h3>{{ pueblo.nombre }}</h3>
                  <p>{{ pueblo.descripcion }}</p>
                  <span class="leer-mas">Explorar destino <i>→</i></span>
                </div>
              </article>
            </div>
          </section>
        </template>

        <div v-else class="vacio">
          <p>No hay coincidencias para «{{ busqueda }}».</p>
          <button type="button" @click="busqueda = ''">Limpiar búsqueda</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { pueblosPorEstado, estadosLista, pueblosMock } from '@/data/pueblosMock'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const busqueda = ref('')
const estadoActivo = ref('todos')
const favoritos = ref<number[]>([])

// Si llegamos desde el Home con ?q= (categoría/búsqueda) o ?estado=, precargamos el filtro
onMounted(() => {
  const q = route.query.q
  const estado = route.query.estado
  if (typeof q === 'string') busqueda.value = q
  if (typeof estado === 'string' && estadosLista.includes(estado)) estadoActivo.value = estado
})

// Paleta de 6 matices (hue de HSL) que roto por región, para que no todo sea
// el mismo verde plano: da variedad cromática sin salirse de la identidad.
const hues = [152, 28, 190, 340, 45, 205]
function huePorIndice(i: number) {
  return hues[i % hues.length]
}

function puebloFiltrados(estado: string) {
  const texto = busqueda.value.trim().toLowerCase()
  const lista = pueblosPorEstado[estado] || []
  if (!texto) return lista
  if (estado.toLowerCase().includes(texto)) return lista
  return lista.filter(p => p.nombre.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto))
}

const estadosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  const base = estadoActivo.value === 'todos' ? estadosLista : [estadoActivo.value]
  if (!texto) return base
  return base.filter(estado =>
    estado.toLowerCase().includes(texto) ||
    (pueblosPorEstado[estado] || []).some(p => p.nombre.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto))
  )
})

const totalResultados = computed(() =>
  estadosFiltrados.value.reduce((acc, estado) => acc + puebloFiltrados(estado).length, 0)
)

function verDetalle(id: number) {
  router.push(`/pueblo/${id}`)
}

function toggleFavorito(id: number) {
  if (!auth.estaLogueado) {
    router.push({ path: '/login', query: { redirect: '/pueblos' } })
    return
  }
  const idx = favoritos.value.indexOf(id)
  if (idx >= 0) favoritos.value.splice(idx, 1)
  else favoritos.value.push(id)
}

void pueblosMock
</script>

<style scoped>
.atlas-page{
  background:#FCFBF7;
  min-height:100vh;
  color:#20291f;
}

/* ===== MASTHEAD ===== */
.masthead{
  position:relative;overflow:hidden;
  padding:64px 40px 40px;
  background:#1B4332;
  color:#FCFBF7;
}
.texture{
  position:absolute;inset:0;opacity:.07;pointer-events:none;
  background-image:radial-gradient(circle, #fff 1px, transparent 1px);
  background-size:16px 16px;
}
.kicker{
  position:relative;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;
  color:#9FCDAE;font-weight:700;margin-bottom:18px;
}
.masthead h1{
  position:relative;font-family:'Fraunces','Playfair Display',serif;font-weight:600;
  font-size:clamp(2.1rem,5.2vw,3.6rem);line-height:1.04;letter-spacing:-.01em;max-width:780px;
}
.masthead h1 em{font-style:italic;color:#D98E48;}
.masthead .sub{
  position:relative;max-width:560px;margin-top:20px;color:#C9DECB;font-size:1rem;line-height:1.6;
}

.searchline{
  position:relative;margin-top:34px;max-width:620px;
  display:flex;align-items:center;gap:10px;
  background:#FCFBF7;border-radius:10px;padding:4px 18px;
  box-shadow:0 10px 30px rgba(0,0,0,.2);
}
.searchline-icon{color:#1B4332;font-size:1.1rem;font-weight:700;}
.searchline input{
  flex:1;border:none;outline:none;padding:13px 0;font-family:'Poppins',sans-serif;
  font-size:.95rem;color:#20291f;background:transparent;
}
.searchline-count{font-size:.74rem;color:#7c8a7f;white-space:nowrap;border-left:1px solid #e3e3dc;padding-left:12px;}

/* ===== RAIL ===== */
.rail{
  display:flex;gap:6px;overflow-x:auto;white-space:nowrap;
  padding:16px 40px;border-bottom:1px solid #e9e4d3;
  background:#FCFBF7;scrollbar-width:thin;
}
.rail::-webkit-scrollbar{height:4px;}
.rail::-webkit-scrollbar-thumb{background:#d8d2bb;border-radius:4px;}
.rail-item{
  flex-shrink:0;background:none;border:1px solid #e3ddc6;color:#51604f;
  font-size:.8rem;font-weight:600;padding:8px 16px;border-radius:20px;cursor:pointer;
  transition:all .18s;
}
.rail-item:hover{border-color:#1B4332;color:#1B4332;}
.rail-item.active{background:#1B4332;color:#FCFBF7;border-color:#1B4332;}

/* ===== CONTENIDO ===== */
.contenido{max-width:1240px;margin:0 auto;padding:10px 40px 100px;}

.region{
  margin-top:56px;
  padding-top:8px;
  border-top:1px dashed #d8d2bb;
}
.region-head{
  display:flex;align-items:baseline;gap:16px;margin-bottom:28px;flex-wrap:wrap;
}
.region-num{
  font-family:'Fraunces','Playfair Display',serif;font-size:1rem;color:hsl(var(--hue) 45% 42%);
  font-weight:700;opacity:.65;
}
.region-head h2{
  font-family:'Fraunces','Playfair Display',serif;font-size:1.65rem;font-weight:600;
  color:#1B4332;letter-spacing:-.01em;
}
.region-line{flex:1;height:1px;background:#e3ddc6;min-width:30px;}
.region-count{font-size:.76rem;color:#8a9387;font-weight:600;}

.tarjetas{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:22px;
}
.tarjeta{
  background:#fff;border-radius:4px;overflow:hidden;cursor:pointer;
  border:1px solid #ece7d6;
  box-shadow:0 1px 2px rgba(27,38,30,.04);
  transition:transform .22s ease, box-shadow .22s ease, border-color .22s;
  animation:riseIn .5s cubic-bezier(.22,.9,.3,1) both;
  animation-delay:var(--delay, 0s);
}
@keyframes riseIn{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
.tarjeta:hover{
  transform:translateY(-6px);
  border-color:hsl(var(--hue) 45% 55%);
  box-shadow:0 18px 34px -12px hsl(var(--hue) 50% 30% / .35);
}

.tarjeta-foto{position:relative;height:172px;overflow:hidden;background:#eee;}
.tarjeta-foto img{
  width:100%;height:100%;object-fit:cover;
  filter:saturate(1.05);
  transition:transform .5s cubic-bezier(.22,.9,.3,1);
}
.tarjeta:hover .tarjeta-foto img{transform:scale(1.1) rotate(.4deg);}

.sello{
  position:absolute;top:10px;left:10px;
  background:hsl(var(--hue) 55% 28%);color:#fff;
  font-size:.65rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;
  padding:5px 10px;border-radius:3px;
}
.fav-stamp{
  position:absolute;top:8px;right:8px;width:30px;height:30px;border-radius:50%;
  background:rgba(255,255,255,.92);border:none;cursor:pointer;color:#c7c2ab;
  display:flex;align-items:center;justify-content:center;font-size:.95rem;
  transition:transform .18s, color .18s;
}
.fav-stamp:hover{transform:scale(1.15);}
.fav-stamp.on{color:#C8763A;}

.entry-id{
  position:absolute;bottom:8px;left:10px;
  font-family:'JetBrains Mono', monospace;font-size:.65rem;letter-spacing:.03em;
  color:#fff;background:rgba(0,0,0,.35);padding:2px 7px;border-radius:3px;
}

.tarjeta-cuerpo{padding:16px 18px 20px;}
.tarjeta-cuerpo h3{
  font-family:'Fraunces','Playfair Display',serif;font-size:1.12rem;font-weight:600;
  color:#1B4332;margin-bottom:7px;
}
.tarjeta-cuerpo p{
  font-size:.83rem;line-height:1.5;color:#5e6b5c;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
  margin-bottom:12px;
}
.leer-mas{
  font-size:.78rem;font-weight:700;color:hsl(var(--hue) 50% 30%);
  display:inline-flex;align-items:center;gap:4px;
}
.leer-mas i{font-style:normal;transition:transform .2s;}
.tarjeta:hover .leer-mas i{transform:translateX(4px);}

/* ===== VACÍO ===== */
.vacio{text-align:center;padding:90px 20px;color:#7c8a7f;}
.vacio button{
  margin-top:14px;background:#1B4332;color:#fff;border:none;padding:10px 22px;
  border-radius:8px;font-weight:700;cursor:pointer;font-size:.85rem;
}

@media (max-width:640px){
  .masthead{padding:44px 20px 32px;}
  .rail{padding:14px 20px;}
  .contenido{padding:10px 20px 80px;}
}
</style>