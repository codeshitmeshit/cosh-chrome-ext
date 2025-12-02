import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { EffectsManager } from './effects'

export const TimerManager = {
  data: {
    isRunning: false,
    timerStartTime: null,
    currentTime: null,
    elapsedTime: 0,
    timerInterval: null,
    systemTime: dayjs(),
    currentEarnings: 0,
    totalExpectedEarnings: 0,
    lastCoinMilestone: 0,
    countUp: { value: 0 },
    workStatus: '',
    initialWorkProgress: 0,
    initialWorkedSeconds: 0,
  },

  getCurrentTimeDecimal() {
    const now = dayjs()
    const hour = now.hour()
    const minute = now.minute()
    return new Decimal(hour).plus(new Decimal(minute).dividedBy(60)).toNumber()
  },

  calculateWorkStatus(config) {
    const currentTimeDecimal = this.getCurrentTimeDecimal()
    const { startTime, endTime, hourlyRate, calculatedWorkHours } = config

    const isWorkDayCrossing = endTime < startTime
    const currentTimeAdjusted = currentTimeDecimal

    let calculatedWorkHoursValue
    if (isWorkDayCrossing) {
      calculatedWorkHoursValue = new Decimal(24).minus(startTime).plus(endTime).toNumber()
    } else {
      calculatedWorkHoursValue = new Decimal(endTime).minus(startTime).toNumber()
    }

    if (isWorkDayCrossing) {
      if (currentTimeAdjusted >= startTime || currentTimeAdjusted < endTime) {
        this.data.workStatus = 'working'

        let workedHours
        if (currentTimeAdjusted >= startTime) {
          workedHours = new Decimal(currentTimeAdjusted).minus(startTime).toNumber()
        } else {
          workedHours = new Decimal(24).minus(startTime).plus(currentTimeAdjusted).toNumber()
        }

        this.data.initialWorkProgress = new Decimal(workedHours).dividedBy(calculatedWorkHoursValue).times(100).toNumber()
        this.data.currentEarnings = new Decimal(hourlyRate).times(workedHours).toNumber()
        this.data.initialWorkedSeconds = new Decimal(workedHours).times(3600).floor().toNumber()
      } else {
        if (currentTimeAdjusted < startTime && currentTimeAdjusted >= endTime) {
          this.data.workStatus = 'before_work'
          this.data.initialWorkProgress = 0
          this.data.initialWorkedSeconds = 0
          this.data.currentEarnings = 0
        } else {
          this.data.workStatus = 'after_work'
          this.data.initialWorkProgress = 100
          this.data.currentEarnings = new Decimal(hourlyRate).times(calculatedWorkHoursValue).toNumber()
          this.data.initialWorkedSeconds = new Decimal(calculatedWorkHoursValue).times(3600).floor().toNumber()
        }
      }
    } else {
      if (currentTimeAdjusted >= startTime && currentTimeAdjusted < endTime) {
        this.data.workStatus = 'working'

        const workedHours = new Decimal(currentTimeAdjusted).minus(startTime).toNumber()

        this.data.initialWorkProgress = new Decimal(workedHours).dividedBy(calculatedWorkHoursValue).times(100).toNumber()
        this.data.currentEarnings = new Decimal(hourlyRate).times(workedHours).toNumber()
        this.data.initialWorkedSeconds = new Decimal(workedHours).times(3600).floor().toNumber()
      } else if (currentTimeAdjusted < startTime) {
        this.data.workStatus = 'before_work'
        this.data.initialWorkProgress = 0
        this.data.initialWorkedSeconds = 0
        this.data.currentEarnings = 0
      } else {
        this.data.workStatus = 'after_work'
        this.data.initialWorkProgress = 100
        this.data.currentEarnings = new Decimal(hourlyRate).times(calculatedWorkHoursValue).toNumber()
        this.data.initialWorkedSeconds = new Decimal(calculatedWorkHoursValue).times(3600).floor().toNumber()
      }
    }

    this.data.lastCoinMilestone = Math.floor(this.data.currentEarnings)
    this.data.countUp.value = this.data.currentEarnings
    this.data.totalExpectedEarnings = new Decimal(hourlyRate).times(calculatedWorkHoursValue).toNumber()

    return {
      workStatus: this.data.workStatus,
      initialWorkProgress: this.data.initialWorkProgress,
      initialWorkedSeconds: this.data.initialWorkedSeconds,
      currentEarnings: this.data.currentEarnings,
      lastCoinMilestone: this.data.lastCoinMilestone,
      totalExpectedEarnings: this.data.totalExpectedEarnings,
    }
  },

  startTimer(config, callbacks = {}) {
    const { hourlyRate, calculatedWorkHours } = config

    this.data.timerStartTime = dayjs().valueOf()
    this.data.currentTime = this.data.timerStartTime
    this.data.elapsedTime = 0
    this.data.isRunning = true

    this.calculateWorkStatus(config)

    this.data.timerInterval = setInterval(() => {
      this.updateTimer(config, callbacks)
    }, 200)

    EffectsManager.initParticles()
    EffectsManager.applyStartAnimations()

    return {
      isRunning: this.data.isRunning,
      initialState: {
        workStatus: this.data.workStatus,
        initialWorkProgress: this.data.initialWorkProgress,
        initialWorkedSeconds: this.data.initialWorkedSeconds,
        currentEarnings: this.data.currentEarnings,
        totalExpectedEarnings: this.data.totalExpectedEarnings,
        elapsedTime: this.data.elapsedTime,
      },
    }
  },

  stopTimer() {
    clearInterval(this.data.timerInterval)
    this.data.isRunning = false
    EffectsManager.applyStopAnimations()
  },

  updateTimer(config, callbacks = {}) {
    const { perSecondRate, onUpdate } = config

    const now = dayjs().valueOf()
    this.data.systemTime = dayjs()
    const deltaSeconds = new Decimal(now).minus(this.data.currentTime).dividedBy(1000).toNumber()
    this.data.currentTime = now

    if (this.data.workStatus === 'working') {
      this.data.elapsedTime = new Decimal(this.data.elapsedTime).plus(deltaSeconds).toNumber()
    }

    if (this.data.workStatus === 'working') {
      const incrementalEarnings = new Decimal(perSecondRate).times(deltaSeconds).toNumber()
      this.data.currentEarnings = new Decimal(this.data.currentEarnings).plus(incrementalEarnings).toNumber()
    }

    const currentWholeYuan = Math.floor(this.data.currentEarnings)
    if (currentWholeYuan > this.data.lastCoinMilestone) {
      this.data.lastCoinMilestone = currentWholeYuan

      if (currentWholeYuan % 100 === 0) {
        EffectsManager.celebrateWithConfetti('large')
        EffectsManager.dropCoins(50)
      } else if (currentWholeYuan % 10 === 0) {
        EffectsManager.celebrateWithConfetti('medium')
        EffectsManager.dropCoins(30)
      } else {
        EffectsManager.celebrateWithConfetti('small')
        EffectsManager.dropCoins(20)
      }
    }

    EffectsManager.animateNumberUpdate(this.data.countUp, this.data.currentEarnings)

    if (this.data.workStatus === 'after_work') {
      const progressBar = document.querySelector('.progress-bar')
      const progressText = document.querySelector('.progress-text')

      if (progressBar) {
        progressBar.style.width = '100%'
      }

      if (progressText) {
        progressText.textContent = '100%'
      }
    }

    if (onUpdate && typeof onUpdate === 'function') {
      onUpdate({
        elapsedTime: this.data.elapsedTime,
        currentEarnings: this.data.currentEarnings,
        systemTime: this.data.systemTime,
        workStatus: this.data.workStatus,
        initialWorkedSeconds: this.data.initialWorkedSeconds,
        totalExpectedEarnings: this.data.totalExpectedEarnings,
        timeUntilEnd: this.getTimeUntilEnd(config),
      })
    }
  },

  getTimeUntilEnd(config) {
    const { endTime } = config

    if (this.data.workStatus === 'after_work') {
      return 0
    }

    const now = dayjs()
    const currentHour = now.hour()
    const currentMinute = now.minute()
    const currentSecond = now.second()

    const currentTimeInSeconds = new Decimal(currentHour)
      .times(3600)
      .plus(new Decimal(currentMinute).times(60))
      .plus(currentSecond)

    const endHour = Math.floor(endTime)
    const endMinute = Math.round((endTime - endHour) * 60)
    const endTimeInSeconds = new Decimal(endHour).times(3600).plus(new Decimal(endMinute).times(60))

    if (endTime < config.startTime) {
      if (currentTimeInSeconds.lessThan(endTimeInSeconds)) {
        return endTimeInSeconds.minus(currentTimeInSeconds).toNumber()
      } else {
        return new Decimal(24 * 3600).minus(currentTimeInSeconds).plus(endTimeInSeconds).toNumber()
      }
    } else if (currentTimeInSeconds.lessThan(endTimeInSeconds)) {
      return endTimeInSeconds.minus(currentTimeInSeconds).toNumber()
    } else {
      return 0
    }
  },

  formatTime(seconds) {
    const intSeconds = Math.floor(seconds)
    const hours = Math.floor(intSeconds / 3600)
    const minutes = Math.floor((intSeconds % 3600) / 60)
    const remainingSeconds = intSeconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  },

  getTimerState() {
    return {
      isRunning: this.data.isRunning,
      elapsedTime: this.data.elapsedTime,
      currentEarnings: this.data.currentEarnings,
      workStatus: this.data.workStatus,
      initialWorkProgress: this.data.initialWorkProgress,
      initialWorkedSeconds: this.data.initialWorkedSeconds,
      totalExpectedEarnings: this.data.totalExpectedEarnings,
      progressPercentage: this.getProgressPercentage(),
      systemTime: this.data.systemTime,
    }
  },

  getProgressPercentage(calculatedWorkHours) {
    if (!calculatedWorkHours || calculatedWorkHours <= 0) return 0

    const totalSeconds = new Decimal(calculatedWorkHours).times(3600)
    const percentage = new Decimal(this.data.elapsedTime).dividedBy(totalSeconds).times(100)

    const totalPercentage = new Decimal(this.data.initialWorkProgress).plus(percentage)

    return Math.min(100, Math.max(0, totalPercentage.toFixed(1)))
  },
}
