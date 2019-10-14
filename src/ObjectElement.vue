<template>
  <section>
    <CollapsibleElement v-if="hasNested"
      :type="'object'"
      :initiallyCollapsed="initiallyCollapsed"
    >
      <template v-slot:title>
        <span v-if="name" class="vueml-json-prop-name">{{ name }}:</span>
        <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
      </template>

      <template v-slot:content>
        <span v-if="element.description" class="vueml-json-description">{{element.description}}</span>
        <span v-if="element.default" class="vueml-json-default">default: {{element.default}}</span>
        <span v-if="element.examples" class="vueml-json-examples">examples: {{element.examples.toString()}}</span>
        <span v-if="propertyCount != null" class="vueml-json-additional-props"> {{ propertyCount }}</span>
        <span v-if="element.additionalProperties != null && typeof element.additionalProperties == 'boolean'" class="vueml-json-additional-props"> {{ element.additionalProperties ? '' : 'No '}} additional properties</span>
        
        <template v-if="propertyNames">
          <SchemaElement :element="propertyNames" :initiallyCollapsed="false"/>
        </template>

        <template v-if="hasProperties">
          <SchemaElement v-for="key in propertyKeys" v-bind:key="key"
            :element="element.properties[key]"
            :name="key"
          />
        </template>

        <template v-if="additionalProperties">
          <SchemaElement :element="additionalProperties" :initiallyCollapsed="false"/>
        </template>
        
        <template v-for="combo in combinationKeys">
          <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
          <div v-bind:key="combo" class="vueml-json-details" v-if="element[combo]">
            <span v-for="(option,index) in element[combo]" v-bind:key="index">
              <ObjectElement :element="option" :initiallyCollapsed="false" />
            </span>
          </div>
        </template>

        <template v-for="condition in conditionalKeys">
          <span v-bind:key="condition+'-label'" v-if="element[condition]">{{ condition }}:</span>
          <div v-bind:key="condition" class="vueml-json-details" v-if="element[condition]">
            <ObjectElement :element="element[condition]" :initiallyCollapsed="false" />
          </div>
        </template>
      </template>
    </CollapsibleElement> 

    <span v-else>
      <span v-if="name" class="vueml-json-prop-name">{{ name }}:</span>
      <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
      <span>{}</span>
    </span>   
  </section>
</template>

<script>
  import CollapsibleElement from './CollapsibleElement'
  const SchemaElement = () => import("./SchemaElement");

  export default {
    name: 'ObjectElement',
    props:{
      element: {
        type: Object,
        required: true,
      },
      name: {
        type: String
      },
      initiallyCollapsed: {
        type: Boolean,
        default: true
      }
    },
    components: {
      CollapsibleElement,
      SchemaElement
    },
    data() {
      return {
        nestedElementKeys: [
          'description',
          'default',
          'examples',

          'additionalProperties',
          'propertyNames',
          'minProperties',
          'maxProperties',
          'dependencies'
        ],
        combinationKeys: [
          'anyOf',
          'allOf',
          'oneOf',
          'not'
        ],
        conditionalKeys: [
          'if',
          'then',
          'else'
        ],
      }
    },
    computed: {
      title() {
        var title = this.name ? (this.name + ": ") : ''
        title += (this.element.title || '')
        if (!this.hasNested) title += ' {}'
        return title
      },
      hasNested() {
        return this.hasProperties || this.hasNestedDetails
      },
      hasProperties() {
        return this.propertyKeys.length > 0
      },
      propertyKeys() {
        if (this.element.properties != null && typeof this.element.properties == 'object') return Object.keys(this.element.properties)
        else return []
      },
      hasNestedDetails() {
        var nested = false
        this.nestedElementKeys.concat(this.combinationKeys).concat(this.conditionalKeys).forEach((key) => {
          if (this.element[key] != null) nested = true
        })
        return nested
      },
      propertyNames() {
        var schema = null
        if (this.element.propertyNames) {
          schema = {
            type: 'string',
            title: 'property name validation:'
          }
          Object.keys(this.element.propertyNames).forEach((key) => {
            schema[key] = this.element.propertyNames[key]
          })
        }
        return schema
      },
      additionalProperties() {
        var schema = null
        if (this.element.additionalProperties && typeof this.element.additionalProperties == 'object') {
          schema = {
            title: 'additional properties:'
          }
          Object.keys(this.element.additionalProperties).forEach((key) => {
            schema[key] = this.element.additionalProperties[key]
          })
        }
        return schema
      },
      propertyCount() {
        var value = ''
        if (this.element.minProperties != null) value += this.element.minProperties + ' <= property count'
        if (this.element.maxProperties!= null) {
          if (value.length == 0) value += 'property count'
          value += ' <= ' + this.element.maxProperties
        }
        if (value.length > 0) return value
        return null
      }
    }
  }
</script>