<template>
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="currentSize"
    :total="total"
    :page-sizes="pageSizes"
    :layout="layout"
    :background="background"
    :small="small"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      pageNum: 1,
      pageSize: 20,
      total: 0
    })
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  small: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentPage = computed({
  get: () => props.modelValue.pageNum,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, pageNum: val })
  }
})

const currentSize = computed({
  get: () => props.modelValue.pageSize,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, pageSize: val, pageNum: 1 })
  }
})

const total = computed(() => props.modelValue.total)

const handleSizeChange = (val: number) => {
  emit('change', { pageSize: val, pageNum: props.modelValue.pageNum })
}

const handleCurrentChange = (val: number) => {
  emit('change', { pageSize: props.modelValue.pageSize, pageNum: val })
}
</script>

<style scoped>
.el-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>
