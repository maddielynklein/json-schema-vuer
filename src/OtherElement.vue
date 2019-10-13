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
          <template v-for="value in getFormattedValues(element)" >
            <span v-bind:key="value">{{ value }}</span>
          </template>
          <template v-for="key in extraNestedElementKeys" >
            <span v-bind:key="key" v-if="element[key] != null && formattedKeys.indexOf(key) == -1">{{key}}: {{element[key]}}</span>
          </template>
        </template>
      </template>

      <template v-slot:content>
        <span v-if="element.description" class="vueml-json-description">{{element.description}}</span>
        <span v-if="element.default" class="vueml-json-default">default: {{element.default}}</span>
        <span v-if="element.examples" class="vueml-json-examples">examples: {{element.examples.toString()}}</span>
        <template v-for="combo in combinationKeys">
          <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
          <div v-bind:key="combo" class="vueml-json-details">
            <span v-for="(option,index) in element[combo]" v-bind:key="index">
              <template v-for="value in getFormattedValues(option)" >
                <span v-bind:key="value">{{ value }}</span>
              </template>
              <template v-for="key in extraNestedElementKeys" >
                <span v-bind:key="key" v-if="option[key] != null && formattedKeys.indexOf(key) == -1">{{key}}: {{option[key]}}</span>
              </template>
            </span>
          </div>
        </template>
      </template>
    </CollapsibleElement>

    <span v-else>
      <span v-if="name" class="vueml-json-prop-name">{{ name }}:</span>
      <span v-if="element.title" class="vueml-json-title"><strong>{{ element.title }}</strong></span>
      <span v-if="element.type" class="vueml-json-type">{{ element.type }}</span>
      <span>
        <template v-for="value in getFormattedValues(element)" >
          <span v-bind:key="value">{{ value }}</span>
        </template>
        <template v-for="key in extraNestedElementKeys" >
          <span v-bind:key="key" v-if="element[key] != null && formattedKeys.indexOf(key) == -1">{{key}}: {{element[key]}}</span>
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
    hasNested() {
      var nested = false
      this.baseNestedKeys.concat(this.combinationKeys).forEach((key) => {
        if (this.element[key] != null) nested = true
      })
      return nested
    },
    nestedElementKeys() {
      return this.baseNestedKeys.concat(this.combinationKeys).concat(this.extraNestedElementKeys)
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
          'pattern',
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
    formattedKeys() {
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
    hasType() {
      return this.element.type != null
    },
    isString() {
      return this.element.type == 'string'
    },
    isNumeric() {
      return this.element.type == 'integer' || this.element.type == 'number'
    }
  },
  methods: {
    getFormattedValues(rules) {
      var values = []
      var value = null
      if (this.isString) {
        value = ''
        if (rules.minLength != null) value += rules.minLength + ' <= length'
        if (rules['maxLength'] != null) {
          if (value.length == 0) value += 'length'
          value += ' <= ' + rules['maxLength']
        }
        if (value.length > 0) values.push(value)
      }
      if (this.isNumeric){
        value = ''
        // Json Schema Draft 7
        if ((rules.exclusiveMinimum != null && typeof rules.exclusiveMinimum == 'boolean')
          || (rules.exclusiveMaximum != null && typeof rules.exclusiveMaximum == 'boolean'))
        {
          if (rules.minimum != null) 
            value += rules.minimum + (rules.exclusiveMinimum ? ' <' : ' <=') + ' x'
            if (rules.maximum != null) {
              if (value.length == 0) value += 'x'
              value += (rules.exclusiveMaximum ? ' < ' : ' <= ') + rules.maximum
            }
        }
        // Json Schema Draft 4 or no exclusives defined
        else {
          value = ''
          var isExclusive = false
          if (rules.minimum != null || rules.exclusiveMinimum != null) {
            isExclusive = rules.exclusiveMinimum != null
              && (rules.minimum == null || rules.minimum <= rules.exclusiveMinimum)
            value += (isExclusive ? rules.exclusiveMinimum : rules.minimum)
                + (isExclusive ? ' < value' : ' <= value')
          }
          if (rules.maximum != null || rules.exclusiveMaximum != null) {
            isExclusive = rules.exclusiveMaximum != null
              && (rules.maximum == null || rules.maximum >= rules.exclusiveMaximum)
            if (value.length == 0) value += 'value'
            value += (isExclusive ? ' < ' : ' <= ') + (isExclusive ? rules.exclusiveMaximum : rules.maximum)
          }  
        }
        if (value.length > 0) values.push(value)
      }
      return values
    }
  },
}
</script>