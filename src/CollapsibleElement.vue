<template>
  <div>
    <span class="vueml-json-collapsible-title" v-on:click="isCollapsed = !isCollapsed">
      <span :class="{'vueml-json-collapsed' : isCollapsed, 'vueml-json-open': !isCollapsed}" />
      <slot name="title"></slot>
      {{ topTag }}
    </span>
    <div v-show="!isCollapsed" class="vueml-json-details">
      <slot name="content"></slot>
    </div>
    <span v-if="bottomTag" :class="{'vueml-json-details' : !showTopTagWhenOpen}">{{ bottomTag }}</span>
  </div>
</template>

<script>
export default {
  name: 'CollapsibleElement',
  props: {
    type: {
      required: true,
    },
    showTopTagWhenOpen: {
      type: Boolean,
      default: true
    },
    initiallyCollapsed: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      isCollapsed: this.initiallyCollapsed,
    }
  },
  computed:{
    isObject() {
      return this.type == 'object'
    },
    isArray() {
      return this.type == 'array'
    },
    topTag() {
      if (this.isCollapsed && this.isObject) return '{}'
      else if (this.isObject && this.showTopTagWhenOpen) return '{'
      else if (this.isCollapsed && this.isArray) return '[]'
      else if (this.isArray && this.showTopTagWhenOpen) return '['
      return null
    },
    bottomTag() {
      if (!this.isCollapsed && this.isObject) return '}'
      else if (!this.isCollapsed && this.isArray) return ']'
      else return null
    },
  }
}
</script>