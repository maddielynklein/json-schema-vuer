<template>
  <SchemaElement 
    class="jschema-vuer-schema"
    :element="schemaObj"
    :initiallyCollapsed="false"
    :schemaMap="schemaMap"
    :schema="schemaObj"
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
    SchemaElement
  },
  computed: {
    schemaObj() {
      return JSON.parse(this.schema)
    },
    schemaMap() {
      var map = {}
      this.mapSchemaIds(map, this.schemaObj)
      return map
    }
  },
  methods: {
    mapSchemaIds(map, obj) {
      for (var prop in obj) {
        if (prop == 'id' || prop == '$id') {
          map[obj[prop]] = obj
        }
        if(obj[prop] instanceof Object || obj[prop] instanceof Array) {
          this.mapSchemaIds(map, obj[prop]);
        } 
      }
    }
  }
}
</script>