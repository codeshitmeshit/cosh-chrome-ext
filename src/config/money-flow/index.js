export const AppConfig = {
  defaults: {
    salaryType: 'monthly',
    salaryAmount: 10000,
    startTime: 9,
    endTime: 18,
  },

  salaryTypes: {
    hourly: { label: '时薪 (元/小时)' },
    daily: { label: '日薪 (元/天)' },
    monthly: { label: '月薪 (元/月)' },
  },

  timeOptions: Array.from({ length: 24 * 2 }, (_, index) => {
    const time = index * 0.5
    const hour = Math.floor(time)
    const minute = time % 1 === 0 ? '00' : '30'
    return {
      label: `${hour.toString().padStart(2, '0')}:${minute}`,
      value: time,
    }
  }),
}
