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
        <span v-if="element.additionalProperties != null" class="vueml-json-additional-props"> {{ element.additionalProperties ? '' : 'No '}} Additional Properties Allowed</span>
        <span v-if="hasNestedDetails">{</span>
        <template v-if="hasProperties" v-for="key in propertyKeys">
          <SchemaElement v-bind:key="key"
            :element="element.properties[key]"
            :name="key"
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
    name: 'ObjectElement',
    props:{
      element: {
        type: Object,
        required: true,
        validator(value) {
          return value.type == 'object'
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
        if (!this.hasNested) title += '{}'
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

          'additionalProperties',
          'propertyNames',
          'minProperties',
          'maxProperties',
          'dependencies'
        ]
      },
    }
  }
</script>