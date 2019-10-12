<template>
  <SchemaElement 
    :element="schemaObj"
    :isParent="true"
    :initiallyCollapsed="false"
    :definitions="null"
  />
</template>

<script>
import SchemaElement from './SchemaElement'
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
  computed: {

  }
}
</script>