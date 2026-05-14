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
import MessageQueueView from './views/message/MessageQueueView.vue'
import ExecutorGroupView from './views/operation/ExecutorGroupView.vue'
import AuditLogView from './views/operation/AuditLogView.vue'
import ScheduleLogView from './views/operation/ScheduleLogView.vue'
import HealthCheckView from './views/operation/HealthCheckView.vue'
import ReportView from './views/operation/ReportView.vue'
import SubTaskView from './views/task/SubTaskView.vue'
import WorkflowTemplateView from './views/workflow/WorkflowTemplateView.vue'
import ClusterView from './views/cluster/ClusterView.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/login', component: Login },
  { path: '/', redirect: '/task' },
  { path: '/task', component: TaskListView, meta: { requiresAuth: true } },
  { path: '/task/sub', component: SubTaskView, meta: { requiresAuth: true } },
  { path: '/workflow', component: WorkflowListView, meta: { requiresAuth: true } },
  { path: '/workflow/template', component: WorkflowTemplateView, meta: { requiresAuth: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/alarm', component: AlarmConfigView, meta: { requiresAuth: true } },
  { path: '/message', component: MessageQueueView, meta: { requiresAuth: true } },
  { path: '/cluster', component: ClusterView, meta: { requiresAuth: true } },
  { path: '/operation/executor', component: ExecutorGroupView, meta: { requiresAuth: true } },
  { path: '/operation/audit', component: AuditLogView, meta: { requiresAuth: true } },
  { path: '/operation/schedule', component: ScheduleLogView, meta: { requiresAuth: true } },
  { path: '/operation/health', component: HealthCheckView, meta: { requiresAuth: true } },
  { path: '/operation/report', component: ReportView, meta: { requiresAuth: true } }
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
