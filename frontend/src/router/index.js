import { createRouter, createWebHistory } from 'vue-router'

// Importação das views do projeto
import ServicePlanner from '../views/ServicePlanner.vue'
import LiveMonitor from '../views/LiveMonitor.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  {
    path: '/',
    redirect: '/planner'
  },
  {
    path: '/planner',
    name: 'ServicePlanner',
    component: ServicePlanner,
    meta: { title: 'Planejador de Liturgia' }
  },
  {
    path: '/monitor',
    name: 'LiveMonitor',
    component: LiveMonitor,
    meta: { title: 'Monitor ao Vivo' }
  }
],
})

export default router
