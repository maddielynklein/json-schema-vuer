<template>
  <section class="jschema-vuer-element">
    <span v-if="name" class="jschema-vuer-prop-name">
      <span class="jschema-vuer-required" v-if="required">*</span>
      <span v-else>&nbsp;</span>
      <code v-if="nameType == 'pattern'">{{ name }}</code>
      {{ nameType != 'pattern' ? name : '' }}:
    </span>
    <CollapsibleElement v-if="hasNested"
      :type="'object'"
      :initiallyCollapsed="initiallyCollapsed"
    >
      <template v-slot:title>
        <span v-if="element.title" class="jschema-vuer-title"><strong>{{ element.title }}</strong></span>
      </template>

      <template v-slot:titleOpenEnd>
        <span/>
        <ValueElement v-if="constantValue" :values="constantValue" />
        <template v-else>
          <ValueElement v-if="hasEnums" :values="element.enum" title="Enum"/>
          <span v-for="value in formattedValues" v-bind:key="value">{{ value }}</span>
        </template>
      </template>

      <template v-slot:content>
        <span v-if="element.description" class="jschema-vuer-description">{{element.description}}</span>
        <span v-if="element.default" class="jschema-vuer-default">default: {{element.default}}</span>
        <ValueElement v-if="element.examples" class="jschema-vuer-examples" :values="element.examples" title="examples"/>

        <template v-if="!constantValue">
          <template v-if="hasProperties">
            <SchemaElement v-for="key in propertyKeys" v-bind:key="key"
              :element="element.properties[key]"
              :name="key"
              :required="requiredProperties.indexOf(key) > -1"
              :schema="schema" :schemaMap="schemaMap"
            />
            <SchemaElement v-for="key in patternPropertyKeys" v-bind:key="key"
              :element="element.patternProperties[key]"
              :name="key"
              nameType="pattern"
              :schema="schema" :schemaMap="schemaMap"
            />
          </template>

          <template v-if="propertyNamesSchema">
            <SchemaElement :element="propertyNamesSchema" :schema="schema" :schemaMap="schemaMap"/>
          </template>

          <template v-if="additionalPropertiesSchema">
            <SchemaElement :element="additionalPropertiesSchema" :schema="schema" :schemaMap="schemaMap"/>
          </template>
          
          <template v-for="combo in combinationKeys">
            <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
            <div v-bind:key="combo" class="jschema-vuer-details" v-if="element[combo]">
              <span v-for="(option,index) in element[combo]" v-bind:key="index">
                <SchemaElement v-if="option.$ref != null" 
                  type="object" :element="option" :showNonNestedBrackets="false" :schema="schema" :schemaMap="schemaMap"/>
                <ObjectElement v-else :element="option" :showNonNestedBrackets="false" :schema="schema" :schemaMap="schemaMap"/>
              </span>
            </div>
          </template>

          <template v-for="condition in conditionalKeys">
            <div v-bind:key="condition" class="jschema-vuer-conditional" v-if="element[condition]">
              <span v-if="element[condition]">{{ condition }}:</span>
              <SchemaElement v-if="element[condition].$ref != null" 
                type="object" :element="element[condition]" :showNonNestedBrackets="false" :schema="schema" :schemaMap="schemaMap"/>
              <ObjectElement :element="element[condition]" :showNonNestedBrackets="false" :schema="schema" :schemaMap="schemaMap"/>
            </div>
          </template>
        </template>

        <template v-for="key in dependencyKeys">
          <CollapsibleElement v-bind:key="key + '-label'">
            <template v-slot:title>
              if&nbsp;<span class="jschema-vuer-prop-name">{{ key }}</span>:
            </template>
            <template v-slot:content>
              <SchemaElement v-if="!Array.isArray(element.dependencies[key])"
                :element="element.dependencies[key]" :schema="schema" :schemaMap="schemaMap"/>
              <SchemaElement v-else v-for="prop in element.dependencies[key]"
                v-bind:key="prop" :element="{}" :name="prop" :required="true" :schema="schema" :schemaMap="schemaMap"/>
            </template>
          </CollapsibleElement>
        </template>
      </template>
    </CollapsibleElement> 

    <span v-else>
      <span v-if="element.title" class="jschema-vuer-title"><strong>{{ element.title }}</strong></span>
      <ValueElement v-if="constantValue" :values="constantValue"/>
      <template v-else>
        <span v-if="showNonNestedBrackets">{</span>
        <ValueElement v-if="hasEnums" :values="element.enum" title="Enum"/>
        <span v-for="value in formattedValues" v-bind:key="value">{{ value }}</span>
        <span v-if="showNonNestedBrackets">}</span>
      </template>
    </span>   
  </section>
</template>

<script>
  import CollapsibleElement from './CollapsibleElement.vue'
  import ValueElement from './ValueElement.vue'
  const SchemaElement = () => import("./SchemaElement.vue");

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
      nameType: {
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
      ValueElement,
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
      constantValue() {
        if (this.element.const != null) return [this.element.const]
        if (this.element.enum != null && this.element.enum.length == 1) return this.element.enum
        return null
      },
      hasEnums() {
        return this.element.enum != null && this.element.enum.length > 1
      },
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
        return this.hasProperties || this.hasNestedDetails || this.propertyNamesSchema || this.additionalPropertiesSchema
      },
      hasProperties() {
        return this.propertyKeys.length > 0 || this.patternPropertyKeys.length > 0
      },
      propertyKeys() {
        if (this.element.properties != null && typeof this.element.properties == 'object') return Object.keys(this.element.properties)
        else return []
      },
      patternPropertyKeys() {
        if (this.element.patternProperties != null && typeof this.element.patternProperties == 'object') return Object.keys(this.element.patternProperties)
        else return []
      },
      dependencyKeys() {
        if (this.element.dependencies && typeof this.element.dependencies == 'object') return Object.keys(this.element.dependencies)
        return []
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
        if (this.element.minProperties != null) value += '( ' + this.element.minProperties + ' ... '
        if (this.element.maxProperties!= null) {
          if (value.length == 0) value += '( ... '
          value += this.element.maxProperties + ' )'
        } else if (value.length > 0) value+= ' )'
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