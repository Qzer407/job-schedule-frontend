<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, ArrowDown, Document, List, Connection, Clock, View, ChartLine, Monitor } from '@element-plus/icons-vue'
import type { User as UserType } from '@/types'

const route = useRoute()
const router = useRouter()
const activeMenu = ref('/task')

const username = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr) as UserType
      return user.username
    } catch {
      return 'Admin'
    }
  }
  return 'Admin'
})

watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
}, { immediate: true })

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
}
</script>

<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>Distributed Task Scheduler</h1>
          <div class="header-actions">
            <el-menu mode="horizontal" :default-active="activeMenu" router>
              <el-sub-menu index="1">
                <template #title>
                  <el-icon><Document /></el-icon>
                  <span>Task</span>
                </template>
                <el-menu-item index="/task">Task List</el-menu-item>
                <el-menu-item index="/task/sub">Sub-Task</el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="2">
                <template #title>
                  <el-icon><List /></el-icon>
                  <span>Workflow</span>
                </template>
                <el-menu-item index="/workflow">Workflow List</el-menu-item>
                <el-menu-item index="/workflow/template">Template</el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="3">
                <template #title>
                  <el-icon><View /></el-icon>
                  <span>Monitor</span>
                </template>
                <el-menu-item index="/dashboard">Dashboard</el-menu-item>
                <el-menu-item index="/operation/schedule">Schedule Log</el-menu-item>
                <el-menu-item index="/operation/health">Health Check</el-menu-item>
                <el-menu-item index="/operation/report">Report</el-menu-item>
              </el-sub-menu>
              <el-menu-item index="/alarm">
                <el-icon><Connection /></el-icon>
                Alarm
              </el-menu-item>
              <el-sub-menu index="5">
                <template #title>
                  <el-icon><Clock /></el-icon>
                  <span>Message</span>
                </template>
                <el-menu-item index="/message">Message Queue</el-menu-item>
              </el-sub-menu>
              <el-menu-item index="/cluster">
                <el-icon><Monitor /></el-icon>
                Cluster
              </el-menu-item>
              <el-sub-menu index="6">
                <template #title>
                  <el-icon><ChartLine /></el-icon>
                  <span>Operation</span>
                </template>
                <el-menu-item index="/operation/executor">Executor Group</el-menu-item>
                <el-menu-item index="/operation/audit">Audit Log</el-menu-item>
              </el-sub-menu>
            </el-menu>
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                {{ username }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">Logout</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  height: 100vh;
}

.el-header {
  background-color: #545c64;
  color: #fff;
  line-height: 60px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content h1 {
  font-size: 20px;
  color: #fff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  cursor: pointer;
}

.el-main {
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}
</style>
