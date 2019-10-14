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
        <span v-if="itemCount != null" class="vueml-json-additional-props"> {{ itemCount }}</span>
        <span v-if="element.uniqueItems">unique</span>
      </template>

      <template v-slot:content>
        <span v-if="element.description" class="vueml-json-description">{{element.description}}</span>
        <span v-if="element.default" class="vueml-json-default">default: {{element.default}}</span>
        <span v-if="element.examples" class="vueml-json-examples">examples: {{element.examples.toString()}}</span>
        
        <span v-if="element.additionalItems != null && typeof element.additionalItems == 'boolean'" class="vueml-json-additional-props"> {{ element.additionalItems ? '' : 'No '}} additional items</span>

        <template v-if="hasItems">
          <SchemaElement v-for="(item,index) in element.items" v-bind:key="index"
            :element="item"
          />
        </template>


        <template v-if="additionalItems">
          <SchemaElement :element="additionalItems" :initiallyCollapsed="false"/>
        </template>
        
        <template v-for="combo in combinationKeys">
          <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
          <div v-bind:key="combo" class="vueml-json-details" v-if="element[combo]">
            <span v-for="(option,index) in element[combo]" v-bind:key="index">
              <ArrayElement :element="option" :initiallyCollapsed="false" />
            </span>
          </div>
        </template>

        <template v-for="condition in conditionalKeys">
          <span v-bind:key="condition+'-label'" v-if="element[condition]">{{ condition }}:</span>
          <div v-bind:key="condition" class="vueml-json-details" v-if="element[condition]">         
              <ArrayElement :element="element[condition]" :initiallyCollapsed="false" />
          </div>
        </template>
      </template>
    </CollapsibleElement> 

    <span v-else>
      <span v-if="name" class="vueml-json-prop-name">{{ name }}:</span>
      <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
      <span>[]</span>
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

          'additionalItems',
          'contains',
          'minItems',
          'maxItems',
          'uniqueItems'
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
      hasNested() {
        return this.hasItems || this.hasNestedDetails
      },
      hasItems() {
        return this.element.items && this.element.items.length > 0
      },
      hasNestedDetails() {
        var nested = false
        this.nestedElementKeys.concat(this.combinationKeys).concat(this.conditionalKeys).forEach((key) => {
          if (this.element[key] != null) nested = true
        })
        return nested
      },
      additionalItems() {
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
      }
    }
  }
</script>