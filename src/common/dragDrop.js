import { ref } from 'vue'

/**
 * Composable for drag-and-drop functionality on rule lists
 * @param {Ref<Array>} rulesRef - Reactive reference to the rules array
 * @param {Function} onDropCallback - Optional callback after successful drop
 * @returns {Object} Drag-and-drop state and handlers
 */
export function useDragDrop(rulesRef, onDropCallback = null) {
  let draggedIndex = null
  const dragOverIndex = ref(null)

  const handleDragStart = (event, index) => {
    draggedIndex = index
    event.target.style.opacity = '0.4'
  }

  const handleDragOver = (event, index) => {
    event.preventDefault()
    dragOverIndex.value = index
  }

  const handleDrop = (event, dropIndex) => {
    event.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return
    
    const draggedItem = rulesRef.value[draggedIndex]
    const newRules = [...rulesRef.value]
    
    // Remove from old position
    newRules.splice(draggedIndex, 1)
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newRules.splice(insertIndex, 0, draggedItem)
    
    rulesRef.value = newRules
    dragOverIndex.value = null
    
    // Call optional callback
    if (onDropCallback) {
      onDropCallback()
    }
  }

  const handleDragEnd = (event) => {
    event.target.style.opacity = '1'
    draggedIndex = null
    dragOverIndex.value = null
  }

  return {
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  }
}
