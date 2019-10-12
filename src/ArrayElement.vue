<template>
  <section>
    <CollapsibleElement v-if="hasNested"
      :type="element.type"
      :initiallyCollapsed="initiallyCollapsed"
      :showTopTagWhenOpen="!hasNestedDetails"
    >
      <template v-slot:title>{{ title }}</template>

      <template v-slot:content>
        <span v-if="element.description" class="vueml-json-description">{{element.description}}</span>
        <span v-if="element.default" class="vueml-json-default">default: {{element.default}}</span>
        <span v-if="element.examples" class="vueml-json-examples">examples: {{element.examples.toString()}}</span>
        <span v-if="element.additionalItems != null" class="vueml-json-additional-props"> {{ element.additionalItems ? '' : 'No '}} Additional Items Allowed</span>
        <span v-if="hasNestedDetails">{</span>
        <template v-if="hasItems" v-for="(item,index) in element.items">
          <SchemaElement v-bind:key="index"
            :element="item"
          />
        </template>
      </template>
    </CollapsibleElement> 

    <span v-else>{{ title }}</span>   
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
        validator(value) {
          return value.type == 'array'
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
        this.nestedElementKeys.forEach((key) => {
          if (this.element[key] != null) nested = true
        })
        return nested
      },
      nestedElementKeys() {
        return [
          'description',
          'default',
          'examples',

          'additionalItems',
          'contains',
          'minItems',
          'maxItems',
          'uniqueItems'
        ]
      },
    }
  }
</script>