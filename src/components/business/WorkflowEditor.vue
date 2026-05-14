<template>
  <div class="workflow-editor">
    <div class="header">
      <h2>工作流编辑器</h2>
      <div class="actions">
        <el-button @click="handleSave" type="primary">保存工作流</el-button>
        <el-button @click="handleExecute" type="success">执行工作流</el-button>
        <el-button @click="handlePreview">预览</el-button>
      </div>
    </div>

    <div class="editor-container">
      <div class="left-panel">
        <div class="panel-title">任务节点</div>
        <div class="task-list">
          <div
            v-for="task in availableTasks"
            :key="task.id"
            class="task-node"
            draggable="true"
            @dragstart="handleDragStart($event, task)"
          >
            <div class="task-name">{{ task.taskName }}</div>
            <div class="task-desc">{{ task.taskGroup }}</div>
          </div>
        </div>
      </div>

      <div class="canvas" @drop="handleDrop" @dragover="handleDragOver">
        <svg ref="canvasSvg" class="dag-canvas">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#409eff" />
            </marker>
          </defs>

          <line
            v-for="edge in edges"
            :key="`edge-${edge.from}-${edge.to}`"
            :x1="edge.x1"
            :y1="edge.y1"
            :x2="edge.x2"
            :y2="edge.y2"
            stroke="#409eff"
            stroke-width="2"
            marker-end="url(#arrowhead)"
          />

          <g
            v-for="node in nodes"
            :key="node.id"
            @click="handleNodeClick(node)"
            @mousedown="handleNodeMouseDown($event, node)"
          >
            <rect
              :x="node.x"
              :y="node.y"
              width="150"
              height="60"
              rx="8"
              :fill="getTaskNodeColor(node)"
              stroke="#409eff"
              stroke-width="2"
              class="node-rect"
            />
            <text
              :x="node.x + 75"
              :y="node.y + 35"
              text-anchor="middle"
              fill="#fff"
              font-size="14"
            >
              {{ node.name }}
            </text>
          </g>
        </svg>
      </div>

      <div class="right-panel">
        <div class="panel-title">节点属性</div>
        <div class="property-panel" v-if="selectedNode">
          <el-form label-width="80px">
            <el-form-item label="任务ID">
              <el-input v-model="selectedNode.id" disabled />
            </el-form-item>
            <el-form-item label="任务名称">
              <el-input v-model="selectedNode.name" disabled />
            </el-form-item>
            <el-form-item label="依赖类型">
              <el-select v-model="selectedNode.dependencyType">
                <el-option label="成功后执行" value="SUCCESS" />
                <el-option label="失败后执行" value="FAILURE" />
                <el-option label="无条件执行" value="ALWAYS" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleRemoveNode" type="danger" size="small">
                删除节点
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-else class="empty-panel">
          请点击节点查看属性
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="创建/编辑工作流" width="500px">
      <el-form :model="workflowForm" label-width="100px">
        <el-form-item label="工作流名称" required>
          <el-input v-model="workflowForm.workflowName" placeholder="请输入工作流名称" />
        </el-form-item>
        <el-form-item label="工作流描述">
          <el-input
            v-model="workflowForm.workflowDesc"
            type="textarea"
            placeholder="请输入工作流描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDialogSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const canvasSvg = ref<HTMLElement | null>(null)
const selectedNode = ref<any>(null)
const dialogVisible = ref(false)
const draggingTask = ref<any>(null)

const nodes = ref<any[]>([])
const edges = ref<any[]>([])
const availableTasks = ref<any[]>([])

const workflowForm = reactive({
  id: null,
  workflowName: '',
  workflowDesc: '',
  status: 0
})

const getTaskNodeColor = (node: any) => {
  const colors: Record<string, string> = {
    success: '#67c23a',
    failure: '#f56c6c',
    running: '#409eff',
    default: '#909399'
  }
  return node.status ? colors[node.status] || colors.default : colors.default
}

const handleDragStart = (event: DragEvent, task: any) => {
  draggingTask.value = task
  event.dataTransfer?.setData('text', '')
  event.dataTransfer!.effectAllowed = 'copy'
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'copy'
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (!draggingTask.value || !canvasSvg.value) return

  const rect = canvasSvg.value.getBoundingClientRect()
  const x = event.clientX - rect.left - 75
  const y = event.clientY - rect.top - 30

  nodes.value.push({
    id: draggingTask.value.id,
    name: draggingTask.value.taskName,
    x: x,
    y: y,
    dependencyType: 'SUCCESS',
    status: null
  })

  ElMessage.success('节点已添加')
}

const handleNodeClick = (node: any) => {
  selectedNode.value = node
}

const handleNodeMouseDown = (event: MouseEvent, node: any) => {
  if (event.button !== 0) return

  let startX = event.clientX - node.x
  let startY = event.clientY - node.y

  const handleMouseMove = (e: MouseEvent) => {
    node.x = e.clientX - startX
    node.y = e.clientY - startY
    updateEdges()
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleRemoveNode = () => {
  if (!selectedNode.value) return
  const index = nodes.value.findIndex(n => n.id === selectedNode.value.id)
  if (index !== -1) {
    nodes.value.splice(index, 1)
    edges.value = edges.value.filter(
      edge => edge.from !== selectedNode.value.id && edge.to !== selectedNode.value.id
    )
    selectedNode.value = null
    ElMessage.success('节点已删除')
  }
}

const updateEdges = () => {
  edges.value.forEach(edge => {
    const fromNode = nodes.value.find(n => n.id === edge.from)
    const toNode = nodes.value.find(n => n.id === edge.to)
    if (fromNode && toNode) {
      edge.x1 = fromNode.x + 150
      edge.y1 = fromNode.y + 30
      edge.x2 = toNode.x
      edge.y2 = toNode.y + 30
    }
  })
}

const handleSave = () => {
  if (nodes.value.length === 0) {
    ElMessage.warning('请先添加任务节点')
    return
  }
  dialogVisible.value = true
}

const handleExecute = () => {
  ElMessage.success('工作流已触发执行')
}

const handlePreview = () => {
  ElMessage.info('预览功能开发中')
}

const handleDialogSave = () => {
  ElMessage.success('工作流已保存')
  dialogVisible.value = false
}

const fetchAvailableTasks = async () => {
  availableTasks.value = [
    { id: 1, taskName: '数据同步', taskGroup: 'ETL' },
    { id: 2, taskName: '数据清洗', taskGroup: 'ETL' },
    { id: 3, taskName: '报表生成', taskGroup: 'Report' },
    { id: 4, taskName: '邮件发送', taskGroup: 'Notification' }
  ]
}

onMounted(() => {
  fetchAvailableTasks()
})
</script>

<style scoped>
.workflow-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel,
.right-panel {
  width: 250px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.right-panel {
  border-right: none;
  border-left: 1px solid #e4e7ed;
}

.panel-title {
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.task-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.task-node {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  background: #f5f7fa;
}

.task-node:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.task-node:active {
  cursor: grabbing;
}

.task-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.task-desc {
  font-size: 12px;
  color: #909399;
}

.canvas {
  flex: 1;
  background: #f0f2f5;
  position: relative;
}

.dag-canvas {
  width: 100%;
  height: 100%;
}

.node-rect {
  cursor: move;
  transition: all 0.2s;
}

.node-rect:hover {
  filter: brightness(1.1);
}

.property-panel {
  padding: 16px;
}

.empty-panel {
  padding: 48px 16px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
