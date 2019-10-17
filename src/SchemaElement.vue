<template>
  <section>
    <template v-if="isCombination">
      <template v-for="combo in combinationKeys">
         <CollapsibleElement v-bind:key="combo"
           v-if="computedElement[combo] != null && computedElement[combo].length > 0" 
            :initiallyCollapsed="initiallyCollapsed">
           <template v-slot:title>
             <span >{{ combo }}:</span>
           </template>

           <template v-slot:content>
             <SchemaElement v-for="(schema,index) in computedElement[combo]" v-bind:key="index"
               :element="schema"/>
           </template>
        </CollapsibleElement>
      </template>
    </template>

    <ArrayElement v-else-if="isArrayType"
      :element="computedElement"
      :initiallyCollapsed="initiallyCollapsed"
      :name="name"
      :required="required"
    />

    <ObjectElement v-else-if="isObjectType"
      :element="computedElement"
      :initiallyCollapsed="initiallyCollapsed"
      :name="name"
      :required="required"
    />

    <OtherElement v-else-if="isOtherType || !hasType || isMultipleType"
      :element="computedElement"
      :initiallyCollapsed="initiallyCollapsed"
      :name="name"
      :required="required"
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
    required: {
      type: Boolean,
      default: false
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
  data() {
    return {
      combinationKeys: [
        'anyOf',
        'allOf',
        'oneOf',
        'not'
      ],
    }
  },
  computed: {
    computedElement() {
      if (this.element.$ref) {
        var regex = /\/([^/]*)/g
        var keyPath = []
        var path = this.element.$ref.indexOf('#') > -1 ?this.element.$ref.substring(this.element.$ref.indexOf('#') + 1) : ''
        var match = regex.exec(path)
        while (match) {
          keyPath.push(match[1])
          match = regex.exec(path)
        }
        // use path in $ref string to try to find def
        var def = keyPath.length > 0 ? this.$schema : (keyPath.length > 0 ? {} : null)
        for (var i = 0; i < keyPath.length; i++) {
          def = def[keyPath[i]] || null
          if (!def) break
        }
        // others look in the mappings of id to shcema to try to find it
        if (!def) {
          def = this.$schemaIdMap[this.element.$ref]
        }
        // otherwise return element with title with unknown def
        if (!def) def = {type: 'Unknown definition schema'}

        return def
      }
      return this.element
    },
    isCombination() {
      var hasCombo = false
      this.combinationKeys.forEach((key) => {
        if (this.computedElement[key] != null && this.computedElement[key].length > 0) hasCombo = true
      })
      return hasCombo && !this.computedElement.type
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
    display: flex;
  }

  .vueml-json-details {
    display: flex;
    flex-direction: column;
    margin-left: 2em;
  }
  .vueml-json-conditional {
    display: flex;
  }
  .vueml-json-element {
    display: flex;
  }
  .vueml-json-other {
    display: flex;
  }

  .vueml-json-collapsed:after {
    content: '\25B8';
  }
  .vueml-json-open:after {
    content: '\25BE';
  }
  .hidden {
    opacity: 0;
  }

  .vueml-json-description,
  .vueml-json-default,
  .vueml-json-examples {
    font-size: 0.85rem;
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

  .vueml-json-type {
    color: green;
  }
  .vueml-json-required {
    color: red;
  }
  .vueml-json-prop-name {
    color: blue;
  }
  
  .vueml-json-schema span {
    padding-right: 0.5em;
  }

  .vueml-json-schema code {
    background: gainsboro;
    border: 0.1em solid grey;
    padding: 0.1em 0.25em;
    border-radius: 2px;
  }

</style>