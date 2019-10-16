<template>
  <section class="vueml-json-element">
    <span v-if="name" class="vueml-json-prop-name"><span class="vueml-json-required" v-if="required">*</span>{{ name }}:</span>
    <CollapsibleElement v-if="hasNested"
      :type="'object'"
      :initiallyCollapsed="initiallyCollapsed"
    >
      <template v-slot:title>
        <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
      </template>

      <template v-slot:titleOpenEnd>
        <span v-for="value in formattedValues" v-bind:key="value">{{ value }}</span>
      </template>

      <template v-slot:content>
        <span v-if="element.description" class="vueml-json-description">{{element.description}}</span>
        <span v-if="element.default" class="vueml-json-default">default: {{element.default}}</span>
        <span v-if="element.examples" class="vueml-json-examples">examples: {{element.examples.toString()}}</span>

        <template v-if="hasProperties">
          <SchemaElement v-for="key in propertyKeys" v-bind:key="key"
            :element="element.properties[key]"
            :name="key"
            :required="requiredProperties.indexOf(key) > -1"
          />
        </template>

        <template v-if="propertyNamesSchema">
          <SchemaElement :element="propertyNamesSchema" :initiallyCollapsed="true"/>
        </template>

        <template v-if="additionalPropertiesSchema">
          <SchemaElement :element="additionalPropertiesSchema" :initiallyCollapsed="true"/>
        </template>
        
        <template v-for="combo in combinationKeys">
          <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
          <div v-bind:key="combo" class="vueml-json-details" v-if="element[combo]">
            <span v-for="(option,index) in element[combo]" v-bind:key="index">
              <ObjectElement :element="option" :initiallyCollapsed="true" :showNonNestedBrackets="false"/>
            </span>
          </div>
        </template>

        <template v-for="condition in conditionalKeys">
          <div v-bind:key="condition" class="vueml-json-conditional" v-if="element[condition]">
            <span v-if="element[condition]">{{ condition }}:</span>
            <ObjectElement :element="element[condition]" :initiallyCollapsed="true" :showNonNestedBrackets="false"/>
          </div>
        </template>
      </template>
    </CollapsibleElement> 

    <span v-else>
      <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
      <span v-if="showNonNestedBrackets">{</span>
      <span v-for="value in formattedValues" v-bind:key="value">{{ value }}</span>
      <span v-if="showNonNestedBrackets">}</span>
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
      required: {
        type: Boolean,
        default: false
      },
      initiallyCollapsed: {
        type: Boolean,
        default: true
      },
      showNonNestedBrackets:{
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
      requiredProperties() {
        return this.element.required ? this.element.required : []
      },
      title() {
        var title = this.name ? (this.name + ": ") : ''
        title += (this.element.title || '')
        if (!this.hasNested) title += ' {}'
        return title
      },
      hasNested() {
        return this.hasProperties || this.hasNestedDetails|| this.propertyNamesSchema || this.additionalPropertiesSchema
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
      propertyNamesSchema() {
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
      additionalPropertiesSchema() {
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
      formattedValues() {
        var values = [];
        if (this.propertyCount) values.push(this.propertyCount)
        if (this.additionalPropertiesDisplay) values.push(this.additionalPropertiesDisplay)
        return values
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
      },
      additionalPropertiesDisplay() {
        if (this.element.additionalProperties !== null && typeof this.element.additionalProperties == 'boolean') {
          return (this.element.additionalProperties ? '' : 'No ') + 'additional properties'
        }
        return null
      }
    }
  }
</script>