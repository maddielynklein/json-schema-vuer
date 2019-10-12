<template>
  <section>
    <OtherElement v-if="this.isOther"
      :element="this.element"
      :initiallyCollapsed="initiallyCollapsed"
      />
  </section>
</template>

<script>
import CollapsibleElement from './CollapsibleElement'
import OtherElement from './OtherElement'
export default {
  name: "SchemaElement",
  props: {
    element: {
      type: Object,
      required: true,
      validator(value) {
        if (!value.type) return false
        // TODO additional validation? what else determines invalid element
        return true;
      }
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
    OtherElement
  },
  data() {
    return {
      isCollapsed: this.initiallyCollapsed,
      jsonSchemaKeyOptions: [
        "type",
        "required",
        "description",
        "title",
        // object
        "properties",
        //array
        "items",
        "additionalItems",
        "contains",
        //conditional
        "oneOf",
        "anyOf",
        "allOf",
        "not",
        "if",
        "then",
        "else",
      ],
      specialKeys: [
        'title',
        'name',
        'type',
        'description',
        'default',
        'examples'
      ],
    }
  },
  computed: {
    singleType() {
      return typeof this.element.type == 'string'
    },
    title() {
      let title = this.element.title ? this.element.title : this.element.name
      if (title) title += ': '
      if (!this.isObject && !this.isArray) {
         title = title + this.element.type.toString()
      }
      if (this.isObject && !this.hasNested) title += '{}'
      if (this.isArray && !this.hasNested) title += '[]'
      return title
    },
    keys() {
      let keys = Object.keys(this.element)
      return keys
    },
    showingDetails() {
      return this.hasNested && !this.isCollapsed
    },
    hasNested() {
      // show anything as nested except for type and name
      if (this.keys.length == 1) return false
      if (this.keys.length == 2 && this.keys.indexOf('name') != -1) return false
      return true
    },
    isArray() {
      return this.singleType && this.element.type == 'array'
    },
    isObject() {
      return this.singleType && this.element.type == 'object'
    },
    isOther() {
      return this.singleType && !this.isArray && !this.isObject
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