<template>
  <section>
    <CollapsibleElement v-if="hasNested"
      :type="'array'"
      :initiallyCollapsed="initiallyCollapsed"
    >
      <template v-slot:title>
        <span v-if="name" class="vueml-json-prop-name">{{ name }}:</span>
        <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
      </template>

      <template v-slot:titleOpenEnd>
        <span v-for="value in formattedValues" v-bind:key="value">{{ value }}</span>
      </template>

      <template v-slot:content>
        <span v-if="element.description" class="vueml-json-description">{{element.description}}</span>
        <span v-if="element.default" class="vueml-json-default">default: {{element.default}}</span>
        <span v-if="element.examples" class="vueml-json-examples">examples: {{element.examples.toString()}}</span>

        <template v-if="hasItems">
          <SchemaElement v-for="(item,index) in element.items" v-bind:key="index"
            :element="item"
          />
        </template>


        <template v-if="additionalItemsSchema">
          <SchemaElement :element="additionalItemsSchema" :initiallyCollapsed="false"/>
        </template>
        
        <template v-for="combo in combinationKeys">
          <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
          <div v-bind:key="combo" class="vueml-json-details" v-if="element[combo]">
            <span v-for="(option,index) in element[combo]" v-bind:key="index">
              <ArrayElement :element="option" :initiallyCollapsed="false" :showNonNestedBrackets="false"/>
            </span>
          </div>
        </template>

        <template v-for="condition in conditionalKeys">
          <div v-bind:key="condition" class="vueml-json-conditional" v-if="element[condition]">  
              <span v-if="element[condition]">{{ condition }}:</span> 
              <ArrayElement :element="element[condition]" :initiallyCollapsed="false" :showNonNestedBrackets="false"/>
          </div>
        </template>
      </template>
    </CollapsibleElement> 

    <span v-else>
      <span v-if="name" class="vueml-json-prop-name">{{ name }}:</span>
      <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
      <span v-if="showNonNestedBrackets">[</span>
      <span v-for="value in formattedValues" v-bind:key="value">{{ value }}</span>
      <span v-if="showNonNestedBrackets">]</span>
    </span>  
  </section>
</template>

<script>
  import CollapsibleElement from './CollapsibleElement'
  const SchemaElement = () => import("./SchemaElement");

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
      initiallyCollapsed: {
        type: Boolean,
        default: true
      },
      showNonNestedBrackets: {
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
        return this.element.items && this.element.items.length > 0
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