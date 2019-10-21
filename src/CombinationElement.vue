<template>
  <section>
    <template v-for="combo in combinationKeys">
      <section v-bind:key="combo" v-if="element[combo] != null && element[combo].length > 0" class="jschema-vuer-element">
        <span v-if="name" class="jschema-vuer-prop-name">
          <span>&nbsp;</span>
          {{ name }}:
        </span>
        <CollapsibleElement
          :initiallyCollapsed="initiallyCollapsed">
          <template v-slot:title>
            <span >{{ combo }}:</span>
          </template>

          <template v-slot:content>
            <SchemaElement v-for="(schema,index) in element[combo]" v-bind:key="index"
             :element="schema"/>
          </template>
        </CollapsibleElement>
      </section>
    </template>
  </section>
</template>

<script>
  import CollapsibleElement from './CollapsibleElement.vue'
  const SchemaElement = () => import("./SchemaElement.vue");
  export default {
    name: 'CombinationElement',
    props: {
      element: {
        type: Object,
        required: true
      },
      name: {
        type: String
      },
      initiallyCollapsed:{
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
        combinationKeys: [
          'anyOf',
          'allOf',
          'oneOf',
          'not'
        ],
      }
    },
  }
</script>