<template>
  <section>
    <CollapsibleElement v-if="hasNested"
      :initiallyCollapsed="initiallyCollapsed"
      :type="element.type"
    >
      <template v-slot:title>
        <span v-if="name" class="vueml-json-prop-name">{{ name }}:</span>
        <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
        <span v-if="element.type" class="vueml-json-type">{{ element.type }}</span>
      </template>

      <template v-slot:titleCollapse>
        <template>
          <template v-for="value in formatedValues" >
            <span v-bind:key="value">{{ value }}</span>
          </template>
          <template v-for="key in extraNestedElementKeys" >
            <span v-bind:key="key" v-if="element[key] != null && formatedKeys.indexOf(key) == -1">{{key}}: {{element[key]}}</span>
          </template>
        </template>
      </template>

      <template v-slot:content>
        <span v-if="element.description" class="vueml-json-description">{{element.description}}</span>
        <span v-if="element.default" class="vueml-json-default">default: {{element.default}}</span>
        <span v-if="element.examples" class="vueml-json-examples">examples: {{element.examples.toString()}}</span>
      </template>
    </CollapsibleElement>

    <span v-else>
      <span v-if="name" class="vueml-json-prop-name">{{ name }}:</span>
      <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
      <span v-if="element.type" class="vueml-json-type">{{ element.type }}</span>
      <span>
          <template v-for="value in formatedValues" >
            <span v-bind:key="value">{{ value }}</span>
          </template>
          <template v-for="key in extraNestedElementKeys" >
            <span v-bind:key="key" v-if="element[key] != null && formatedKeys.indexOf(key) == -1">{{key}}: {{element[key]}}</span>
          </template>
        </span>
    </span>
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
  data() {
    return {
      baseNestedKeys: [
        'description',
        'default',
        'description',
      ]
    }
  },
  computed: {
    hasNested() {
      var nested = false
      this.baseNestedKeys.forEach((key) => {
        if (this.element[key] != null) nested = true
      })
      return nested
    },
    nestedElementKeys() {
      return this.baseNestedKeys.concat(this.extraNestedElementKeys)
    },
    extraNestedElementKeys() {
      if (!this.hasType) {
        return Object.keys(this.element).filter((key) => {
          return this.baseNestedKeys.indexOf(key) == -1
        })
      }
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
        if (this.element.minLength != null) value += this.element.minLength + ' <= length'
        if (this.element['maxLength'] != null) {
          if (value.length == 0) value += 'length'
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
            value += this.element.minimum + (this.element.exclusiveMinimum ? ' <' : ' <=') + ' x'
            if (this.element.maximum != null) {
              if (value.length == 0) value += 'x'
              value += (this.element.exclusiveMaximum ? ' < ' : ' <= ') + this.element.maximum
            }
        }
        // Json Schema Draft 4 or no exclusives defined
        else {
          value = ''
          var isExclusive = false
          if (this.element.minimum != null || this.element.exclusiveMinimum != null) {
            isExclusive = this.element.exclusiveMinimum != null
              && (this.element.minimum == null || this.element.minimum <= this.element.exclusiveMinimum)
            value += (isExclusive ? this.element.exclusiveMinimum : this.element.minimum)
                + (isExclusive ? ' < value' : ' <= value')
          }
          if (this.element.maximum != null || this.element.exclusiveMaximum != null) {
            isExclusive = this.element.exclusiveMaximum != null
              && (this.element.maximum == null || this.element.maximum >= this.element.exclusiveMaximum)
            if (value.length == 0) value += 'value'
            value += (isExclusive ? ' < ' : ' <= ') + (isExclusive ? this.element.exclusiveMaximum : this.element.maximum)
          }  
        }
        if (value.length > 0) values.push(value)
      }
      return values
    },

    hasType() {
      return this.element.type != null
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