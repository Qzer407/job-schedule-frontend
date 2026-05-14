<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, ArrowDown } from '@element-plus/icons-vue'
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
              <el-menu-item index="/task">Task Management</el-menu-item>
              <el-menu-item index="/workflow">Workflow</el-menu-item>
              <el-menu-item index="/dashboard">Monitor</el-menu-item>
              <el-menu-item index="/alarm">Alarm Config</el-menu-item>
              <el-menu-item index="/message">Message Queue</el-menu-item>
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
