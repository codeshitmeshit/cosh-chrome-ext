<template>
  <div class="container">
    <el-card class="glass-panel">
      <h1 class="title animate__animated animate__fadeIn">
        🐎 牛马实时薪资计算器 💰
      </h1>

      <SetupForm v-if="!isRunning" @start-timer="startTimer" />

      <SalaryDisplay
        v-else
        :current-earnings="currentEarnings"
        :elapsed-time="elapsedTime"
        :work-status="workStatus"
        :progress-percentage="progressPercentage"
        :initial-worked-seconds="initialWorkedSeconds"
        :per-second-rate="perSecondRate"
        :total-expected-earnings="totalExpectedEarnings"
        :time-until-end="timeUntilEnd"
        @reset-settings="resetSettings"
      />
    </el-card>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { Decimal } from 'decimal.js'
import { TimerManager } from '~/utils/money-flow/timer'
import { EffectsManager } from '~/utils/money-flow/effects'
import { StorageUtils } from '~/utils/money-flow/storage'
import { AppConfig } from '~/config/money-flow'
import SetupForm from '~/components/money-flow/SetupForm.vue'
import SalaryDisplay from '~/components/money-flow/SalaryDisplay.vue'

export default {
  name: 'MoneyFlowApp',
  components: {
    SetupForm,
    SalaryDisplay
  },

  setup() {
    const isRunning = ref(false)
    const currentEarnings = ref(0)
    const elapsedTime = ref(0)
    const workStatus = ref('')
    const initialWorkProgress = ref(0)
    const initialWorkedSeconds = ref(0)
    const totalExpectedEarnings = ref(0)
    const timeUntilEnd = ref(0)
    const perSecondRate = ref(0)

    const progressPercentage = computed(() => {
      if (isRunning.value) {
        return TimerManager.getProgressPercentage(
          timerConfig.value?.calculatedWorkHours
        )
      }
      return 0
    })

    const timerConfig = ref(null)

    const startTimer = (config) => {
      timerConfig.value = config
      perSecondRate.value = config.perSecondRate

      const timerState = TimerManager.startTimer(config, {
        onUpdate: handleTimerUpdate
      })

      isRunning.value = timerState.isRunning
      workStatus.value = timerState.initialState.workStatus
      initialWorkProgress.value = timerState.initialState.initialWorkProgress
      currentEarnings.value = timerState.initialState.currentEarnings
      initialWorkedSeconds.value = timerState.initialState.initialWorkedSeconds
      totalExpectedEarnings.value =
        timerState.initialState.totalExpectedEarnings
      elapsedTime.value = timerState.initialState.elapsedTime || 0
    }

    const resetSettings = () => {
      TimerManager.stopTimer()
      // 清除保存的设置
      StorageUtils.saveSettings(null)
      // 重置状态
      isRunning.value = false
      timerConfig.value = null
      currentEarnings.value = 0
      elapsedTime.value = 0
      workStatus.value = ''
      initialWorkProgress.value = 0
      initialWorkedSeconds.value = 0
      totalExpectedEarnings.value = 0
      timeUntilEnd.value = 0
      perSecondRate.value = 0
    }

    const handleTimerUpdate = (state) => {
      elapsedTime.value = state.elapsedTime
      currentEarnings.value = state.currentEarnings
      workStatus.value = state.workStatus
      timeUntilEnd.value = state.timeUntilEnd
    }

    // 根据保存的设置自动启动计时器
    const autoStartFromSettings = () => {
      const savedSettings = StorageUtils.loadSettings()
      if (!savedSettings) {
        return
      }

      // 检查设置是否完整
      const { salaryType, salaryAmount, startTime, endTime } = savedSettings
      if (
        !salaryType ||
        !salaryAmount ||
        salaryAmount <= 0 ||
        startTime === undefined ||
        endTime === undefined
      ) {
        return
      }

      // 计算工作时长
      let calculatedWorkHours
      if (endTime >= startTime) {
        calculatedWorkHours = new Decimal(endTime).minus(startTime).toNumber()
      } else {
        calculatedWorkHours = new Decimal(24)
          .minus(startTime)
          .plus(endTime)
          .toNumber()
      }

      if (calculatedWorkHours <= 0) {
        return
      }

      // 计算时薪
      let hourlyRate = 0
      const salaryTypeConfig = AppConfig.salaryTypes[salaryType]
      if (salaryType === 'monthly') {
        hourlyRate = new Decimal(salaryAmount)
          .dividedBy(21.75)
          .dividedBy(calculatedWorkHours)
          .toNumber()
      } else if (salaryType === 'daily') {
        hourlyRate = new Decimal(salaryAmount)
          .dividedBy(calculatedWorkHours)
          .toNumber()
      } else {
        hourlyRate = parseFloat(salaryAmount)
      }

      if (hourlyRate <= 0) {
        return
      }

      // 计算每秒收入
      const perSecondRateValue = new Decimal(hourlyRate)
        .dividedBy(3600)
        .toNumber()

      // 启动计时器
      const config = {
        salaryType,
        salaryAmount,
        startTime,
        endTime,
        hourlyRate,
        calculatedWorkHours,
        perSecondRate: perSecondRateValue
      }

      startTimer(config)
    }

    onMounted(() => {
      EffectsManager.applyPageAnimations()
      document.documentElement.classList.add('dark')
      // 尝试自动启动
      autoStartFromSettings()
    })

    return {
      isRunning,
      currentEarnings,
      elapsedTime,
      workStatus,
      initialWorkedSeconds,
      perSecondRate,
      totalExpectedEarnings,
      timeUntilEnd,
      progressPercentage,
      startTimer,
      resetSettings
    }
  }
}
</script>

<style lang="scss">
@import '~/assets/money-flow/styles/main.scss';

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.glass-panel {
  background: rgba(31, 31, 58, 0.7) !important;
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
}

.title {
  font-size: 1.6rem;
  margin-bottom: 22px;
  background: linear-gradient(45deg, #fff, #a0cfff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(160, 207, 255, 0.5);
}

@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }

  .glass-panel {
    padding: 20px 15px;
  }

  .title {
    font-size: 1.4rem;
    margin-bottom: 20px;
  }
}
</style>
