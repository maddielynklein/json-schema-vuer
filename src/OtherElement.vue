<template>
  <section>
    <CollapsibleElement v-if="hasNested"
      :initiallyCollapsed="initiallyCollapsed"
      :type="element.type"
    >
      <template v-slot:title>
        <span> {{ title }}</span>
      </template>

      <template v-slot:content>
        <span v-if="element.description" class="vueml-json-description">{{element.description}}</span>
        <span v-if="element.default" class="vueml-json-default">default: {{element.default}}</span>
        <span v-if="element.examples" class="vueml-json-examples">examples: {{element.examples}}</span>

        <template v-for="value in formatedValues" >
            <span v-bind:key="value">{{ value }}</span>
          </template>
        <template v-for="key in extraNestedElementKeys" >
            <span v-bind:key="key" v-if="element[key] != null && formatedKeys.indexOf(key) == -1">{{key}}: {{element[key]}}</span>
          </template>
      </template>
    </CollapsibleElement>

    <span v-else>{{ title }}</span>
  </section>
</template>

<script>
import CollapsibleElement from './CollapsibleElement'

export default {
  name: 'OtherElement',
  props: {
    element: {
      type: Object,
      required: true,
      validator(value) {
        return ['string', 'integer', 'number'].indexOf(value.type) > -1
      }
    },
    initiallyCollapsed: {
      type: Boolean,
      default: true
    },
    name: {
      type: String
    }
  },
  components: {
    CollapsibleElement
  },
  computed: {
    title() {
      var title = this.name ? (this.name + ': ') : ''
      title += this.element.type
      return title
    },
    hasNested() {
      var nested = false
      this.nestedElementKeys.forEach((key) => {
        if (this.element[key] != null) nested = true
      })
      return nested
    },
    nestedElementKeys() {
      var keys = [
        'description',
        'default',
        'description',
      ]
      return keys.concat(this.extraNestedElementKeys)
    },
    extraNestedElementKeys() {
      var keys = []
      if (this.isString) {
        keys.push(
          'minLength',
          'maxLength',
          'regex',
          'format',
          'contentMediaType',
          'contentEncoding',
        )
      }
      if (this.isNumeric) {
        keys.push(
          'multipleOf',
          'minimum',
          'exclusiveMinimum',
          'maximum',
          'exclusiveMaximum'
        );
      }
      return keys
    },
    formatedKeys() {
      var keys = []
      if (this.isString) {
        keys.push(
          'minLength',
          'maxLength',
        )
      }
      if (this.isNumeric) {
        keys.push(
          'minimum',
          'exclusiveMinimum',
          'maximum',
          'exclusiveMaximum'
        );
      }
      return keys
    },
    formatedValues() {
      var values = []
      var value = null
      if (this.isString) {
        value = ''
        if (this.element.minLength != null) value += this.element.minLength + ' <= value.length'
        if (this.element['maxLength'] != null) {
          if (value.length == 0) value += 'value.length'
          value += ' <= ' + this.element['maxLength']
        }
        if (value.length > 0) values.push(value)
      }
      if (this.isNumeric){
        value = ''
        // Json Schema Draft 7
        if ((this.element.exclusiveMinimum != null && typeof this.element.exclusiveMinimum == 'boolean')
          || (this.element.exclusiveMaximum != null && typeof this.element.exclusiveMaximum == 'boolean'))
        {
          if (this.element.minimum != null) 
            value += this.element.minimum + (this.element.exclusiveMinimum ? ' <' : ' <=') + ' value'
            if (this.element.maximum != null) {
              if (value.length == 0) value += 'value'
              value += (this.element.exclusiveMaximum ? ' < ' : ' <= ') + this.element.maximum
            }
        }
        // Json Schema Draft 4 or no exclusives defined
        else {
          value = ''
          if (this.element.minimum != null || this.element.exclusiveMinimum != null) {
            var isExclusive = this.element.exclusiveMinimum != null
              && (this.element.minimum == null || this.element.minimum <= this.element.exclusiveMinimum)
            value += (isExclusive ? this.element.exclusiveMinimum : this.element.minimum)
                + (isExclusive ? ' < value' : ' <= value')
          }
          if (this.element.maximum != null || this.element.exclusiveMaximum != null) {
            var isExclusive = this.element.exclusiveMaximum != null
              && (this.element.maximum == null || this.element.maximum >= this.element.exclusiveMaximum)
            if (value.length == 0) value += 'value'
            value += (isExclusive ? ' < ' : ' <= ') + (isExclusive ? this.element.exclusiveMaximum : this.element.maximum)
          }  
        }
        if (value.length > 0) values.push(value)
      }
      return values
    },

    isString() {
      return this.element.type == 'string'
    },
    isNumeric() {
      return this.element.type == 'integer' || this.element.type == 'number'
    }
  }
}
</script>