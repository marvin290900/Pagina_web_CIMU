<script setup>
import { PUBLICATION_STATES, stateLabel } from '../../../lib/publicationUi.js';
const props = defineProps({ state: String, actions: { type: Array, default: () => [] }, busy: Boolean });
const emit = defineEmits(['select']);
function actionFor(state) { return props.actions.find(action => action.target === state); }
function completed(index) {
  const current = PUBLICATION_STATES.findIndex(s => s.value === props.state);
  return current > index;
}
</script>
<template>
  <div class="state-track" aria-label="Proceso editorial">
    <ol class="state-steps">
      <li v-for="(step, index) in PUBLICATION_STATES" :key="step.value" :class="{ 'is-current': state === step.value, 'is-complete': completed(index) }">
        <button v-if="actionFor(step.value) && state !== step.value" type="button" class="state-step" :disabled="busy" :aria-label="actionFor(step.value).label" @click="emit('select', actionFor(step.value))">
          <span class="step-marker">{{ completed(index) ? '✓' : index + 1 }}</span>{{ step.short }}
        </button>
        <span v-else class="state-step" :aria-current="state === step.value ? 'step' : undefined"><span class="step-marker">{{ completed(index) ? '✓' : index + 1 }}</span>{{ step.short }}</span>
      </li>
    </ol>
    <span v-if="state === 'archivado'" class="state-badge" data-state="archivado">Archivada</span>
    <span v-else-if="!PUBLICATION_STATES.some(s => s.value === state)" class="state-badge">{{ stateLabel(state) }}</span>
  </div>
</template>
