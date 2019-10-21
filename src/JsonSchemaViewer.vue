<template>
  <SchemaElement 
    class="jschema-vuer-schema"
    :element="schemaObj"
    :initiallyCollapsed="false"
  />
</template>

<script>
import Vue from 'vue'
import SchemaElement from './SchemaElement.vue'
export default {
  name: "JsonSchemaViewer",
  props: {
    schema: {
      type: String,
      required: true,
      validator (value) {
        try {
          JSON.parse(value)
          return true
        } catch (error) {
          return false
        }
      }
    }
  },
  components: {
    SchemaElement,
  },
  data() {
    return {
      schemaObj: JSON.parse(this.schema)
    }
  },
  watch: {
    schema() {
      Vue.prototype.$schema = this.schemaObj
      this.mapSchemaIds(this.schemaObj)
    },
  },
  methods: {
    mapSchemaIds(obj) {
      for (var prop in obj) {
        if (prop == 'id' || prop == '$id') {
          Vue.prototype.$schemaIdMap[obj[prop]] = obj
        }
        if(obj[prop] instanceof Object || obj[prop] instanceof Array) {
          this.mapSchemaIds(obj[prop]);
        } 
      }
    }
  },
  created() {
    Vue.prototype.$schema = this.schemaObj
    Vue.prototype.$schemaIdMap = {}
    this.mapSchemaIds(this.schemaObj)
  }
}
</script>