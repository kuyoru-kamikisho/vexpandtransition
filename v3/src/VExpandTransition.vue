<script setup lang="ts">
import {camelize, type PropType} from 'vue'
import type {HTMLExpandElement} from "@/types";

const props = defineProps({
  direction: {type: String as PropType<'x' | 'y'>, default: 'y'},
  mode: {type: String as PropType<'out-in' | 'in-out'>, default: "out-in"}
});

const transitionClass = `expand-${props.direction}-transition`
const sizeProperty = props.direction === 'x' ? 'width' : 'height' as 'width' | 'height'
const offsetProperty = camelize(`offset-${sizeProperty}`) as 'offsetHeight' | 'offsetWidth'

function onBeforeEnter(el: HTMLExpandElement) {
  el._parent = el.parentNode as (Node & ParentNode & HTMLElement) | null
  el._initialStyle = {
    transition: el.style.transition,
    overflow: el.style.overflow,
    [sizeProperty]: el.style[sizeProperty],
  }
}

function onEnter(el: HTMLExpandElement) {
  const initialStyle = el._initialStyle!

  el.style.setProperty('transition', 'none', 'important')
  // Hide overflow to account for collapsed margins in the calculated height
  el.style.overflow = 'hidden'
  const offset = `${el[offsetProperty]}px`

  el.style[sizeProperty] = '0'

  void el.offsetHeight // force reflow

  el.style.transition = initialStyle.transition

  el.classList.add(transitionClass)
  requestAnimationFrame(() => {
    el.style[sizeProperty] = offset
  })
}

function onLeave(el: HTMLExpandElement) {
  el._initialStyle = {
    transition: '',
    overflow: el.style.overflow,
    [sizeProperty]: el.style[sizeProperty],
  }

  el.style.overflow = 'hidden'
  el.style[sizeProperty] = `${el[offsetProperty]}px`
  void el.offsetHeight // force reflow
  el.classList.add(transitionClass)
  requestAnimationFrame(() => (el.style[sizeProperty] = '0'))
}

function onAfterLeave(el: HTMLExpandElement) {
  resetStyles(el)
}

function resetStyles(el: HTMLExpandElement) {
  const size = el._initialStyle![sizeProperty]
  el.style.overflow = el._initialStyle!.overflow
  if (size != null) el.style[sizeProperty] = size
  el.classList.remove(transitionClass)
  delete el._initialStyle
}
</script>

<template>
  <transition :mode="mode"
              @before-enter="onBeforeEnter"
              @enter="onEnter"
              @afterEnter="resetStyles"
              @enter-cancelled="resetStyles"
              @leave="onLeave"
              @after-leave="onAfterLeave"
              @leave-cancelled="onAfterLeave">
    <slot></slot>
  </transition>
</template>

<style>
.expand-x-transition {
  transition: width 282ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.expand-y-transition {
  transition: height 282ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}
</style>