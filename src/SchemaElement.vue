<template>
  <section>
    <ObjectElement v-if="isObjectType"
      :element="computedElement"
      :initiallyCollapsed="initiallyCollapsed"
      :name="name"
    />
    <OtherElement v-if="isOtherType || !hasType"
      :element="computedElement"
      :initiallyCollapsed="initiallyCollapsed"
      :name="name"
    />
  </section>
</template>

<script>
import ObjectElement from './ObjectElement'
import OtherElement from './OtherElement'

export default {
  name: "SchemaElement",
  props: {
    element: {
      type: Object,
      required: true,
    },
    name:{
      type: String
    },
    // if schema were defined in top level definitions pass to any nested element in case it uses the def
    definitions: {
      type: Object,
    },
    initiallyCollapsed: {
      type: Boolean,
      default: true
    },
    isParent: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ObjectElement,
    OtherElement
  },
  computed: {
    computedElement() {
      if (Array.isArray(this.element)) {
        return this.element
      }
      else if (typeof this.element == 'object') {
        // todo add in definitions here?
        return this.element
      }
      return this.element
    },
    hasType() {
      return this.computedElement.type != null
    },
    isSingleType() {
      return typeof this.computedElement.type == 'string'
    },
    isMultipleType() {
      return typeof Array.isArray(this.computedElement.type)
    },
    isArrayType() {
      return this.isSingleType && this.computedElement.type == 'array'
    },
    isObjectType() {
      return this.isSingleType && this.computedElement.type == 'object'
    },
    isOtherType() {
      return this.isSingleType && !this.isArrayType && !this.isObjectType
    }
  }
}
</script>

<style type="text/css">
  .vueml-json-collapsible-title {
    cursor: pointer;
  }

  .vueml-json-details {
    display: flex;
    flex-direction: column;
    margin-left: 1em;
  }

  .vueml-json-collapsed:after {
    content: '\25B8';
    padding: 0.25em;
  }
  .vueml-json-open:after {
    content: '\25BE';
    padding: 0.25em;
  }

  .vueml-json-description,
  .vueml-json-default,
  .vueml-json-examples {
    font-size: 0.8em;
  }
  .vueml-json-description {
    color: grey;
  }
  .vueml-json-default {
    color: darkgrey;
  }
  .vueml-json-examples {
    color: cornflowerblue;
  }

</style>