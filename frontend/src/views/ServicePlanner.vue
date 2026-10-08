<script setup>
import { ref, computed } from 'vue'

// --- ESTADO DO CULTO / EVENTO ---
const eventTitle = ref('Culto de Celebração')
const eventLocation = ref('Templo Principal')
const serviceDate = ref(new Date().toISOString().substring(0, 10))
const startTime = ref('19:00')

// --- LISTA DE BLOCOS DA LITURGIA ---
const blocks = ref([
  {
    id: 1,
    title: 'Oração Inicial e Boas-Vindas',
    responsible: 'Pr. Lucas',
    durationMinutes: 5,
    isFlexible: false,
    description: 'Abertura, leitura bíblica inicial e acolhimento.'
  },
  {
    id: 2,
    title: 'Louvor e Adoração',
    responsible: 'Ministério de Louvor',
    durationMinutes: 25,
    isFlexible: true,
    description: 'Bloco de músicas congregacionais.'
  },
  {
    id: 3,
    title: 'Avisos e Dízimos/Ofertas',
    responsible: 'Diaconia / Comunicação',
    durationMinutes: 10,
    isFlexible: true,
    description: 'Vídeo de avisos da semana e momento de gratidão.'
  },
  {
    id: 4,
    title: 'Ministração da Palavra (Pregação)',
    responsible: 'Pr. Marcos',
    durationMinutes: 40,
    isFlexible: false,
    description: 'Sermão principal do culto.'
  },
  {
    id: 5,
    title: 'Apelo e Oração Final',
    responsible: 'Equipe de Apelo',
    durationMinutes: 10,
    isFlexible: true,
    description: 'Oração pelos enfermos, novos convertidos e bênção apostólica.'
  }
])

// Novo bloco formulário rápido
const newBlockTitle = ref('')
const newBlockResponsible = ref('')
const newBlockDuration = ref(10)
const newBlockIsFlexible = ref(false)

// Feedback de gravação
const saveNotification = ref(false)

// --- AUXILIARES DE CÁLCULO DE TEMPO ---
const addMinutesToTime = (timeStr, minutesToAdd) => {
  if (!timeStr || !timeStr.includes(':')) return '19:00'
  const [hours, mins] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, mins, 0, 0)
  date.setMinutes(date.getMinutes() + minutesToAdd)
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

// --- PROPRIEDADES COMPUTADAS COM CÁLCULO AUTOMÁTICO DE HORÁRIOS ---
const computedBlocks = computed(() => {
  let currentStart = startTime.value || '19:00'

  return blocks.value.map((block, index) => {
    const plannedStart = currentStart
    const duration = Number(block.durationMinutes) || 0
    const plannedEnd = addMinutesToTime(plannedStart, duration)
    
    // Atualiza a hora de início para o próximo bloco
    currentStart = plannedEnd

    return {
      ...block,
      blockOrder: index + 1,
      plannedStart,
      plannedEnd
    }
  })
})

const totalDurationMinutes = computed(() => {
  return blocks.value.reduce((sum, b) => sum + (Number(b.durationMinutes) || 0), 0)
})

const calculatedEndTime = computed(() => {
  return addMinutesToTime(startTime.value, totalDurationMinutes.value)
})

const flexibleBlocksCount = computed(() => {
  return blocks.value.filter(b => b.isFlexible).length
})

const formattedTotalDuration = computed(() => {
  const hours = Math.floor(totalDurationMinutes.value / 60)
  const mins = totalDurationMinutes.value % 60
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${mins} min`
})

// --- AÇÕES DE GESTÃO DA LITURGIA ---
const addBlock = () => {
  if (!newBlockTitle.value.trim()) return

  const newId = blocks.value.length > 0 ? Math.max(...blocks.value.map(b => b.id)) + 1 : 1
  blocks.value.push({
    id: newId,
    title: newBlockTitle.value.trim(),
    responsible: newBlockResponsible.value.trim() || 'Equipe Geral',
    durationMinutes: Number(newBlockDuration.value) || 5,
    isFlexible: newBlockIsFlexible.value,
    description: ''
  })

  // Limpa o formulário rápido
  newBlockTitle.value = ''
  newBlockResponsible.value = ''
  newBlockDuration.value = 10
  newBlockIsFlexible.value = false
}

const removeBlock = (index) => {
  blocks.value.splice(index, 1)
}

const moveBlockUp = (index) => {
  if (index <= 0) return
  const item = blocks.value.splice(index, 1)[0]
  blocks.value.splice(index - 1, 0, item)
}

const moveBlockDown = (index) => {
  if (index >= blocks.value.length - 1) return
  const item = blocks.value.splice(index, 1)[0]
  blocks.value.splice(index + 1, 0, item)
}

const duplicateBlock = (index) => {
  const source = blocks.value[index]
  const newId = Math.max(...blocks.value.map(b => b.id)) + 1
  blocks.value.splice(index + 1, 0, {
    ...source,
    id: newId,
    title: `${source.title} (Cópia)`
  })
}

// Modelos Pré-Configurados (Templates Rápidos)
const applyTemplate = (templateType) => {
  if (templateType === 'domingo') {
    eventTitle.value = 'Culto de Celebração de Domingo'
    startTime.value = '19:00'
    blocks.value = [
      { id: 1, title: 'Oração Inicial e Boas-Vindas', responsible: 'Dirigente', durationMinutes: 5, isFlexible: false, description: '' },
      { id: 2, title: 'Louvor e Adoração', responsible: 'Ministério de Louvor', durationMinutes: 30, isFlexible: true, description: '' },
      { id: 3, title: 'Avisos e Dízimos/Ofertas', responsible: 'Comunicação', durationMinutes: 10, isFlexible: true, description: '' },
      { id: 4, title: 'Pregação da Palavra', responsible: 'Pastor Titular', durationMinutes: 45, isFlexible: false, description: '' },
      { id: 5, title: 'Apelo e Bênção Apostólica', responsible: 'Equipe de Apelo', durationMinutes: 10, isFlexible: true, description: '' }
    ]
  } else if (templateType === 'ensino') {
    eventTitle.value = 'Culto de Doutrina e Ensino'
    startTime.value = '19:30'
    blocks.value = [
      { id: 1, title: 'Oração e Leitura Bíblica', responsible: 'Diaconia', durationMinutes: 10, isFlexible: false, description: '' },
      { id: 2, title: 'Cânticos de Louvor', responsible: 'Equipe de Cânticos', durationMinutes: 15, isFlexible: true, description: '' },
      { id: 3, title: 'Estudo Bíblico Expositivo', responsible: 'Pr. Instrutor', durationMinutes: 55, isFlexible: false, description: '' },
      { id: 4, title: 'Oração Final e Comunhão', responsible: 'Todos', durationMinutes: 10, isFlexible: true, description: '' }
    ]
  }
}

// Salvar Programação para o Monitor ao Vivo (localStorage / Estado)
const saveSchedule = () => {
  const scheduleData = {
    eventTitle: eventTitle.value,
    eventLocation: eventLocation.value,
    serviceDate: serviceDate.value,
    startTime: startTime.value,
    totalDurationMinutes: totalDurationMinutes.value,
    calculatedEndTime: calculatedEndTime.value,
    blocks: computedBlocks.value,
    updatedAt: new Date().toISOString()
  }

  try {
    localStorage.setItem('church_service_schedule', JSON.stringify(scheduleData))
  } catch (e) {
    console.warn('Não foi possível salvar no localStorage:', e)
  }

  saveNotification.value = true
  setTimeout(() => {
    saveNotification.value = false
  }, 3000)
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-slate-100 p-4 md:p-8 font-sans">
    
    <!-- NOTIFICAÇÃO DE SALVAMENTO -->
    <div 
      v-if="saveNotification" 
      class="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce"
    >
      <span class="text-xl">✅</span>
      <div>
        <h4 class="font-bold text-sm">Programação Salva!</h4>
        <p class="text-xs text-emerald-100">Pronta para ser transmitida no Monitor ao Vivo.</p>
      </div>
    </div>

    <!-- CABEÇALHO PRINCIPAL DA TELA -->
    <header class="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
      <div>
        <div class="flex items-center gap-2 text-3xl font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          <span>Planejador</span>
        </div>
      </div>

      <!-- TEMPLATES RÁPIDOS E AÇÃO DE SALVAR -->
      <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
        <button 
          @click="applyTemplate('domingo')"
          class="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5"
        >
          Template Domingo
        </button>
        <button 
          @click="applyTemplate('ensino')"
          class="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5"
        >
          Template Ensino
        </button>
        <button 
          @click="saveSchedule"
          class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950 flex items-center gap-2 ml-auto lg:ml-0"
        >
          <span>Salvar e Iniciar Culto</span>
        </button>
      </div>
    </header>

    <!-- CONTEÚDO PRINCIPAL (PAINEL DE CONFIGURAÇÃO + LINHA DO TEMPO) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- COLUNA DA ESQUERDA: INFORMAÇÕES GERAIS E RESUMO (4 COLS) -->
      <aside class="lg:col-span-4 flex flex-col gap-6">
        
        <!-- CARD DE CONFIGURAÇÕES DO EVENTO -->
        <div class="bg-zinc-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h2 class="text-sm font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <span>Dados do Culto</span>
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Título do Culto / Evento</label>
              <input 
                v-model="eventTitle"
                type="text" 
                placeholder="Ex: Culto de Celebração"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">Local / Espaço</label>
              <input 
                v-model="eventLocation"
                type="text" 
                placeholder="Ex: Templo Principal"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Data</label>
                <input 
                  v-model="serviceDate"
                  type="date" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-1 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Horário de Início</label>
                <input 
                  v-model="startTime"
                  type="time" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-1 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- CARD DE RESUMO TEMPORAL (MÉTRICAS AUTOMÁTICAS) -->
        <div class="bg-zinc-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
          <h2 class="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-4 border-b border-indigo-500/20 pb-3">
            <span>Resumo da Cronologia</span>
          </h2>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Duração Total</span>
              <span class="text-lg font-extrabold text-white font-mono mt-0.5 block">{{ formattedTotalDuration }}</span>
            </div>

            <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Término Previsto</span>
              <span class="text-lg font-extrabold text-emerald-400 font-mono mt-0.5 block">{{ calculatedEndTime }}</span>
            </div>

            <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Total de Blocos</span>
              <span class="text-lg font-extrabold text-slate-200 font-mono mt-0.5 block">{{ blocks.length }}</span>
            </div>

            <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Flexíveis</span>
              <span class="text-lg font-extrabold text-amber-400 font-mono mt-0.5 block">{{ flexibleBlocksCount }}</span>
            </div>
          </div>

          <p class="text-[11px] text-indigo-200/70 mt-4 bg-indigo-900/20 p-2.5 rounded-lg border border-indigo-500/20 leading-relaxed">
            <strong>Dica Litúrgica:</strong> Blocos flexíveis podem ser encurtados automaticamente pelo motor de compensação caso o louvor ou avisos ultrapassem o tempo.
          </p>
        </div>

        <!-- ADICIONAR NOVO BLOCO RÁPIDO -->
        <div class="bg-zinc-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h2 class="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <span>Adicionar Etapa / Bloco</span>
          </h2>

          <form @submit.prevent="addBlock" class="space-y-3">
            <div>
              <input 
                v-model="newBlockTitle"
                type="text" 
                placeholder="Título do Bloco (ex: Oração Final)"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <input 
                v-model="newBlockResponsible"
                type="text" 
                placeholder="Responsável"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <div class="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <input 
                  v-model.number="newBlockDuration"
                  type="number" 
                  min="1"
                  max="180"
                  class="w-full bg-transparent text-xs text-white text-right focus:outline-none font-mono"
                  required
                />
                <span class="text-[11px] text-slate-400">min</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input 
                  type="checkbox" 
                  v-model="newBlockIsFlexible"
                  class="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Permitir flexibilização</span>
              </label>

              <button 
                type="submit"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                + Incluir
              </button>
            </div>
          </form>
        </div>

      </aside>

      <!-- COLUNA DA DIREITA: SEQUÊNCIA DOS BLOCOS DA LITURGIA (8 COLS) -->
      <main class="lg:col-span-8 bg-zinc-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-xl">
        
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
            Ordem do Culto
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Edite a duração diretamente nos blocos para ver o cálculo de horários em tempo real.
            </p>
          </div>
          <span class="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
            {{ computedBlocks.length }} momentos
          </span>
        </div>

        <!-- LISTA INTERATIVA DE BLOCOS -->
        <div class="space-y-3 flex-1 overflow-y-auto pr-1">
          <div 
            v-for="(block, idx) in computedBlocks" 
            :key="block.id"
            class="bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 group relative"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              <!-- ESQUERDA: NÚMERO DA ORDEM + TÍTULO E RESPONSÁVEL -->
              <div class="flex items-start gap-3 flex-1">
                <div class="flex flex-col items-center gap-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold font-mono">
                    {{ block.blockOrder }}
                  </span>

                  <!-- BOTÕES DE REORDENAÇÃO -->
                  <div class="flex flex-col gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="moveBlockUp(idx)" 
                      :disabled="idx === 0"
                      class="text-[10px] text-slate-400 hover:text-white disabled:opacity-20"
                      title="Mover para cima"
                    >▲</button>
                    <button 
                      @click="moveBlockDown(idx)" 
                      :disabled="idx === blocks.length - 1"
                      class="text-[10px] text-slate-400 hover:text-white disabled:opacity-20"
                      title="Mover para baixo"
                    >▼</button>
                  </div>
                </div>

                <div class="flex-1 space-y-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <input 
                      v-model="blocks[idx].title"
                      type="text"
                      class="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 font-bold text-sm text-white focus:outline-none px-1 py-0.5 rounded transition-colors"
                      placeholder="Título da etapa..."
                    />

                    <!-- BADGES DE STATUS -->
                    <span 
                      v-if="blocks[idx].isFlexible" 
                      class="text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full"
                    >
                      Flexível
                    </span>
                    <span 
                      v-else 
                      class="text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full"
                    >
                      Rígido
                    </span>
                  </div>

                  <div class="flex items-center gap-3 text-xs text-slate-400">
                    <div class="flex items-center gap-1">
                      <span>👤</span>
                      <input 
                        v-model="blocks[idx].responsible"
                        type="text"
                        class="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-xs text-slate-300 focus:outline-none px-1 py-0.5 rounded"
                        placeholder="Responsável..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- DIREITA: DURAÇÃO, HORÁRIOS PREVISTOS E ACOES -->
              <div class="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                
                <!-- HORÁRIOS CALCULADOS AUTOMATICAMENTE -->
                <div class="text-right font-mono bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
                  <span class="text-xs font-bold text-indigo-300 block">
                    {{ block.plannedStart }} → {{ block.plannedEnd }}
                  </span>
                  <span class="text-[10px] text-slate-400 block">Horário Previsto</span>
                </div>

                <!-- CAMPO EDITÁVEL DE DURAÇÃO -->
                <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <input 
                    v-model.number="blocks[idx].durationMinutes"
                    type="number"
                    min="1"
                    max="180"
                    class="w-12 bg-transparent text-xs font-bold text-amber-400 text-right focus:outline-none font-mono"
                  />
                  <span class="text-[10px] text-slate-400">min</span>
                </div>

                <!-- AÇÕES DO BLOCO -->
                <div class="flex items-center gap-1">
                  <button 
                    @click="duplicateBlock(idx)"
                    class="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors text-xs"
                    title="Duplicar Bloco"
                  >
                    📑
                  </button>
                  <button 
                    @click="removeBlock(idx)"
                    class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors text-xs"
                    title="Excluir Bloco"
                  >
                    🗑️
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>

        <!-- FOOTER COM AÇÕES DA LISTA -->
        <div class="mt-4 pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center text-xs text-slate-400 gap-2">
          <span>Total: <strong class="text-white font-mono">{{ computedBlocks.length }} blocos</strong> ({{ formattedTotalDuration }})</span>
          
          <button 
            @click="saveSchedule" 
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            Finalizar & Enviar para o Monitor ao Vivo
          </button>
        </div>

      </main>

    </div>
  </div>
</template>

<style scoped>
/* Scrollbar personalizado suave para a lista de blocos */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
}
::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.8);
  border-radius: 8px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.8);
}
</style>
