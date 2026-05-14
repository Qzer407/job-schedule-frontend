export interface Workflow {
  id: number
  workflowName: string
  workflowDesc?: string
  workflowConfig?: string
  status: number
  createTime?: string
  updateTime?: string
}

export interface WorkflowCreateRequest {
  workflowName: string
  workflowDesc?: string
  status?: number
}

export interface WorkflowExecution {
  id: number
  workflowId: number
  executionStatus: number
  triggerType?: string
  startTime?: string
  endTime?: string
  executionLog?: string
  createTime?: string
}

export interface TaskDependency {
  id: number
  workflowId: number
  taskId: number
  parentTaskId?: number
  dependencyType: string
  createTime?: string
}

export interface DependencyCreateRequest {
  taskId: number
  parentTaskId?: number
  dependencyType?: string
}
