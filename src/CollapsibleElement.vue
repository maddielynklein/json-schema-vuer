<template>
  <div>
    <span class="vueml-json-collapsible-title" v-on:click="isCollapsed = !isCollapsed">
      <span :class="{'vueml-json-collapsed' : isCollapsed, 'vueml-json-open': !isCollapsed}" />
      <slot name="title"></slot>
      {{ topTag }}
      <slot name="titleOpenEnd" v-if="!isCollapsed" />
    </span>
    <div v-show="!isCollapsed" class="vueml-json-details">
      <slot name="content"></slot>
    </div>
    <span v-if="bottomTag"><span class="vueml-json-collapsed hidden"></span>{{ bottomTag }}</span>
  </div>
</template>

<script>
export default {
  name: 'CollapsibleElement',
  props: {
    type: {
      type: String,
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
      else if (this.isObject) return '{'
      else if (this.isCollapsed && this.isArray) return '[]'
      else if (this.isArray) return '['
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