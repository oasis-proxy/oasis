<template>
  <div
    class="brand-section d-flex align-items-center px-3 transition-colors ui-bg-card"
    style="height: 6rem"
  >
    <!-- Ripple Animation Container -->
    <div class="ripple-container">
      <div class="ripple-ring ripple-1"></div>
      <div class="ripple-ring ripple-2"></div>
      <div class="ripple-ring ripple-3"></div>
      <div class="ripple-core"></div>
    </div>
    <!-- Brand Text -->
    <img
      src="../../assets/img/oasis-proxy-primary-96px.png"
      alt="Oasis Proxy"
      class="brand-text logo-primary"
    />
    <img
      src="../../assets/img/oasis-proxy-white-96px.png"
      alt="Oasis Proxy"
      class="brand-text logo-white"
    />
  </div>
</template>

<style scoped>
.brand-section {
  --ripple-color: var(--bs-primary);
  --ripple-op-1: 0.3;
  --ripple-op-2: 0.5;
  --ripple-op-3: 0.7;
  gap: 4px;
}

.ripple-container {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.ripple-ring {
  position: absolute;
  border-radius: 50%;
  box-sizing: border-box;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-style: solid;
  border-color: var(--ripple-color);
}

.ripple-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--ripple-color);
  box-shadow: 0 0 5px rgba(19, 127, 236, 0.8);
}

.brand-text {
  font-size: 24px;
  font-weight: 900;
  height: 36px;
  color: var(--ui-text-primary);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

@keyframes ripple-1 {
  0% {
    width: 64px;
    height: 64px;
    border-width: 2px;
    opacity: var(--ripple-op-1);
    filter: blur(2px);
  }
  100% {
    width: 80px;
    height: 80px;
    border-width: 0px;
    opacity: 0;
    filter: blur(2px);
  }
}

@keyframes ripple-2 {
  0% {
    width: 48px;
    height: 48px;
    border-width: 2px;
    opacity: var(--ripple-op-2);
    filter: blur(2px);
  }
  100% {
    width: 60px;
    height: 60px;
    border-width: 1px;
    opacity: 0;
    filter: blur(1px);
  }
}

@keyframes ripple-3 {
  0% {
    width: 32px;
    height: 32px;
    border-width: 2px;
    opacity: var(--ripple-op-3);
    filter: blur(1px);
  }
  100% {
    width: 36px;
    height: 36px;
    border-width: 2px;
    opacity: 0;
    filter: blur(1px);
  }
}

.ripple-1 {
  animation: ripple-1 2s infinite ease-out;
}
.ripple-2 {
  animation: ripple-2 2s infinite ease-out;
}
.ripple-3 {
  animation: ripple-3 2s infinite ease-out;
}

:root.dark .brand-section {
  --ripple-color: #ffffff;
  --ripple-op-1: 0.2;
  --ripple-op-2: 0.4;
  --ripple-op-3: 0.6;
}

:root.dark .ripple-core {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.logo-white {
  display: none;
}
:root.dark .logo-primary {
  display: none;
}
:root.dark .logo-white {
  display: block;
}
</style>
