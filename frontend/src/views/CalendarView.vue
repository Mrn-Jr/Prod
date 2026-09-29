<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
    <!-- Header Principal -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <span class="w-3 h-8 bg-blue-500 rounded-full inline-block"></span>
          Agenda de Cultos & Eventos
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Visão geral e planejamento da programação litúrgica da igreja
        </p>
      </div>

      <!-- Controles de Navegação e Modos -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Navegação de Data -->
        <div class="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-sm">
          <button 
            @click="navigatePeriod(-1)"
            class="p-2 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
            title="Anterior"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <button 
            @click="goToToday"
            class="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            Hoje
          </button>

          <button 
            @click="navigatePeriod(1)"
            class="p-2 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
            title="Próximo"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <span class="text-lg font-semibold text-slate-200 min-w-[160px] text-center">
          {{ currentPeriodLabel }}
        </span>

        <!-- Alternador Mensal / Semanal -->
        <div class="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-sm">
          <button 
            @click="viewMode = 'month'"
            :class="viewMode === 'month' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
            class="px-4 py-1.5 rounded-xl text-xs font-medium transition-all"
          >
            Mês
          </button>
          <button 
            @click="viewMode = 'week'"
            :class="viewMode === 'week' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'"
            class="px-4 py-1.5 rounded-xl text-xs font-medium transition-all"
          >
            Semana
          </button>
        </div>
      </div>
    </header>

    <!-- Legenda de Categorias -->
    <div class="flex items-center gap-6 mb-6 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 rounded-2xl px-5 py-3 backdrop-blur">
      <span class="font-semibold text-slate-300">Categorias:</span>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        <span>Culto Principal</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
        <span>Jovens / Adolescentes</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span>Oração & Intercessão</span>
      </div>
    </div>

    <!-- Grid do Calendário (Visão Mensal) -->
    <div v-if="viewMode === 'month'" class="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
      <!-- Dias da Semana -->
      <div class="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 pb-3 border-b border-slate-800">
        <span>Dom</span>
        <span>Seg</span>
        <span>Ter</span>
        <span>Qua</span>
        <span>Qui</span>
        <span>Sex</span>
        <span>Sáb</span>
      </div>

      <!-- Células dos Dias -->
      <div class="grid grid-cols-7 gap-2 mt-3">
        <div 
          v-for="(day, index) in monthDays" 
          :key="index"
          @click="selectDate(day.date)"
          :class="[
            'min-h-[100px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between',
            day.isCurrentMonth ? 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700' : 'bg-slate-950/30 border-transparent text-slate-600',
            isSelected(day.date) ? 'ring-2 ring-blue-500 border-transparent bg-blue-950/20' : '',
            isToday(day.date) ? 'border-blue-500/50 bg-blue-900/10' : ''
          ]"
        >
          <!-- Cabeçalho do Dia -->
          <div class="flex justify-between items-center">
            <span 
              :class="[
                'text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full',
                isToday(day.date) ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
              ]"
            >
              {{ day.dayNumber }}
            </span>
            <span v-if="day.events.length > 0" class="text-[10px] text-slate-500 font-medium">
              {{ day.events.length }} {{ day.events.length === 1 ? 'evento' : 'eventos' }}
            </span>
          </div>

          <!-- Indicadores de Pontos Coloridos por Categoria (Estilo Apple Calendar) -->
          <div class="mt-2 flex flex-wrap gap-1.5 items-center">
            <template v-for="event in day.events" :key="event.id_evento">
              <span 
                :class="getCategoryColorClass(event.categoria)"
                class="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                :title="`${event.titulo} (${event.hora_inicio_prevista})`"
              ></span>
            </template>
          </div>

          <!-- Prévia Resumida do Primeiro Evento -->
          <div v-if="day.events.length > 0" class="mt-2 truncate text-[11px] font-medium text-slate-300">
            <span class="text-blue-400 font-mono">{{ day.events[0].hora_inicio_prevista }}</span>
            <span class="ml-1">{{ day.events[0].titulo }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid do Calendário (Visão Semanal / Linha do Tempo) -->
    <div v-else class="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
      <div class="grid grid-cols-7 gap-3">
        <div 
          v-for="day in weekDays" 
          :key="day.dateStr"
          @click="selectDate(day.date)"
          :class="[
            'p-3 rounded-2xl border transition-all cursor-pointer flex flex-col',
            isSelected(day.date) ? 'ring-2 ring-blue-500 bg-blue-950/20 border-transparent' : 'bg-slate-900/60 border-slate-800'
          ]"
        >
          <div class="text-center pb-2 border-b border-slate-800">
            <span class="text-xs text-slate-400 font-medium uppercase">{{ day.weekDayName }}</span>
            <div 
              :class="isToday(day.date) ? 'bg-blue-600 text-white' : 'text-slate-200'"
              class="text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1"
            >
              {{ day.dayNumber }}
            </div>
          </div>

          <!-- Eventos do Dia na Visão Semanal -->
          <div class="mt-3 space-y-2 flex-1 min-h-[220px]">
            <div 
              v-for="event in day.events" 
              :key="event.id_evento"
              class="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 hover:border-slate-500 transition-all text-xs"
            >
              <div class="flex items-center gap-1.5 mb-1">
                <span :class="getCategoryColorClass(event.categoria)" class="w-2 h-2 rounded-full"></span>
                <span class="text-[10px] text-slate-400 font-mono">{{ event.hora_inicio_prevista }}</span>
              </div>
              <h4 class="font-semibold text-slate-200 truncate">{{ event.titulo }}</h4>
              <p class="text-[10px] text-slate-400 truncate mt-0.5">📍 {{ event.espaco_nome }}</p>
            </div>

            <div v-if="day.events.length === 0" class="h-full flex items-center justify-center text-slate-600 text-[11px] italic">
              Sem eventos
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Painel Lateral / Detalhamento do Dia Selecionado -->
    <div v-if="selectedDayDetails" class="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <span class="text-xs font-semibold text-blue-400 uppercase tracking-wider">Eventos do Dia</span>
          <h2 class="text-xl font-bold text-white mt-0.5">{{ selectedDateFormatted }}</h2>
        </div>
        
        <button 
          @click="openNewEventModal"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Novo Culto / Evento
        </button>
      </div>

      <!-- Lista de Eventos Simultâneos por Espaço Físico -->
      <div v-if="selectedDayEvents.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div 
          v-for="event in selectedDayEvents" 
          :key="event.id_evento"
          class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all relative overflow-hidden"
        >
          <!-- Faixa Lateral de Categoria -->
          <div :class="getCategoryBgClass(event.categoria)" class="absolute left-0 top-0 bottom-0 w-1.5"></div>

          <div class="pl-2">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                ⏱️ {{ event.hora_inicio_prevista }} - {{ event.hora_fim_prevista }}
              </span>

              <span 
                :class="getStatusBadgeClass(event.status)"
                class="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider"
              >
                {{ event.status }}
              </span>
            </div>

            <h3 class="text-lg font-bold text-white mb-1">{{ event.titulo }}</h3>
            <p class="text-xs text-slate-400 mb-4 line-clamp-2">{{ event.descricao }}</p>

            <div class="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
              <span class="text-slate-400 flex items-center gap-1.5">
                <span>📍</span> {{ event.espaco_nome }}
              </span>

              <div class="flex items-center gap-2">
                <button 
                  @click="goToLiveMode(event.id_evento)"
                  v-if="event.status === 'ao_vivo' || event.status === 'agendado'"
                  class="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Modo Ao Vivo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-slate-500 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
        <p class="text-sm">Nenhum evento agendado para esta data.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- ESTADO REATIVO ---
const viewMode = ref('month') // 'month' | 'week'
const currentDate = ref(new Date())
const selectedDate = ref(new Date())

// Dados simulados baseados na modelagem relacional (Igrejas_Locais, Eventos, Blocos)
const eventsList = ref([
  {
    id_evento: 1,
    titulo: "Culto de Celebração Noturno",
    descricao: "Culto principal com louvor e palavra congregacional.",
    data_evento: "2026-09-27",
    hora_inicio_prevista: "19:00",
    hora_fim_prevista: "20:30",
    espaco_nome: "Nave Principal",
    categoria: "Culto Principal",
    status: "agendado"
  },
  {
    id_evento: 2,
    titulo: "Encontro de Jovens - Rede Conectar",
    descricao: "Louvor dinâmico e bate-papo para adolescentes.",
    data_evento: "2026-09-27",
    hora_inicio_prevista: "19:30",
    hora_fim_prevista: "21:00",
    espaco_nome: "Espaço Kids / Anexo B",
    categoria: "Jovens / Adolescentes",
    status: "agendado"
  },
  {
    id_evento: 3,
    titulo: "Relógio de Oração Matutino",
    descricao: "Intercessão pela liderança e ministérios.",
    data_evento: "2026-09-22",
    hora_inicio_prevista: "07:00",
    hora_fim_prevista: "08:00",
    espaco_nome: "Capela",
    categoria: "Oração / Intercessão",
    status: "finalizado"
  }
])

// --- COMPUTED PROPERTIES ---
const currentPeriodLabel = computed(() => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
})

const selectedDateFormatted = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Gerador da grade de dias do mês
const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const days = []
  const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Domingo
  
  // Dias do mês anterior para preencher a primeira semana
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    days.push(createDayObject(d, false))
  }
  
  // Dias do mês atual
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push(createDayObject(d, true))
  }
  
  // Dias do próximo mês para completar 42 células
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push(createDayObject(d, false))
  }
  
  return days
})

// Gerador da semana atual
const weekDays = computed(() => {
  const curr = new Date(currentDate.value)
  const first = curr.getDate() - curr.getDay()
  const days = []
  
  const weekNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(curr.setDate(first + i))
    const dateStr = formatDateIso(nextDay)
    days.push({
      date: new Date(nextDay),
      dateStr,
      dayNumber: nextDay.getDate(),
      weekDayName: weekNames[i],
      events: eventsList.value.filter(e => e.data_evento === dateStr)
    })
  }
  return days
})

const selectedDayDetails = computed(() => selectedDate.value)

const selectedDayEvents = computed(() => {
  if (!selectedDate.value) return []
  const isoStr = formatDateIso(selectedDate.value)
  return eventsList.value.filter(e => e.data_evento === isoStr)
})

// --- FUNÇÕES AUXILIARES ---
function createDayObject(date, isCurrentMonth) {
  const dateStr = formatDateIso(date)
  return {
    date: new Date(date),
    dayNumber: date.getDate(),
    isCurrentMonth,
    events: eventsList.value.filter(e => e.data_evento === dateStr)
  }
}

function formatDateIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function selectDate(date) {
  selectedDate.value = new Date(date)
}

function isSelected(date) {
  if (!selectedDate.value) return false
  return formatDateIso(date) === formatDateIso(selectedDate.value)
}

function isToday(date) {
  return formatDateIso(date) === formatDateIso(new Date())
}

function navigatePeriod(step) {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + step))
  } else {
    currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() + (step * 7)))
  }
}

function goToToday() {
  currentDate.value = new Date()
  selectedDate.value = new Date()
}

function getCategoryColorClass(cat) {
  switch (cat) {
    case 'Culto Principal': return 'bg-blue-500'
    case 'Jovens / Adolescentes': return 'bg-purple-500'
    case 'Oração / Intercessão': return 'bg-emerald-500'
    default: return 'bg-slate-400'
  }
}

function getCategoryBgClass(cat) {
  switch (cat) {
    case 'Culto Principal': return 'bg-blue-500'
    case 'Jovens / Adolescentes': return 'bg-purple-500'
    case 'Oração / Intercessão': return 'bg-emerald-500'
    default: return 'bg-slate-500'
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'ao_vivo': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    case 'agendado': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'finalizado': return 'bg-slate-800 text-slate-400 border border-slate-700'
    default: return 'bg-slate-800 text-slate-400'
  }
}

function openNewEventModal() {
  alert('Modal de criação de novo evento/culto')
}

function goToLiveMode(id) {
  alert(`Redirecionando para o painel 'Acompanhamento ao Vivo' do evento ID: ${id}`)
}
</script>
