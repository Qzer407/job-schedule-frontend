import { ref, reactive, computed } from 'vue'
import type { PageParams, PageResult } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/constants'

export interface UsePaginationOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T[], total: number) => void
  onError?: (error: Error) => void
}

export function usePagination<T>(
  fetchFn: (params: PageParams) => Promise<any>,
  options: UsePaginationOptions<T> = {}
) {
  const { immediate = false, onSuccess, onError } = options

  const data = ref<T[]>([]) as any
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const total = ref(0)

  const pagination = reactive({
    pageNum: 1,
    pageSize: DEFAULT_PAGE_SIZE
  })

  const params = computed(() => ({
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize
  }))

  const fetch = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetchFn(params.value)
      const result: PageResult<T> = response.data.data
      data.value = result.records || []
      total.value = result.total || 0
      onSuccess?.(data.value, total.value)
    } catch (e) {
      error.value = e as Error
      onError?.(error.value)
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    pagination.pageNum = 1
    fetch()
  }

  const setPage = (page: number) => {
    pagination.pageNum = page
    fetch()
  }

  const setSize = (size: number) => {
    pagination.pageSize = size
    pagination.pageNum = 1
    fetch()
  }

  if (immediate) {
    fetch()
  }

  return {
    data,
    loading,
    error,
    total,
    pagination,
    params,
    fetch,
    reset,
    setPage,
    setSize
  }
}
