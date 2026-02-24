<template>
  <div class="d-grid gap-3" style="grid-template-columns: 1fr 1fr">
    <!-- Ignore Option -->
    <label
      class="position-relative d-flex cursor-pointer rounded-lg p-3 shadow-sm transition-colors ui-selectable-card"
      :class="{ active: modelValue === 'ignore' }"
    >
      <input
        :value="'ignore'"
        :checked="modelValue === 'ignore'"
        @change="emit('update:modelValue', 'ignore')"
        v-show="false"
        class="visually-hidden"
        type="radio"
      />
      <span class="d-flex flex-fill">
        <span class="d-flex flex-column">
          <span
            class="d-block text-xs fw-medium mb-1"
            :class="modelValue === 'ignore' ? 'text-primary' : 'ui-text-primary'"
            >{{ $t('armOptIgnore') }}</span
          >
          <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">{{
            $t('armDescIgnore')
          }}</span>
        </span>
      </span>
      <i
        class="bi bi-check-circle-fill fs-5 position-absolute top-50 end-0 translate-middle-y me-3"
        v-if="modelValue === 'ignore'"
      ></i>
    </label>

    <!-- Overwrite Option -->
    <label
      class="position-relative d-flex cursor-pointer rounded-lg p-3 shadow-sm transition-colors ui-selectable-card"
      :class="{ active: modelValue === 'overwrite' }"
    >
      <input
        :value="'overwrite'"
        :checked="modelValue === 'overwrite'"
        @change="emit('update:modelValue', 'overwrite')"
        v-show="false"
        class="visually-hidden"
        type="radio"
      />
      <span class="d-flex flex-fill">
        <span class="d-flex flex-column">
          <span
            class="d-block text-xs fw-medium mb-1"
            :class="modelValue === 'overwrite' ? 'text-primary' : 'ui-text-primary'"
            >{{ $t('armOptOverwrite') }}</span
          >
          <span class="mt-1 d-flex align-items-center text-xs ui-text-secondary">{{
            $t('armDescOverwrite')
          }}</span>
        </span>
      </span>
      <i
        class="bi bi-check-circle-fill fs-5 position-absolute top-50 end-0 translate-middle-y me-3"
        v-if="modelValue === 'overwrite'"
      ></i>
    </label>
  </div>
</template>

<script setup>
defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])
</script>
