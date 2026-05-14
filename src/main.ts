import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import Login from './views/auth/Login.vue'
import TaskListView from './views/task/TaskListView.vue'
import Dashboard from './views/monitor/Dashboard.vue'
import WorkflowListView from './views/workflow/WorkflowListView.vue'
import AlarmConfigView from './views/alarm/AlarmConfigView.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/login', component: Login },
  { path: '/', redirect: '/task' },
  { path: '/task', component: TaskListView, meta: { requiresAuth: true } },
  { path: '/workflow', component: WorkflowListView, meta: { requiresAuth: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/alarm', component: AlarmConfigView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/task')
  } else {
    next()
  }
})

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')
