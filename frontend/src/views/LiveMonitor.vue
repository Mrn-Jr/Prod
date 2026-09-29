<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// --- DADOS SIMULADOS DO CULTO (MOCK DATA PARA O CULTO DE AMANHÃ) ---
const eventTitle = ref('Passos de Fé')
const eventLocation = ref('Templo Principal')
const serviceDate = ref('Amanhã')

const blocks = ref([
  {
    id: 1,
    title: 'Louvor',
    responsible: 'Banda',
    durationMinutes: 15,
    isFlexible: false,
    status: 'completed', // 'completed', 'active', 'pending'
    plannedStart: '20:00',
    plannedEnd: '20:15',
    actualStart: '20:00',
    actualEnd: null
  },
  {
    id: 2,
    title: 'Oração',
    responsible: 'Pastor',
    durationMinutes: 10,
    isFlexible: true,
    status: 'active',
    plannedStart: '20:15',
    plannedEnd: '20:25',
    actualStart: '20:15',
    actualEnd: null
  },
  {
    id: 3,
    title: 'Ofertório',
    responsible: 'Pastor',
    durationMinutes: 5,
    isFlexible: true,
    status: 'pending',
    plannedStart: '20:25',
    plannedEnd: '21:30',
    actualStart: null,
    actualEnd: null
  },
  {
    id: 4,
    title: 'Música Ofertório',
    responsible: 'Banda',
    durationMinutes: 5,
    isFlexible: false,
    status: 'pending',
    plannedStart: '20:30',
    plannedEnd: '20:35',
    actualStart: null,
    actualEnd: null
  },
  {
    id: 5,
    title: 'Palavra',
    responsible: 'Pastor', 
    durationMinutes: 35,
    isFlexible: false,
    status: 'pending',
    plannedStart: '21:15',
    plannedEnd: '21:25',
    actualStart: null,
    actualEnd: null
  },  
  {
    id: 5,
    title: 'Ministração',
    responsible: 'Pastor',
    durationMinutes: 10,
    isFlexible: true,
    status: 'pending',
    plannedStart: '21:15',
    plannedEnd: '21:25',
    actualStart: null,
    actualEnd: null
  },
  {
    id: 5,
    title: 'Oração Final',
    responsible: 'Pastor',
    durationMinutes: 5,
    isFlexible: true,
    status: 'pending',
    plannedStart: '21:25',
    plannedEnd: '21:30',
    actualStart: null,
    actualEnd: null
  }
])

const currentBlockIndex = ref(1) // Bloco #2 está ativo
const isRunning = ref(false)
const elapsedTimeSeconds = ref(0)
let timerInterval = null

// --- PROPRIEDADES COMPUTADAS ---
const activeBlock = computed(() => blocks.value[currentBlockIndex.value] || null)

const activePlannedSeconds = computed(() => {
  return activeBlock.value ? activeBlock.value.durationMinutes * 60 : 0
})
const remainingSeconds = computed(() => {
  return activePlannedSeconds.value - elapsedTimeSeconds.value
})

const isOvertime = computed(() => remainingSeconds.value < 0)

// --- ATRASO ACUMULADO EM TEMPO REAL ---
// Soma em segundos o atraso de todos os blocos concluídos + o atraso do bloco atual
const totalAccumulatedDelaySeconds = computed(() => {
  const completedDelay = blocks.value
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.delaySeconds || 0), 0)

  const activeDelay = isOvertime.value ? Math.abs(remainingSeconds.value) : 0

  return completedDelay + activeDelay
})

// Formata o atraso acumulado no formato +MM:SS (ex: +03:15)
const formattedTotalDelay = computed(() => {
  const totalSecs = totalAccumulatedDelaySeconds.value
  const m = Math.floor(totalSecs / 60).toString().padStart(2, '0')
  const s = (totalSecs % 60).toString().padStart(2, '0')
  return `+${m}:${s}`
})

const statusColor = computed(() => {
  if (!activeBlock.value) return 'neutral'
  if (remainingSeconds.value < 0) return 'red' // Atraso / Tempo excedido
  if (remainingSeconds.value <= 120) return 'yellow' // Alerta de 2 minutos finais
  return 'green' // Dentro do tempo
})

const formattedTimer = computed(() => {
  const secs = Math.abs(remainingSeconds.value)
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return isOvertime.value ? `+${m}:${s}` : `${m}:${s}`
})

const formattedElapsed = computed(() => {
  const m = Math.floor(elapsedTimeSeconds.value / 60).toString().padStart(2, '0')
  const s = (elapsedTimeSeconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// --- AÇÕES DO DIRETOR / OPERADOR ---
const toggleTimer = () => {
  isRunning.value = !isRunning.value
}

const adjustTime = (minutes) => {
  if (!activeBlock.value) return
  activeBlock.value.durationMinutes = Math.max(1, activeBlock.value.durationMinutes + minutes)
}

const nextBlock = () => {
  if (currentBlockIndex.value < blocks.value.length - 1) {
    if (activeBlock.value) {
      activeBlock.value.status = 'completed'
      const now = new Date()
      activeBlock.value.actualEnd = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      // Salva o atraso acumulado deste bloco se estourou a duração prevista
      const plannedSecs = activeBlock.value.durationMinutes * 60
      activeBlock.value.delaySeconds = Math.max(0, elapsedTimeSeconds.value - plannedSecs)
    }
    currentBlockIndex.value++
    activeBlock.value.status = 'active'
    const now = new Date()
    activeBlock.value.actualStart = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    elapsedTimeSeconds.value = 0
    isRunning.value = true
  } else {
    if (activeBlock.value) {
      activeBlock.value.status = 'completed'
      const plannedSecs = activeBlock.value.durationMinutes * 60
      activeBlock.value.delaySeconds = Math.max(0, elapsedTimeSeconds.value - plannedSecs)
    }
    isRunning.value = false
  }
}

const previousBlock = () => {
  if (currentBlockIndex.value > 0) {
    if (activeBlock.value) {
      activeBlock.value.status = 'pending'
      activeBlock.value.delaySeconds = 0
    }
    currentBlockIndex.value--
    activeBlock.value.status = 'active'
    activeBlock.value.delaySeconds = 0
    elapsedTimeSeconds.value = 0
  }
}

// Motores de compensação de tempo
const pushSchedule = () => {
  const delayMinutes = Math.ceil(Math.abs(remainingSeconds.value) / 60)
  if (delayMinutes <= 0) return
  alert(`Agenda empurrada! Os horários dos blocos seguintes foram ajustados em +${delayMinutes} min.`)
}

const compensateNextBlocks = () => {
  const delayMinutes = Math.ceil(Math.abs(remainingSeconds.value) / 60)
  if (delayMinutes <= 0) return

  let remainingToCompensate = delayMinutes
  for (let i = currentBlockIndex.value + 1; i < blocks.value.length; i++) {
    if (blocks.value[i].isFlexible && blocks.value[i].durationMinutes > 5) {
      const reduction = Math.min(remainingToCompensate, blocks.value[i].durationMinutes - 5)
      blocks.value[i].durationMinutes -= reduction
      remainingToCompensate -= reduction
      if (remainingToCompensate <= 0) break
    }
  }
  alert(`Compensação realizada! Duração dos blocos flexíveis futuros foi ajustada.`)
}

onMounted(() => {
  timerInterval = setInterval(() => {
    if (isRunning.value) {
      elapsedTimeSeconds.value++
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-slate-100 p-4 md:p-8 font-sans">
    <!-- CABEÇALHO DO MONITOR AO VIVO -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
      <div>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
            <span class="w-2 h-2 rounded-full bg-red-500"></span> AO VIVO
          </span>
          <h1 class="text-2xl font-bold tracking-tight text-white">{{ eventTitle }}</h1>
        </div>
      </div>

      <!-- STATUS RESUMIDO E COMPENSAÇÃO -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-zinc-900/90 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium">
          Atraso Acumulado: 
          <span :class="totalAccumulatedDelaySeconds > 0 ? 'text-red-400 font-bold font-mono' : 'text-emerald-400 font-bold font-mono'">
            {{ formattedTotalDelay }}
          </span>
        </div>
        <div v-if="isOvertime" class="flex items-center gap-2 bg-red-950/60 border border-red-800 text-red-300 px-4 py-2.5 rounded-lg text-xs font-medium">
           Atraso no Bloco: +{{ Math.ceil(Math.abs(remainingSeconds) / 60) }} min
        </div>
        <div v-else class="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-4 py-3.5 rounded-lg text-xs font-medium">
           Bloco dentro do tempo
        </div>
      </div>
    </header>

    <!-- PAINEL PRINCIPAL EM GRADE (CRONÔMETRO + LINHA DO TEMPO) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- LADO ESQUERDO: PAINEL DO CRONÔMETRO E CONTROLES (7 COLS) -->
      <main class="lg:col-span-7 flex flex-col gap-6">
        
        <!-- CARD DO CRONÔMETRO PRINCIPAL -->
        <div 
          class="relative overflow-hidden rounded-2xl border p-6 md:p-8 flex flex-col items-center justify-center transition-all duration-300 shadow-2xl"
          :class="{
            'bg-emerald-950/30 border-emerald-500/40 shadow-emerald-950/20': statusColor === 'green',
            'bg-amber-950/30 border-amber-500/40 shadow-amber-950/20': statusColor === 'yellow',
            'bg-red-950/40 border-red-500/60 shadow-red-950/40 animate-pulse-slow': statusColor === 'red',
            'bg-slate-900 border-slate-800': statusColor === 'neutral'
          }"
        >
          <!-- INDICADOR TOPO -->
          <div class="text-center mb-2">
            <h2 class="text-xl md:text-2xl font-bold text-white mt-1">
              {{ activeBlock?.title || 'Nenhum bloco ativo' }}
            </h2>
          </div>

          <!-- DISPLAY DO CRONÔMETRO -->
          <div class="my-6 text-center">
            <div 
              class="font-mono text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter"
              :class="{
                'text-emerald-400': statusColor === 'green',
                'text-amber-400': statusColor === 'yellow',
                'text-red-400': statusColor === 'red',
                'text-slate-200': statusColor === 'neutral'
              }"
            >
              {{ formattedTimer }}
            </div>

            <!-- SUB-INFORMAÇÕES DE TEMPO -->
            <div class="flex items-center justify-center gap-4 text-xs font-medium text-slate-400 mt-2">
              <span>Decorrido: <strong class="text-slate-200">{{ formattedElapsed }}</strong></span>
              <span>•</span>
              <span>Previsto: <strong class="text-slate-200">{{ activeBlock?.durationMinutes }} min</strong></span>
            </div>
          </div>

          <!-- BOTÕES DE CONTROLE PRINCIPAIS -->
          <div class="flex flex-wrap items-center justify-center gap-3 w-full max-w-md mt-2">
            <button 
              @click="toggleTimer"
              class="flex-1 min-w-[120px] py-3.5 px-5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              :class="isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'"
            >
              <span v-if="isRunning"> Pausar</span>
              <span v-else> Iniciar</span>
            </button>

            <button 
              @click="previousBlock"
              class="flex-1 min-w-[140px] py-3.5 px-5 rounded-xl bg-[#848484] hover:bg-zinc-900/90 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span> Bloco Anterior</span>
            </button>

            <button 
              @click="nextBlock"
              class="flex-1 min-w-[140px] py-3.5 px-5 rounded-xl bg-[#848484] hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span> Próximo Bloco</span>
            </button>          
          </div>

          <!-- AJUSTES RÁPIDOS DE TEMPO -->
          <div class="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-800/80 w-full">
            <span class="text-xs text-slate-400 mr-1">Ajuste rápido:</span>
            <button @click="adjustTime(-1)" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300">-1m</button>
            <button @click="adjustTime(1)" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300">+1m</button>
            <button @click="adjustTime(5)" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300">+5m</button>
          </div>
        </div>

        <!-- PAINEL DE GESTÃO DE IMPREVISTOS / RECÁLCULO DINÂMICO -->
        <div v-if="isOvertime" class="bg-slate-900 border border-red-900/50 rounded-xl p-5 shadow-lg">
          <h3 class="text-sm font-bold text-red-400 flex items-center gap-2 mb-2">
            Recálculo Dinâmico
          </h3>
          <p class="text-xs text-slate-300 mb-4">
            O bloco atual ultrapassou a duração limite. Como você deseja reajustar a programação do culto?
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              @click="pushSchedule"
              class="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              Empurrar Toda a Agenda (+{{ Math.ceil(Math.abs(remainingSeconds) / 60) }} min)
            </button>
          </div>
        </div>

      </main>

      <!-- LADO DIREITO: LINHA DO TEMPO DA LITURGIA (5 COLS) -->
      <aside class="lg:col-span-5 bg-zinc-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-xl">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            Ordem do Culto
          </h3>
          <span class="text-xs text-slate-400 font-mono">{{ blocks.length }} blocos</span>
        </div>

        <!-- LISTA DE BLOCOS (TIMELINE VERTICAL) -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-1">
          <div 
            v-for="(block, idx) in blocks" 
            :key="block.id"
            class="relative border rounded-xl p-3.5 transition-all duration-200"
            :class="{
              'bg-emerald-950/30 border-emerald-500/40 ring-1 ring-indigo-500/30': block.status === 'active',
              'bg-zinc-950 border-emerald-500/40 opacity-60': block.status === 'completed',
              'bg-zinc-950 border-emerald-500/40': block.status === 'pending'
            }"
          >
            <!-- CABEÇALHO DO ITEM -->
            <div class="flex items-start justify-between gap-2 mb-1">
              <div class="flex items-center gap-2">
                <span 
                  class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  :class="{
                    'bg-emerald-950/30 text-white': block.status === 'active',
                    'bg-slate-700 text-slate-300': block.status === 'completed',
                    'bg-slate-800 text-slate-400': block.status === 'pending'
                  }"
                >
                  {{ idx + 1 }}
                </span>
                <h4 class="text-xs font-bold text-white">{{ block.title }}</h4>
              </div>

              <span 
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                :class="{
                  'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse': block.status === 'active',
                  'bg-emerald-500/10 text-emerald-400': block.status === 'completed',
                  'bg-slate-800 text-slate-400': block.status === 'pending'
                }"
              >
                {{ block.status === 'active' ? 'EM ANDAMENTO' : block.status === 'completed' ? 'CONCLUÍDO' : 'PENDENTE' }}
              </span>
            </div>

            <!-- DETALHES -->
            <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
              <span>👤 {{ block.responsible }}</span>
              <div class="flex items-center gap-2 font-mono">
                <span>⏱ {{ block.durationMinutes }} min</span>
                <span v-if="block.isFlexible" class="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded">Flexível</span>
              </div>
            </div>
          </div>
        </div>

        <!-- AÇÕES INFERIORES -->
        <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Acompanhamento em Tempo Real</span>
        </div>
      </aside>

    </div>
  </div>
</template>

<style scoped>
@keyframes pulseSlow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
.animate-pulse-slow {
  animation: pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
