import gsap from 'gsap'
import confetti from 'canvas-confetti'

export const EffectsManager = {
  particlesInitialized: false,

  initParticles() {
    if (this.particlesInitialized) return

    const particlesContainer = document.getElementById('particles-container')
    if (!particlesContainer) return

    const particleCount = 50

    for (let i = 0; i < particleCount; i++) {
      this.createParticle(particlesContainer)
    }

    this.particlesInitialized = true
  },

  createParticle(container) {
    if (!container) return

    const particle = document.createElement('div')
    particle.classList.add('particle')

    const size = Math.random() * 5 + 1
    const posX = Math.random() * 100
    const posY = Math.random() * 100
    const opacity = Math.random() * 0.5 + 0.2
    const duration = Math.random() * 20 + 10
    const delay = Math.random() * 5

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background-color: rgba(255, 255, 255, ${opacity});
      border-radius: 50%;
      left: ${posX}%;
      top: ${posY}%;
      pointer-events: none;
      box-shadow: 0 0 ${size * 2}px rgba(255, 255, 255, 0.7);
    `

    gsap.to(particle, {
      x: 'random(-100, 100)',
      y: 'random(-100, 100)',
      opacity: 'random(0.1, 0.5)',
      scale: 'random(0.5, 1.5)',
      duration,
      delay,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    container.appendChild(particle)
  },

  celebrateWithConfetti(size = 'medium') {
    if (typeof confetti !== 'function') return

    const options = {
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFDF00', '#F0E68C', '#DAA520', '#FFA500']
    }

    switch (size) {
      case 'small':
        options.particleCount = 30
        options.spread = 50
        break
      case 'large':
        options.particleCount = 200
        options.spread = 90
        options.startVelocity = 45
        break
      case 'medium':
      default:
        options.particleCount = 100
        options.spread = 70
        break
    }

    confetti(options)
  },

  dropCoins(numberOfCoins = 20) {
    const coinsContainer = document.getElementById('coins-container')
    if (!coinsContainer) return

    for (let i = 0; i < numberOfCoins; i++) {
      setTimeout(() => {
        const coin = document.createElement('div')
        coin.classList.add('coin')

        const posX = Math.random() * 100

        coin.style.left = `${posX}%`
        coin.style.top = '-50px'

        coinsContainer.appendChild(coin)

        gsap.to(coin, {
          y: window.innerHeight + 100,
          rotation: Math.random() * 720 - 360,
          duration: Math.random() * 2 + 2,
          ease: 'power1.in',
          onComplete: () => {
            coin.remove()
          }
        })
      }, i * 100)
    }
  },

  animateNumberUpdate(element, value, duration = 0.2) {
    if (!element) return

    gsap.to(element, {
      value,
      duration,
      onUpdate: () => {
        const earningElement = document.querySelector('.earning-value')
        if (earningElement) {
          // 检查金额是否应该显示（通过 data-amount-visible 属性）
          const shouldShowAmount =
            earningElement.getAttribute('data-amount-visible') !== 'false'
          // 如果金额被隐藏，不更新 DOM，让 Vue 的响应式系统处理
          if (shouldShowAmount) {
            earningElement.textContent = `¥${element.value.toFixed(2)}`
          }
        }
      }
    })
  },

  applyPageAnimations() {
    const panel = document.querySelector('.glass-panel')
    if (!panel) return

    gsap.from(panel, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out'
    })
  },

  applyStartAnimations() {
    const earningElement = document.querySelector('.earning-value')
    const displayElement = document.querySelector('.salary-display')

    if (earningElement) {
      gsap.from(earningElement, {
        textContent: 0,
        duration: 1,
        ease: 'power1.out',
        snap: { textContent: 0.01 },
        onUpdate() {
          const target = this.targets()[0]
          if (target)
            target.innerHTML = `¥${parseFloat(
              target.textContent || '0'
            ).toFixed(2)}`
        }
      })
    }

    if (displayElement) {
      gsap.from(displayElement, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out'
      })
    }
  },

  applyStopAnimations() {
    const formElement = document.querySelector('.setup-form')
    if (!formElement) return

    gsap.from(formElement, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out'
    })
  }
}
