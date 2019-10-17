<template>
  <section>
    <template v-if="isCombination">
      <template v-for="combo in combinationKeys">
        <section v-if="computedElement[combo] != null && computedElement[combo].length > 0" class="jschema-vuer-element">
          <span v-if="name" class="jschema-vuer-prop-name">{{ name }}: </span>
          <CollapsibleElement v-bind:key="combo"
            :initiallyCollapsed="initiallyCollapsed">
            <template v-slot:title>
              <span >{{ combo }}:</span>
            </template>

            <template v-slot:content>
              <SchemaElement v-for="(schema,index) in computedElement[combo]" v-bind:key="index"
               :element="schema"
               :initiallyCollapsed="false"/>
            </template>
          </CollapsibleElement>
        </section>
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
  .jschema-vuer-collapsible-title {
    cursor: pointer;
    display: flex;
  }

  .jschema-vuer-details {
    display: flex;
    flex-direction: column;
    margin-left: 2em;
  }
  .jschema-vuer-conditional {
    display: flex;
  }
  .jschema-vuer-element {
    display: flex;
  }
  .jschema-vuer-other {
    display: flex;
  }

  .jschema-vuer-collapsed:after {
    content: '\25B8';
  }
  .jschema-vuer-open:after {
    content: '\25BE';
  }
  .hidden {
    opacity: 0;
  }

  .jschema-vuer-description,
  .jschema-vuer-default,
  .jschema-vuer-examples {
    font-size: 0.85rem;
  }
  .jschema-vuer-description {
    color: grey;
  }
  .jschema-vuer-default {
    color: darkgrey;
  }
  .jschema-vuer-examples {
    color: cornflowerblue;
  }

  .jschema-vuer-type {
    color: green;
  }
  .jschema-vuer-required {
    color: red;
  }
  .jschema-vuer-prop-name {
    color: blue;
  }
  
  .jschema-vuer-schema span {
    padding-right: 0.5em;
  }

  .jschema-vuer-schema code {
    background: gainsboro;
    border: 0.1em solid grey;
    padding: 0.1em 0.25em;
    border-radius: 2px;
  }

</style>