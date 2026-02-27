<template>
  <Teleport to="body">
    <!-- Modal Overlay -->
    <div
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      :class="visible ? 'visible opacity-100' : 'invisible opacity-0'"
      style="
        z-index: 1050;
        transition: all 0.3s ease;
        background-color: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(4px);
      "
      @click.self="!noBackdropClose && $emit('close')"
    >
      <!-- Modal Card -->
      <div
        class="ui-card w-100 d-flex flex-column overflow-hidden rounded-xl shadow-lg"
        :style="{
          maxWidth: maxWidth,
          maxHeight: '85vh',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease'
        }"
      >
        <!-- Modal Header -->
        <div class="d-flex justify-content-between align-items-center p-4">
          <slot name="header">
            <h3 class="text-lg fw-semibold ui-text-primary m-0" :class="titleClass">
              {{ title }}
            </h3>
          </slot>
          <button @click="$emit('close')" class="modal-close-button">
            <i class="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 flex-1 overflow-y-auto custom-scrollbar" style="min-height: 0">
          <slot></slot>
        </div>

        <!-- Modal Footer -->
        <div class="d-flex justify-content-end gap-3 p-4">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '480px'
  },
  titleClass: {
    type: String,
    default: ''
  },
  noBackdropClose: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])
</script>
