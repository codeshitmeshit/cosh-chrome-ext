<template>
  <div class="salary-display">
    <div class="current-earning-container">
      <h2 class="mb-2">当前已赚取</h2>
      <div class="earning-value">¥{{ formattedEarnings }}</div>
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
            <div class="stat-header">每秒收入</div>
          </template>
          <div class="stat-value">¥{{ perSecondRate.toFixed(4) }}/秒</div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="12">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="stat-header">预计总收入</div>
          </template>
          <div class="stat-value">¥{{ totalExpectedEarnings.toFixed(2) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-button
      type="danger"
      @click="stopTimer"
      class="w-100"
      size="large"
    >
      下班
    </el-button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { Decimal } from 'decimal.js'
import { TimerManager } from '~/utils/money-flow/timer'

export default {
  name: 'SalaryDisplay',
  emits: ['stop-timer'],

  props: {
    currentEarnings: {
      type: Number,
      default: 0,
    },
    elapsedTime: {
      type: Number,
      default: 0,
    },
    workStatus: {
      type: String,
      default: 'working',
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    initialWorkedSeconds: {
      type: Number,
      default: 0,
    },
    perSecondRate: {
      type: Number,
      default: 0,
    },
    totalExpectedEarnings: {
      type: Number,
      default: 0,
    },
    timeUntilEnd: {
      type: Number,
      default: 0,
    },
  },

  setup(props, { emit }) {
    const formattedEarnings = computed(() => {
      return new Decimal(props.currentEarnings).toFixed(2)
    })

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
      if (props.progressPercentage >= 100)
        return 'success'
      return ''
    })

    const totalWorkedTime = computed(() => {
      return new Decimal(props.initialWorkedSeconds).plus(props.elapsedTime).toNumber()
    })

    const stopTimer = () => {
      emit('stop-timer')
    }

    const formatTime = (seconds) => {
      return TimerManager.formatTime(seconds)
    }

    return {
      formattedEarnings,
      workStatusText,
      workStatusTagType,
      progressStatus,
      totalWorkedTime,
      stopTimer,
      formatTime,
    }
  },
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
