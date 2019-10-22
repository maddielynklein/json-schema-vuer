<script>
import CollapsibleElement from './CollapsibleElement.vue'
import CombinationElement from './CombinationElement.vue'
import ObjectElement from './ObjectElement.vue'
import ArrayElement from './ArrayElement.vue'
import OtherElement from './OtherElement.vue'

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
    nameType:{
      type: String,
      defualt: 'property'
    },
    type: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    },
    initiallyCollapsed: {
      type: Boolean,
      default: true
    },
    showNonNestedBrackets: {
      type: Boolean,
      default: true
    },
    schema: {
      type: Object,
      required:true
    },
    schemaMap: {
      type: Object,
      required:true
    }
  },
  components: {
    CollapsibleElement,
    CombinationElement,
    ObjectElement,
    ArrayElement,
    OtherElement
  },
  render(createElement) {
    var config = {
      props: {
        element: this.computedElement,
        name: this.name,
        nameType: this.nameType,
        required: this.required,
        initiallyCollapsed: this.initiallyCollapsed,
        showNonNestedBrackets: this.showNonNestedBrackets,
        schema: this.schema,
        schemaMap: this.schemaMap
      }
    }
    var comp = null;
    if (this.isCombination) comp = CombinationElement
    else if (this.isObjectType) comp = ObjectElement
    else if (this.isArrayType) comp = ArrayElement
    else comp = OtherElement

    return createElement(comp, config)
  },
  data() {
    return {
      combinationKeys: [
        'anyOf',
        'allOf',
        'oneOf',
        'not'
      ],
      objectKeys: [
        'properties',
        'additionalProperties',
        'minProperties',
        'maxProperties',
        'dependencies',
        'required',
        'propertyNames',
        'patternProperties'
      ],
      arrayKeys: [
        'items',
        'additionalItems',
        'minItems',
        'maxItems',
        'uniqueItems',
        'contains'
      ],
      stringKeys: [
        'minLength',
        'maxLength',
        'pattern',
        'format',
        'contentMediaType',
        'contentMediaEncoding'
      ],
      numericKeys: [
        'minimum',
        'maximum',
        'exclusiveMinimum',
        'exclusiveMaximum',
        'format'
      ],
    }
  },
  computed: {
    computedElement() {
      return this.getComputedElement(this.element)
    },
    isCombination() {
      return this.getIsCombination(this.computedElement) && !this.getType(this.computedElement) && !this.type
    },
    isSingleType() {
      return typeof this.computedElement.type == 'string' || 
        (this.computedElement.type == null && this.type != null)
    },
    isArrayType() {
      return this.type == 'object' || this.getType(this.computedElement) == 'array'
    },
    isObjectType() {
      return this.type == 'object' || this.getType(this.computedElement) == 'object'
    },
    isOtherType() {
      var types = ['string', 'integer', 'number', 'numeric', 'null', 'boolean']
      return types.includes(this.type) || types.includes(this.getType(this.computedElement))
    }
  },
  methods: {
    getType(element) {
      if (element.type) return element.type
      if (this.hasObjectKeys(element)) return 'object'
      if (this.hasArrayKeys(element)) return 'array'
      if (this.hasStringKeys(element)) return 'string'
      if (this.hasNumericKeys(element)) return 'numeric'
      return null
    },
    hasObjectKeys(element) {
      return Object.keys(element).filter(k => element[k] != null && this.objectKeys.includes(k)).length > 0
    },
    hasArrayKeys(element) {
      return Object.keys(element).filter(k => element[k] != null && this.arrayKeys.includes(k)).length > 0
    },
    hasStringKeys(element) {
      return Object.keys(element).filter(k => element[k] != null && this.stringKeys.includes(k)).length > 0
    },
    hasNumericKeys(element) {
      return Object.keys(element).filter(k => element[k] != null && this.numericKeys.includes(k)).length > 0
    },
    getKeysForType(type) {
      if (type == 'object') return this.objectKeys
      if (type == 'array') return this.arrayKeys
      if (type == 'string') return this.stringKeys
      if (type == 'integer') return this.numericKeys
      if (type == 'number') return this.numericKeys
      return []
    },
    getIsCombination(element) {
      var hasCombo = false
      this.combinationKeys.forEach((key) => {
        // if all of the all of options are the same type they can be combined into one schema element so isn't combination
        if (element[key] != null && element[key].length > 1) hasCombo = true
      })
      return hasCombo
    },

    getComputedElement(element) {
      return this.combineCombinations(this.convertToOneOf(this.getAllOf(this.getDefinition(element))))
    },
    getDefinition(element) {
      if (!element.$ref) return element
      // Check for recursively nested schemas and stop rendering to prevent infinite
      // JsonSchemaViewer will always be root of schema display
      var isRecursive = false
      var node = this
      while (node.$parent.$options.name != 'JsonSchemaViewer' && !isRecursive) {
        node = node.$parent
        if ((node.element || {}).$ref == element.$ref) {
          isRecursive = true
        }
      }
      if (isRecursive) {
        return { type: 'Recursive nested schema detected for schema definition: ' + element.$ref }
      }
      var regex = /\/([^/]*)/g
      var keyPath = []
      var path = element.$ref.indexOf('#') > -1 ? element.$ref.substring(element.$ref.indexOf('#') + 1) : ''
      var match = regex.exec(path)
      while (match) {
        keyPath.push(match[1])
        match = regex.exec(path)
      }
      // use path in $ref string to try to find def
      var def = keyPath.length > 0 ? this.schema : null
      for (var i = 0; i < keyPath.length; i++) {
        def = def[keyPath[i]] || null
        if (!def) break
      }
      // others look in the mappings of id to shcema to try to find it
      if (!def) {
        def = this.schemaMap[element.$ref]
      }
      // otherwise return element with title with unknown def
      if (!def) def = {type: 'Unknown definition schema'}

      return def
    },
    getAllOf(element) {
      var el = element
      // if there is an allOf schema and no other type for the schema, try to combine the all ofs into one if all types match
      if (el.allOf && !this.getType(el)) {
        var allOf = el.allOf.map(schema => this.getComputedElement(schema))
        var types = new Set(allOf.map(schema => this.getType(schema)))
        if (types.size == 1) {
          var allOfSchema =  allOf.reduce((all, schema) => {
            Object.keys(schema).forEach(k =>{
              all[k] = schema[k]
            })
            return all
          }, {})

          Object.keys(element).forEach(key => {
            if (key != 'allOf') allOfSchema[key] = el[key]
          })
          el = allOfSchema
        }
      }
      return el
    },
    convertToOneOf(element){
      if (Array.isArray(element.type)) {
        //if there are multiple types and additional validation for at least one type break each into separate schema as oneOf
        if ((element.type.includes('object') && this.hasObjectKeys(element)) ||
          (element.type.includes('array') && this.hasArrayKeys(element)) ||
          (element.type.includes('string') && this.hasStringKeys(element)) ||
          ((element.type.includes('integer') || element.type.includes('number')) && this.hasNumericKeys(element))) {
          var self = this
          element.oneOf = element.oneOf || []
          element.type.forEach(t => {
            var temp = {
              type: t
            }
            self.getKeysForType(t).forEach(k => {
              temp[k] = element[k]
              if (element[k] != null) delete element[k]
            })
            element.oneOf.push(temp)
          })
          element.type = null
        }
      }
      return element
    },
    combineCombinations(element) {
      this.combinationKeys.forEach(k => {
        if (element[k] != null && element[k].length == 1) {
          Object.keys(element[k]).forEach(key => {
            element[key] = element[k][key]
          })
        }
      })
      return element
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
    display: flex;
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