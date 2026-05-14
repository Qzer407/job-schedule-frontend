
&lt;template&gt;
  &lt;div class="cluster-view"&gt;
    &lt;el-card&gt;
      &lt;template #header&gt;
        &lt;div class="card-header"&gt;
          &lt;span&gt;集群管理&lt;/span&gt;
          &lt;el-button type="primary" @click="showRegisterDialog"&gt;注册节点&lt;/el-button&gt;
        &lt;/div&gt;
      &lt;/template&gt;

      &lt;el-tabs v-model="activeTab"&gt;
        &lt;el-tab-pane label="节点管理" name="nodes"&gt;
          &lt;el-row :gutter="20" style="margin-bottom: 20px"&gt;
            &lt;el-col :span="6"&gt;
              &lt;el-statistic title="总节点数" :value="clusterStatus.totalNodes"&gt;&lt;/el-statistic&gt;
            &lt;/el-col&gt;
            &lt;el-col :span="6"&gt;
              &lt;el-statistic title="在线节点" :value="clusterStatus.onlineNodes"&gt;
                &lt;template #suffix&gt;
                  &lt;el-tag type="success" size="small"&gt;在线&lt;/el-tag&gt;
                &lt;/template&gt;
              &lt;/el-statistic&gt;
            &lt;/el-col&gt;
            &lt;el-col :span="6"&gt;
              &lt;el-statistic title="故障节点" :value="clusterStatus.failedNodes"&gt;
                &lt;template #suffix&gt;
                  &lt;el-tag type="danger" size="small"&gt;故障&lt;/el-tag&gt;
                &lt;/template&gt;
              &lt;/el-statistic&gt;
            &lt;/el-col&gt;
            &lt;el-col :span="6"&gt;
              &lt;el-button type="primary" @click="loadData"&gt;
                &lt;el-icon&gt;&lt;Refresh /&gt;&lt;/el-icon&gt;刷新
              &lt;/el-button&gt;
            &lt;/el-col&gt;
          &lt;/el-row&gt;

          &lt;el-table :data="nodes" border stripe&gt;
            &lt;el-table-column prop="nodeId" label="节点ID" width="180" /&gt;
            &lt;el-table-column prop="nodeName" label="节点名称" width="150" /&gt;
            &lt;el-table-column prop="nodeIp" label="IP地址" width="120" /&gt;
            &lt;el-table-column prop="nodePort" label="端口" width="80" /&gt;
            &lt;el-table-column prop="role" label="角色" width="100"&gt;
              &lt;template #default="{ row }"&gt;
                &lt;el-tag :type="row.role === 'master' ? 'danger' : 'primary'" size="small"&gt;{{ row.role }}&lt;/el-tag&gt;
              &lt;/template&gt;
            &lt;/el-table-column&gt;
            &lt;el-table-column prop="status" label="状态" width="100"&gt;
              &lt;template #default="{ row }"&gt;
                &lt;el-tag :type="getStatusType(row.status)" size="small"&gt;
                  {{ getStatusText(row.status) }}
                &lt;/el-tag&gt;
              &lt;/template&gt;
            &lt;/el-table-column&gt;
            &lt;el-table-column prop="lastHeartbeat" label="最后心跳" width="180" /&gt;
            &lt;el-table-column label="操作" width="200" fixed="right"&gt;
              &lt;template #default="{ row }"&gt;
                &lt;el-button type="primary" size="small" @click="heartbeat(row.nodeId)"&gt;心跳&lt;/el-button&gt;
                &lt;el-button type="danger" size="small" @click="removeNode(row.nodeId)"&gt;移除&lt;/el-button&gt;
              &lt;/template&gt;
            &lt;/el-table-column&gt;
          &lt;/el-table&gt;
        &lt;/el-tab-pane&gt;

        &lt;el-tab-pane label="任务分片" name="shards"&gt;
          &lt;div style="margin-bottom: 20px"&gt;
            &lt;el-button type="primary" @click="rebalanceShards"&gt;
              &lt;el-icon&gt;&lt;Refresh /&gt;&lt;/el-icon&gt;负载均衡
            &lt;/el-button&gt;
            &lt;el-button @click="loadData"&gt;刷新&lt;/el-button&gt;
          &lt;/div&gt;

          &lt;el-table :data="shards" border stripe&gt;
            &lt;el-table-column prop="taskId" label="任务ID" width="100" /&gt;
            &lt;el-table-column prop="shardKey" label="分片键" width="150" /&gt;
            &lt;el-table-column prop="assignedNodeId" label="分配节点" width="180" /&gt;
            &lt;el-table-column prop="shardStatus" label="状态" width="100"&gt;
              &lt;template #default="{ row }"&gt;
                &lt;el-tag :type="getShardStatusType(row.shardStatus)" size="small"&gt;
                  {{ getShardStatusText(row.shardStatus) }}
                &lt;/el-tag&gt;
              &lt;/template&gt;
            &lt;/el-table-column&gt;
            &lt;el-table-column label="操作" width="150" fixed="right"&gt;
              &lt;template #default="{ row }"&gt;
                &lt;el-button type="primary" size="small" @click="showMigrateDialog(row)"&gt;迁移&lt;/el-button&gt;
              &lt;/template&gt;
            &lt;/el-table-column&gt;
          &lt;/el-table&gt;
        &lt;/el-tab-pane&gt;

        &lt;el-tab-pane label="集群事件" name="events"&gt;
          &lt;el-table :data="events" border stripe max-height="500"&gt;
            &lt;el-table-column prop="eventType" label="事件类型" width="150"&gt;
              &lt;template #default="{ row }"&gt;
                &lt;el-tag :type="getEventTypeTagType(row.eventType)" size="small"&gt;{{ row.eventType }}&lt;/el-tag&gt;
              &lt;/template&gt;
            &lt;/el-table-column&gt;
            &lt;el-table-column prop="eventData" label="事件数据" show-overflow-tooltip /&gt;
            &lt;el-table-column prop="sourceNode" label="源节点" width="150" /&gt;
            &lt;el-table-column prop="targetNode" label="目标节点" width="150" /&gt;
            &lt;el-table-column prop="eventTime" label="时间" width="180" /&gt;
          &lt;/el-table&gt;
        &lt;/el-tab-pane&gt;

        &lt;el-tab-pane label="故障记录" name="failures"&gt;
          &lt;el-table :data="failures" border stripe&gt;
            &lt;el-table-column prop="nodeId" label="节点ID" width="150" /&gt;
            &lt;el-table-column prop="failureType" label="故障类型" width="150"&gt;
              &lt;template #default="{ row }"&gt;
                &lt;el-tag type="danger" size="small"&gt;{{ row.failureType }}&lt;/el-tag&gt;
              &lt;/template&gt;
            &lt;/el-table-column&gt;
            &lt;el-table-column prop="failureDetail" label="故障详情" show-overflow-tooltip /&gt;
            &lt;el-table-column prop="recoveryStatus" label="恢复状态" width="100"&gt;
              &lt;template #default="{ row }"&gt;
                &lt;el-tag :type="row.recoveryStatus === 1 ? 'success' : 'warning'" size="small"&gt;
                  {{ row.recoveryStatus === 1 ? '已恢复' : '未恢复' }}
                &lt;/el-tag&gt;
              &lt;/template&gt;
            &lt;/el-table-column&gt;
            &lt;el-table-column prop="failureTime" label="故障时间" width="180" /&gt;
            &lt;el-table-column prop="recoveryTime" label="恢复时间" width="180" /&gt;
            &lt;el-table-column label="操作" width="120" fixed="right"&gt;
              &lt;template #default="{ row }"&gt;
                &lt;el-button type="primary" size="small" @click="recoverFailure(row.id)" v-if="row.recoveryStatus !== 1"&gt;
                &lt;el-icon&gt;&lt;RefreshLeft /&gt;&lt;/el-icon&gt;恢复
              &lt;/el-button&gt;
              &lt;/template&gt;
            &lt;/el-table-column&gt;
          &lt;/el-table&gt;
        &lt;/el-tab-pane&gt;
      &lt;/el-tabs&gt;
    &lt;/el-card&gt;

    &lt;el-dialog v-model="registerDialogVisible" title="注册节点" width="500px"&gt;
      &lt;el-form :model="registerForm" label-width="100px"&gt;
        &lt;el-form-item label="节点名称"&gt;
          &lt;el-input v-model="registerForm.nodeName" /&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item label="IP地址"&gt;
          &lt;el-input v-model="registerForm.nodeIp" /&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item label="端口"&gt;
          &lt;el-input-number v-model="registerForm.nodePort" :min="1" :max="65535" /&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item label="角色"&gt;
          &lt;el-select v-model="registerForm.role"&gt;
            &lt;el-option label="master" value="master" /&gt;
            &lt;el-option label="worker" value="worker" /&gt;
          &lt;/el-select&gt;
        &lt;/el-form-item&gt;
      &lt;/el-form&gt;
      &lt;template #footer&gt;
        &lt;el-button @click="registerDialogVisible = false"&gt;取消&lt;/el-button&gt;
        &lt;el-button type="primary" @click="registerNode"&gt;注册&lt;/el-button&gt;
      &lt;/template&gt;
    &lt;/el-dialog&gt;

    &lt;el-dialog v-model="migrateDialogVisible" title="迁移任务" width="500px"&gt;
      &lt;el-form :model="migrateForm" label-width="120px"&gt;
        &lt;el-form-item label="任务ID"&gt;
          &lt;el-input :value="migrateForm.taskId" disabled /&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item label="目标节点"&gt;
          &lt;el-select v-model="migrateForm.targetNodeId" placeholder="请选择目标节点"&gt;
            &lt;el-option
              v-for="node in onlineNodes"
              :key="node.nodeId"
              :label="node.nodeName"
              :value="node.nodeId" /&gt;
          &lt;/el-select&gt;
        &lt;/el-form-item&gt;
      &lt;/el-form&gt;
      &lt;template #footer&gt;
        &lt;el-button @click="migrateDialogVisible = false"&gt;取消&lt;/el-button&gt;
        &lt;el-button type="primary" @click="migrateTask"&gt;迁移&lt;/el-button&gt;
      &lt;/template&gt;
    &lt;/el-dialog&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, RefreshLeft } from '@element-plus/icons-vue'
import {
  getClusterNodes,
  getTaskShards,
  getClusterEvents,
  getFailureRecords,
  getClusterStatus,
  registerClusterNode,
  sendNodeHeartbeat,
  removeClusterNode,
  rebalanceTaskShards,
  migrateTaskToNode,
  recoverFailure,
  type ClusterNode,
  type TaskShard,
  type ClusterEvent,
  type FailureRecord,
  type NodeRegisterRequest,
  type TaskMigrateRequest
} from '@/api'

const activeTab = ref('nodes')
const nodes = ref&lt;ClusterNode[]&gt;([])
const shards = ref&lt;TaskShard[]&gt;([])
const events = ref&lt;ClusterEvent[]&gt;([])
const failures = ref&lt;FailureRecord[]&gt;([])
const clusterStatus = ref({ totalNodes: 0, onlineNodes: 0, failedNodes: 0 })

const registerDialogVisible = ref(false)
const registerForm = ref&lt;NodeRegisterRequest&gt;({
  nodeName: '',
  nodeIp: '',
  nodePort: 8080,
  role: 'worker'
})

const migrateDialogVisible = ref(false)
const migrateForm = ref&lt;TaskMigrateRequest &amp; { taskId: number }&gt;({
  taskId: 0,
  targetNodeId: ''
})

const onlineNodes = computed(() =&gt; {
  return nodes.value.filter(n =&gt; n.status === 1)
})

const getStatusType = (status: number) =&gt; {
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'info'
}

const getStatusText = (status: number) =&gt; {
  if (status === 1) return '在线'
  if (status === 2) return '故障'
  return '离线'
}

const getShardStatusType = (status: number) =&gt; {
  if (status === 1) return 'success'
  if (status === 2) return 'warning'
  return 'info'
}

const getShardStatusText = (status: number) =&gt; {
  if (status === 1) return '已分配'
  if (status === 2) return '迁移中'
  return '待分配'
}

const getEventTypeTagType = (eventType: string) =&gt; {
  if (eventType.includes('failover')) return 'danger'
  if (eventType.includes('node')) return 'primary'
  return 'info'
}

const loadData = async () =&gt; {
  try {
    const [nodesRes, shardsRes, eventsRes, failuresRes, statusRes] = await Promise.all([
      getClusterNodes(),
      getTaskShards(),
      getClusterEvents(),
      getFailureRecords(),
      getClusterStatus()
    ])

    nodes.value = nodesRes.data.data || []
    shards.value = shardsRes.data.data || []
    events.value = eventsRes.data.data || []
    failures.value = failuresRes.data.data || []

    try {
      const statusData = JSON.parse(statusRes.data.data || '{}')
      clusterStatus.value = {
        totalNodes: 0, onlineNodes: 0, failedNodes: 0, ...statusData }
    } catch {
      clusterStatus.value = {
        totalNodes: nodes.value.length,
        onlineNodes: nodes.value.filter(n =&gt; n.status === 1).length,
        failedNodes: nodes.value.filter(n =&gt; n.status === 2).length
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

const showRegisterDialog = () =&gt; {
  registerForm.value = {
    nodeName: '',
    nodeIp: '',
    nodePort: 8080,
    role: 'worker'
  }
  registerDialogVisible.value = true
}

const registerNode = async () =&gt; {
  try {
    await registerClusterNode(registerForm.value)
    ElMessage.success('节点注册成功')
    registerDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('节点注册失败:', error)
  }
}

const heartbeat = async (nodeId: string) =&gt; {
  try {
    await sendNodeHeartbeat(nodeId)
    ElMessage.success('心跳发送成功')
    loadData()
  } catch (error) {
    console.error('心跳发送失败:', error)
  }
}

const removeNode = async (nodeId: string) =&gt; {
  try {
    await ElMessageBox.confirm('确定要移除该节点吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await removeClusterNode(nodeId)
    ElMessage.success('节点移除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('节点移除失败:', error)
    }
  }
}

const rebalanceShards = async () =&gt; {
  try {
    await ElMessageBox.confirm('确定要进行负载均衡吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await rebalanceTaskShards()
    ElMessage.success('负载均衡完成')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('负载均衡失败:', error)
    }
  }
}

const showMigrateDialog = (shard: TaskShard) =&gt; {
  migrateForm.value = {
    taskId: shard.taskId,
    targetNodeId: ''
  }
  migrateDialogVisible.value = true
}

const migrateTask = async () =&gt; {
  try {
    await migrateTaskToNode(migrateForm.value.taskId, {
      targetNodeId: migrateForm.value.targetNodeId
    })
    ElMessage.success('任务迁移成功')
    migrateDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('任务迁移失败:', error)
  }
}

const recoverFailure = async (id: number) =&gt; {
  try {
    await ElMessageBox.confirm('确定要恢复该故障吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await recoverFailure(id)
    ElMessage.success('故障恢复成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('故障恢复失败:', error)
    }
  }
}

onMounted(() =&gt; {
  loadData()
})
&lt;/script&gt;

&lt;style scoped&gt;
.cluster-view {
  padding: 20px
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
&lt;/style&gt;
