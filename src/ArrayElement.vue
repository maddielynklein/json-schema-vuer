<template>
  <section class="jschema-vuer-element">
    <span v-if="name" class="jschema-vuer-prop-name">
      <span class="jschema-vuer-required" v-if="required">*</span>
      <span v-else>&nbsp;</span>
      <code v-if="nameType == 'pattern'">{{ name }}</code>
      {{ nameType != 'pattern' ? name : '' }}:
    </span>
    <CollapsibleElement v-if="hasNested"
      :type="'array'"
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
          <section v-if="hasItems" class="jschema-vuer-element">
            <span><strong>items:</strong></span>
            <CollapsibleElement v-if="element.items.length > 1" type="array" :initiallyCollapsed="false">
              <template v-slot:content>
                <SchemaElement v-for="(item,index) in element.items" v-bind:key="index"
                  :element="item" :schema="schema" :schemaMap="schemaMap"
                />
              </template>
            </CollapsibleElement>
            <SchemaElement v-else-if="Array.isArray(element.items)" :element="element.items[0]" :schema="schema" :schemaMap="schemaMap"/>
            <SchemaElement v-else :element="element.items" :schema="schema" :schemaMap="schemaMap"/>
          </section>

          <template v-if="additionalItemsSchema">
            <SchemaElement :element="additionalItemsSchema" :schema="schema" :schemaMap="schemaMap"/>
          </template>

          <template v-if="containsSchema">
            <SchemaElement :element="containsSchema" :schema="schema" :schemaMap="schemaMap"/>
          </template>
          
          <template v-for="combo in combinationKeys">
            <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
            <div v-bind:key="combo" class="jschema-vuer-details" v-if="element[combo]">
              <span v-for="(option,index) in element[combo]" v-bind:key="index">
                <SchemaElement v-if="option.$ref != null" 
                  type="array" :element="option" :showNonNestedBrackets="false" :schema="schema" :schemaMap="schemaMap"/>
                <ArrayElement v-else :element="option" :showNonNestedBrackets="false" :schema="schema" :schemaMap="schemaMap"/>
              </span>
            </div>
          </template>

          <template v-for="condition in conditionalKeys">
            <div v-bind:key="condition" class="jschema-vuer-conditional" v-if="element[condition]">  
                <span v-if="element[condition]">{{ condition }}:</span> 
                <SchemaElement v-if="element[condition].$ref != null" 
                  type="array" :element="element[condition]" :showNonNestedBrackets="false" :schema="schema" :schemaMap="schemaMap"/>
                <ArrayElement v-else :element="element[condition]" :showNonNestedBrackets="false" :schema="schema" :schemaMap="schemaMap"/>
            </div>
          </template>
        </template>
      </template>
    </CollapsibleElement> 

    <span v-else>
      <span v-if="element.title" class="jschema-vuer-title"><strong>{{ element.title }}</strong></span>
      <ValueElement v-if="constantValue" :values="constantValue"/>
      <template v-else>
        <span v-if="showNonNestedBrackets">[</span>
        <ValueElement v-if="hasEnums" :values="element.enum" title="Enum"/>
        <span v-for="value in formattedValues" v-bind:key="value">{{ value }}</span>
        <span v-if="showNonNestedBrackets">]</span>
      </template>
    </span>  
  </section>
</template>

<script>
  import CollapsibleElement from './CollapsibleElement.vue'
  import ValueElement from './ValueElement.vue'
  const SchemaElement = () => import("./SchemaElement.vue");

  export default {
    name: 'ArrayElement',
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
      ValueElement,
      SchemaElement
    },
    data() {
      return {
        detailsKeys: [
          'description',
          'default',
          'examples',

          'contains'
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
      title() {
        var title = this.name ? (this.name + ": ") : ''
        title += (this.element.title || '')
        if (!this.hasNested) title += ' []'
        return title
      },
      nestedElementKeys() {
        return this.detailsKeys.concat(this.combinationKeys).concat(this.conditionalKeys)
      },
      hasNested() {
        return this.hasItems || this.hasNestedDetails || this.additionalItemsSchema
      },
      hasItems() {
        return this.element.items && (this.element.items.length > 0 || typeof this.element.items == 'object')
      },
      hasNestedDetails() {
        var nested = false
        this.nestedElementKeys.forEach((key) => {
          if (this.element[key] != null) nested = true
        })
        return nested
      },
      additionalItemsSchema() {
        var schema = null
        if (this.element.additionalItems && typeof this.element.additionalItems == 'object') {
          schema = {
            title: 'additional items:'
          }
          Object.keys(this.element.additionalItems).forEach((key) => {
            schema[key] = this.element.additionalItems[key]
          })
        }
        return schema
      },
      containsSchema() {
        var schema = null
        if (this.element.contains && typeof this.element.contains == 'object') {
          schema = {
            title: 'contains:'
          }
          Object.keys(this.element.contains).forEach((key) => {
            schema[key] = this.element.contains[key]
          })
        }
        return schema
      },
      formattedValues() {
        var values = [];
        if (this.itemCount) values.push(this.itemCount)
        if (this.element.uniqueItems) values.push('unique')
        if (this.additionalItemsDisplay) values.push(this.additionalItemsDisplay)
        return values;
      },
      itemCount() {
        var value = ''
        if (this.element.minItems != null) 
        value += '(' + this.element.minItems + ' ...'
        if (this.element.maxItems != null) {
          if (value.length == 0) value += '( ... '
          value += this.element.maxItems + ')'
        } else if (value.length > 0) value += ' )'
        if (value.length > 0) return value
        return null
      },
      additionalItemsDisplay() {
        if (this.element.additionalItems !== null && typeof this.element.additionalItems == 'boolean') {
          return (this.element.additionalItems ? '' : 'No ') + 'additional items'
        }
        return null
      }
    }
  }
</script>