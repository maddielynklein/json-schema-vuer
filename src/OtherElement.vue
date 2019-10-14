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

      <template v-slot:titleOpenEnd>
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

        <template v-for="condition in conditionalKeys">
          <div v-bind:key="condition" class="vueml-json-conditional" v-if="element[condition]">
            <span>{{ condition }}:</span>
            <template v-for="value in getFormattedValues(element[condition])" >
              <span v-bind:key="value">{{ value }}</span>
            </template>
            <template v-for="key in extraNestedElementKeys" >
              <span v-bind:key="key" v-if="element[condition][key] != null && formattedKeys.indexOf(key) == -1">{{key}}: {{element[condition][key]}}</span>
            </template>
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
      detailKeys: [
        'description',
        'default',
        'description',
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
    baseNestedKeys() {
      return this.detailKeys.concat(this.combinationKeys).concat(this.conditionalKeys)
    },
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
            value += (rules.exclusiveMinimum ? '(' : ' [') + rules.minimum + ' ... '
            if (rules.maximum != null) {
              if (value.length == 0) value += '( ...'
              value += rules.maximum + (rules.exclusiveMaximum ? ')' : ']')
            } else if (value.length > 0) value += ' )'
        }
        // Json Schema Draft 4 or no exclusives defined
        else {
          value = ''
          var isExclusive = false
          if (rules.minimum != null || rules.exclusiveMinimum != null) {
            isExclusive = rules.exclusiveMinimum != null
              && (rules.minimum == null || rules.minimum <= rules.exclusiveMinimum)
            value += (isExclusive ? '(' : '[') + (isExclusive ? rules.exclusiveMinimum : rules.minimum) + ' ... '
          }
          if (rules.maximum != null || rules.exclusiveMaximum != null) {
            isExclusive = rules.exclusiveMaximum != null
              && (rules.maximum == null || rules.maximum >= rules.exclusiveMaximum)
            if (value.length == 0) value += '( ...'
            value += (isExclusive ? rules.exclusiveMaximum : rules.maximum) + (isExclusive ? ')' : ']' )
          } else if (value.length > 0) value += ' )' 
        }
        if (value.length > 0) values.push(value)
      }
      return values
    }
  },
}
</script>