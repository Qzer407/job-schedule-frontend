<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { getCurrentUser, updatePassword, type UpdatePasswordRequest } from '@/api'

const currentUser = ref<any>(null)
const loading = ref(false)

const passwordDialogVisible = ref(false)
const passwordForm = ref<UpdatePasswordRequest & { newPasswordConfirm: string }>({
  userId: 0,
  oldPassword: '',
  newPassword: '',
  newPasswordConfirm: ''
})

const fetchUser = async () => {
  loading.value = true
  try {
    const res = await getCurrentUser()
    currentUser.value = res.data.data
    passwordForm.value.userId = res.data.data.id
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleChangePassword = () => {
  passwordForm.value = {
    userId: currentUser.value?.id || 0,
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  }
  passwordDialogVisible.value = true
}

const validatePasswordForm = () => {
  if (!passwordForm.value.oldPassword) {
    ElMessage.error('请输入原密码')
    return false
  }
  if (!passwordForm.value.newPassword) {
    ElMessage.error('请输入新密码')
    return false
  }
  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.error('新密码长度不能少于6位')
    return false
  }
  if (passwordForm.value.newPassword !== passwordForm.value.newPasswordConfirm) {
    ElMessage.error('两次输入的密码不一致')
    return false
  }
  return true
}

const handleSubmitPassword = async () => {
  if (!validatePasswordForm()) return
  
  try {
    const { newPasswordConfirm, ...data } = passwordForm.value
    await updatePassword(data)
    ElMessage.success('密码修改成功，请重新登录')
    passwordDialogVisible.value = false
    // 可以在这里处理退出登录逻辑
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="profile">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>
      
      <div class="profile-content">
        <div class="avatar-section">
          <el-avatar :size="100">
            <el-icon><User /></el-icon>
          </el-avatar>
        </div>
        
        <el-descriptions :column="2" border style="margin-top: 30px;">
          <el-descriptions-item label="用户名">
            {{ currentUser?.username }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ currentUser?.email || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag>{{ currentUser?.role }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser?.status === 1 ? 'success' : 'danger'">
              {{ currentUser?.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ currentUser?.createTime }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="actions">
          <el-button type="primary" @click="handleChangePassword">
            <el-icon><Lock /></el-icon>
            修改密码
          </el-button>
        </div>
      </div>
    </el-card>

    <el-dialog title="修改密码" v-model="passwordDialogVisible" width="500px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="原密码" required>
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" required>
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" show-password />
        </el-form-item>
        <el-form-item label="确认密码" required>
          <el-input v-model="passwordForm.newPasswordConfirm" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.profile {
  padding: 20px;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-content {
  padding: 20px;
}

.avatar-section {
  display: flex;
  justify-content: center;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
