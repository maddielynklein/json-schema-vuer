<template>
  <section>
    <ArrayElement v-if="isArrayType"
      :element="computedElement"
      :initiallyCollapsed="initiallyCollapsed"
      :name="name"
    />
    <ObjectElement v-else-if="isObjectType"
      :element="computedElement"
      :initiallyCollapsed="initiallyCollapsed"
      :name="name"
    />
    <OtherElement v-else-if="isOtherType || !hasType || isMultipleType"
      :element="computedElement"
      :initiallyCollapsed="initiallyCollapsed"
      :name="name"
    />
  </section>
</template>

<script>
import CollapsibleElement from './CollapsibleElement'
import ObjectElement from './ObjectElement'
import ArrayElement from './ArrayElement'
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
    CollapsibleElement,
    ObjectElement,
    ArrayElement,
    OtherElement
  },
  computed: {
    computedElement() {
      if (!this.element.type) {
        //if (this.element.properties) this.element.type
      }
      return this.element
    },
    isCombination() {

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
      return this.computedElement.type == 'array' || this.computedElement.items != null
    },
    isObjectType() {
      return this.computedElement.type == 'object' || this.computedElement.properties != null
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