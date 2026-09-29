<script setup>
import { useRoute } from 'vue-router'
import logoIgreja from '@/assets/logo.png'

const route = useRoute()

const navItems = [
  {
    name: 'Planejador',
    path: '/planner',
    description: 'Montar e estruturar a liturgia do culto'
  },
  {
    name: 'Monitor ao Vivo',
    path: '/monitor',
    description: 'Acompanhar e gerenciar o cronômetro no culto'
  }
]
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-slate-100 flex flex-col font-sans">
    <!-- BARRA DE NAVEGAÇÃO PRINCIPAL (HEADER GLOBAL) -->
    <header class="bg-zinc-900/90 backdrop-blur border-b border-zinc-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- LOGO / NOME DO SISTEMA -->
          <div class="flex items-center gap-3">
            <img :src="logoIgreja" alt="Logo da Igreja" class="w-12 h-12 object-contain rounded-lg" />
          </div>

          <!-- LINKS DE NAVEGAÇÃO DA ÁREA DE TRABALHO -->
          <nav class="flex items-center gap-1 sm:gap-2">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
              :class="[
                route.path === item.path
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              ]"
            >
              <span class="text-base">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </router-link>
          </nav>

        </div>
      </div>
    </header>

    <!-- CONTEÚDO DAS TELAS (ROUTER VIEW) -->
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* Transição suave de troca de tela */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
