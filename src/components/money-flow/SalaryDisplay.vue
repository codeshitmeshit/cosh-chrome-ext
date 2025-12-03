<template>
  <div class="salary-display">
    <div class="current-earning-container">
      <div class="earning-header">
        <h2 class="mb-2">当前已赚取</h2>
        <button
          @click="toggleAmountVisibility"
          class="visibility-toggle"
          :title="isAmountVisible ? '隐藏金额' : '显示金额'"
          type="button"
        >
          {{ isAmountVisible ? '👁️' : '🚫' }}
        </button>
      </div>
      <div class="earning-value" :data-amount-visible="isAmountVisible">
        ¥{{ displayEarnings }}
      </div>
    </div>

    <el-tag :type="workStatusTagType" size="large" class="work-status-tag">
      {{ workStatusText }}
    </el-tag>

    <div class="progress-container mb-4">
      <el-progress
        :percentage="progressPercentage"
        :stroke-width="20"
        :show-text="false"
        :status="progressStatus"
      />
      <div class="progress-text">{{ progressPercentage }}%</div>
    </div>

    <el-row :gutter="8">
      <el-col :span="12" :xs="12">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="stat-header">已工作时长</div>
          </template>
          <div class="stat-value">{{ formatTime(totalWorkedTime) }}</div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="12">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="stat-header">下班倒计时</div>
          </template>
          <div class="stat-value">{{ formatTime(timeUntilEnd) }}</div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="12">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="stat-header">
              每秒收入<button
                @click="togglePerSecondRateVisibility"
                class="visibility-toggle-small"
                :title="isPerSecondRateVisible ? '隐藏金额' : '显示金额'"
                type="button"
              >
                {{ isPerSecondRateVisible ? '👁️' : '🚫' }}
              </button>
            </div>
          </template>
          <div class="stat-value">¥{{ displayPerSecondRate }}/秒</div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="12">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="stat-header">
              预计总收入<button
                @click="toggleTotalExpectedVisibility"
                class="visibility-toggle-small"
                :title="isTotalExpectedVisible ? '隐藏金额' : '显示金额'"
                type="button"
              >
                {{ isTotalExpectedVisible ? '👁️' : '🚫' }}
              </button>
            </div>
          </template>
          <div class="stat-value">¥{{ displayTotalExpectedEarnings }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="8">
      <el-col :span="12">
        <el-button
          type="primary"
          @click="startNow"
          class="w-100"
          size="large"
          :disabled="!canStartNow"
        >
          现在上班
        </el-button>
      </el-col>
      <el-col :span="12">
        <el-button
          type="danger"
          @click="resetSettings"
          class="w-100"
          size="large"
        >
          重新设置
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { Decimal } from 'decimal.js'
import { TimerManager } from '~/utils/money-flow/timer'

export default {
  name: 'SalaryDisplay',
  emits: ['reset-settings', 'start-now'],

  props: {
    currentEarnings: {
      type: Number,
      default: 0
    },
    elapsedTime: {
      type: Number,
      default: 0
    },
    workStatus: {
      type: String,
      default: 'working'
    },
    progressPercentage: {
      type: Number,
      default: 0
    },
    initialWorkedSeconds: {
      type: Number,
      default: 0
    },
    perSecondRate: {
      type: Number,
      default: 0
    },
    totalExpectedEarnings: {
      type: Number,
      default: 0
    },
    timeUntilEnd: {
      type: Number,
      default: 0
    },
    // 是否允许点击“现在上班”按钮
    canStartNow: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { emit }) {
    const STORAGE_KEY_AMOUNT = 'moneyFlowAmountVisible'
    const STORAGE_KEY_TOTAL_EXPECTED = 'moneyFlowTotalExpectedVisible'
    const STORAGE_KEY_PER_SECOND_RATE = 'moneyFlowPerSecondRateVisible'

    // 同步读取 localStorage，确保初始值正确 - 当前已赚取
    let initialAmountVisibility = true
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AMOUNT)
      if (saved !== null) {
        initialAmountVisibility = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载金额显示状态失败:', error)
    }

    // 同步读取 localStorage，确保初始值正确 - 预计总收入
    let initialTotalExpectedVisibility = true
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOTAL_EXPECTED)
      if (saved !== null) {
        initialTotalExpectedVisibility = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载预计总收入显示状态失败:', error)
    }

    // 同步读取 localStorage，确保初始值正确 - 每秒收入
    let initialPerSecondRateVisibility = true
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PER_SECOND_RATE)
      if (saved !== null) {
        initialPerSecondRateVisibility = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载每秒收入显示状态失败:', error)
    }

    const isAmountVisible = ref(initialAmountVisibility)
    const isTotalExpectedVisible = ref(initialTotalExpectedVisibility)
    const isPerSecondRateVisible = ref(initialPerSecondRateVisibility)

    const formattedEarnings = computed(() => {
      return new Decimal(props.currentEarnings).toFixed(2)
    })

    // 优化：当隐藏时直接返回占位符，避免响应式更新触发重新计算
    const displayEarnings = computed(() => {
      // 如果不可见，直接返回占位符，不依赖 formattedEarnings
      if (!isAmountVisible.value) {
        return '*.**'
      }
      // 可见时才计算并返回实际金额
      return formattedEarnings.value
    })

    const toggleAmountVisibility = () => {
      isAmountVisible.value = !isAmountVisible.value
      try {
        localStorage.setItem(
          STORAGE_KEY_AMOUNT,
          JSON.stringify(isAmountVisible.value)
        )
      } catch (error) {
        console.error('保存金额显示状态失败:', error)
      }
    }

    // 预计总收入显示逻辑
    const displayTotalExpectedEarnings = computed(() => {
      if (!isTotalExpectedVisible.value) {
        return '*.**'
      }
      return props.totalExpectedEarnings.toFixed(2)
    })

    const toggleTotalExpectedVisibility = () => {
      isTotalExpectedVisible.value = !isTotalExpectedVisible.value
      try {
        localStorage.setItem(
          STORAGE_KEY_TOTAL_EXPECTED,
          JSON.stringify(isTotalExpectedVisible.value)
        )
      } catch (error) {
        console.error('保存预计总收入显示状态失败:', error)
      }
    }

    // 每秒收入显示逻辑
    const displayPerSecondRate = computed(() => {
      if (!isPerSecondRateVisible.value) {
        return '*.**'
      }
      return props.perSecondRate.toFixed(4)
    })

    const togglePerSecondRateVisibility = () => {
      isPerSecondRateVisible.value = !isPerSecondRateVisible.value
      try {
        localStorage.setItem(
          STORAGE_KEY_PER_SECOND_RATE,
          JSON.stringify(isPerSecondRateVisible.value)
        )
      } catch (error) {
        console.error('保存每秒收入显示状态失败:', error)
      }
    }

    const workStatusText = computed(() => {
      switch (props.workStatus) {
        case 'before_work':
          return '还未上班'
        case 'working':
          return '正在工作中'
        case 'after_work':
          return '已经下班了'
        default:
          return ''
      }
    })

    const workStatusTagType = computed(() => {
      switch (props.workStatus) {
        case 'before_work':
          return 'warning'
        case 'working':
          return 'success'
        case 'after_work':
          return 'info'
        default:
          return 'info'
      }
    })

    const progressStatus = computed(() => {
      if (props.progressPercentage >= 100) return 'success'
      return ''
    })

    const totalWorkedTime = computed(() => {
      return new Decimal(props.initialWorkedSeconds)
        .plus(props.elapsedTime)
        .toNumber()
    })

    const resetSettings = () => {
      emit('reset-settings')
    }

    const startNow = () => {
      emit('start-now')
    }

    const formatTime = (seconds) => {
      return TimerManager.formatTime(seconds)
    }

    return {
      isAmountVisible,
      isTotalExpectedVisible,
      isPerSecondRateVisible,
      formattedEarnings,
      displayEarnings,
      displayTotalExpectedEarnings,
      displayPerSecondRate,
      workStatusText,
      workStatusTagType,
      progressStatus,
      totalWorkedTime,
      resetSettings,
      startNow,
      formatTime,
      toggleAmountVisibility,
      toggleTotalExpectedVisibility,
      togglePerSecondRateVisibility
    }
  }
}
</script>

<style scoped lang="scss">
.salary-display {
  padding: 15px 0;
}

.w-100 {
  width: 100%;
}

.mb-2 {
  margin-bottom: 8px;
}

.earning-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.earning-header h2 {
  margin: 0;
  flex: 1;
}

.visibility-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.8);
}

.visibility-toggle:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.visibility-toggle:active {
  transform: scale(0.95);
}

.mb-4 {
  margin-bottom: 10px;
}

.earning-value {
  font-size: 3.5rem;
  font-weight: bold;
  margin: 5px 0 20px;
  background: linear-gradient(45deg, #ffde59, #ff914d);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(255, 222, 89, 0.5);
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.work-status-tag {
  margin-bottom: 10px;
  padding: 8px 16px;
  font-weight: 600;
}

.progress-container {
  position: relative;
  margin: 12px 0;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  color: #fff;
}

.stat-card {
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .el-card__header {
    padding: 10px;
  }
}

.stat-header {
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 500;
  white-space: nowrap;
}

.visibility-toggle-small {
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  font-size: 14px;
  padding: 0;
  margin: 0;
  margin-left: 0;
  border-radius: 50%;
  display: inline-block;
  width: auto;
  height: auto;
  line-height: 1;
  color: rgba(255, 255, 255, 0.8);
  vertical-align: baseline;
}

.visibility-toggle-small:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.visibility-toggle-small:active {
  transform: scale(0.95);
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 600;
  padding: 10px;
}

@media (max-width: 768px) {
  .earning-value {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .salary-display {
    padding: 10px 0;
  }
}
</style>
