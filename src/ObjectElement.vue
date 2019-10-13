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
        <span v-if="element.additionalProperties != null" class="vueml-json-additional-props"> {{ element.additionalProperties ? '' : 'No '}} additional properties</span>
        
        <template v-if="hasProperties">
          <SchemaElement v-for="key in propertyKeys" v-bind:key="key"
            :element="element.properties[key]"
            :name="key"
          />
        </template>
        
        <template v-for="combo in combinationKeys">
          <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
          <div v-bind:key="combo" class="vueml-json-details">
            <span v-for="(option,index) in element[combo]" v-bind:key="index">
              <ObjectElement :element="option" :initiallyCollapsed="false" />
            </span>
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
        validator(value) {
          return value.type == 'object' || value.properties != null
        }
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
        ]
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
        this.nestedElementKeys.concat(this.combinationKeys).forEach((key) => {
          if (this.element[key] != null) nested = true
        })
        return nested
      }
    }
  }
</script>