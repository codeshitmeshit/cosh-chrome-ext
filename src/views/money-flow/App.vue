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
        :can-start-now="canStartNow"
        @reset-settings="resetSettings"
        @start-now="startNow"
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
    const canStartNow = ref(true)

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

      // 计算当前是否允许“现在上班”
      const currentTimeDecimal = TimerManager.getCurrentTimeDecimal()
      canStartNow.value = currentTimeDecimal <= config.startTime

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
      canStartNow.value = true
    }

    const handleTimerUpdate = (state) => {
      elapsedTime.value = state.elapsedTime
      currentEarnings.value = state.currentEarnings
      workStatus.value = state.workStatus
      timeUntilEnd.value = state.timeUntilEnd
    }

    // 将时间向下取整到最接近的 0.5 小时（用于"现在上班"功能）
    const floorToNearestHalfHour = (timeDecimal) => {
      return Math.floor(timeDecimal * 2) / 2
    }

    // 现在上班：将上班时间调整为当前时间
    const startNow = () => {
      // 加载现有设置（先判断是否允许“现在上班”）
      const savedSettings = StorageUtils.loadSettings()
      if (!savedSettings) {
        // 如果没有保存的设置，无法使用此功能
        return
      }

      const currentTimeDecimal = TimerManager.getCurrentTimeDecimal()
      const { startTime: originalStartTime } = savedSettings

      // 如果当前系统时间已经大于原本设置的上班时间，则不允许“现在上班”
      if (currentTimeDecimal > originalStartTime) {
        return
      }

      // 停止当前定时器
      TimerManager.stopTimer()

      // 使用当前精确时间作为新的上班时间
      const newStartTime = currentTimeDecimal

      // 更新上班时间为当前精确时间
      const updatedSettings = {
        ...savedSettings,
        startTime: newStartTime
      }

      // 保存更新后的设置
      StorageUtils.saveSettings(updatedSettings)

      // 重新启动定时器
      const { salaryType, salaryAmount, endTime } = updatedSettings

      // 计算工作时长
      let calculatedWorkHours
      if (endTime >= newStartTime) {
        calculatedWorkHours = new Decimal(endTime)
          .minus(newStartTime)
          .toNumber()
      } else {
        calculatedWorkHours = new Decimal(24)
          .minus(newStartTime)
          .plus(endTime)
          .toNumber()
      }

      if (calculatedWorkHours <= 0) {
        return
      }

      // 计算时薪
      let hourlyRate = 0
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

      // 启动定时器
      const config = {
        salaryType,
        salaryAmount,
        startTime: newStartTime,
        endTime,
        hourlyRate,
        calculatedWorkHours,
        perSecondRate: perSecondRateValue
      }

      startTimer(config)

      // 强制重置初始状态为0，确保从当前时间开始计算
      // 因为 calculateWorkStatus 可能会因为时间精度问题计算出很小的已工作时长
      TimerManager.data.initialWorkProgress = 0
      TimerManager.data.initialWorkedSeconds = 0
      TimerManager.data.currentEarnings = 0
      TimerManager.data.elapsedTime = 0

      // 更新显示状态
      initialWorkedSeconds.value = 0
      currentEarnings.value = 0
      elapsedTime.value = 0
      initialWorkProgress.value = 0
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
      resetSettings,
      startNow,
      canStartNow
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
