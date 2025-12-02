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
        @stop-timer="stopTimer"
      />
    </el-card>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { Decimal } from 'decimal.js'
import { TimerManager } from './utils/timer'
import { EffectsManager } from './utils/effects'
import SetupForm from './components/SetupForm.vue'
import SalaryDisplay from './components/SalaryDisplay.vue'

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

    const stopTimer = () => {
      TimerManager.stopTimer()
      isRunning.value = false
    }

    const handleTimerUpdate = (state) => {
      elapsedTime.value = state.elapsedTime
      currentEarnings.value = state.currentEarnings
      workStatus.value = state.workStatus
      timeUntilEnd.value = state.timeUntilEnd
    }

    onMounted(() => {
      EffectsManager.applyPageAnimations()
      document.documentElement.classList.add('dark')
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
      stopTimer
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
