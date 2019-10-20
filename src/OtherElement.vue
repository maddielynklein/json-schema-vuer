<template>
  <section class="jschema-vuer-element">
    <span v-if="name" class="jschema-vuer-prop-name">
      <span class="jschema-vuer-required" v-if="required">*</span>
      <span v-else>&nbsp;</span>
      <code v-if="nameType == 'pattern'">{{ name }}</code>
      {{ nameType != 'pattern' ? name : '' }} {{ hasInformation ? ':' : ''}}
    </span>
    <CollapsibleElement v-if="hasNested"
      :initiallyCollapsed="initiallyCollapsed"
      :type="element.type"
    >
      <template v-slot:title>
        <span v-if="element.title" class="jschema-vuer-title"><strong>{{ element.title }}</strong></span>
        <ValueElement v-if="constantValue" :values="constantValue"/>
        <span v-else-if="element.type" class="jschema-vuer-type">{{ element.type }}</span>
      </template>

      <template v-slot:titleOpenEnd v-if="!constantValue">
        <template>
          <template v-for="value in getFormattedValues(element)" >
            <span v-bind:key="value">{{ value }}</span>
          </template>
          <template v-for="key in extraNestedElementKeys" >
            <span v-bind:key="key" v-if="key == 'pattern' && element[key] != null"><code>{{element[key]}}</code></span>
            <span v-bind:key="key" v-else-if="element[key] != null">{{element[key]}}</span>
          </template>
        </template>
      </template>

      <template v-slot:content>
        <span v-if="element.description" class="jschema-vuer-description">{{element.description}}</span>
        <span v-if="element.default" class="jschema-vuer-default">default: {{element.default}}</span>
        <ValueElement v-if="element.examples" class="jschema-vuer-examples" :values="element.examples" title="examples"/>

        <template v-if="!constantValue">
          <template v-if="getHasEnum(element)">
            <ValueElement :values="element.enum" title="Enum"/>
          </template>
          <template v-for="combo in combinationKeys">
            <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
            <div v-bind:key="combo" class="jschema-vuer-details">
              <span v-for="(option,index) in element[combo]" v-bind:key="index" class="jschema-vuer-conditional">
                <ValueElement v-if="getConstantValue(option) != null" :values="getConstantValue(option)"/>
                <template v-else>
                  <template v-for="value in getFormattedValues(option)">
                    <span v-bind:key="value">{{ value }}</span>
                  </template>
                  <template v-if="getHasEnum(option)">
                    <ValueElement :values="option.enum" title="Enum"/>
                  </template>
                  <template v-for="key in extraNestedElementKeys" >
                    <span v-bind:key="key" v-if="key == 'pattern' && option[key] != null"><code>{{option[key]}}</code></span>
                    <span v-bind:key="key" v-else-if="option[key] != null">{{option[key]}}</span>
                  </template>
                </template>
              </span>
            </div>
          </template>

          <template v-for="condition in conditionalKeys">
            <div v-bind:key="condition" class="jschema-vuer-conditional" v-if="element[condition]">
              <span>{{ condition }}:</span>
              <ValueElement v-if="getConstantValue(element[condition]) != null" :values="getConstantValue(element[condition])"/>
              <template v-else>
                <template v-for="value in getFormattedValues(element[condition])">
                  <span v-bind:key="value">{{ value }}</span>
                </template>
                <template v-if="getHasEnum(element[condition])">
                  <ValueElement :values="element[condition].enum" title="Enum"/>
                </template>
                <template v-for="key in extraNestedElementKeys" >
                  <span v-bind:key="key" v-if="key == 'pattern' && element[condition][key] != null"><code>{{element[condition][key]}}</code></span>
                  <span v-bind:key="key" v-else-if="element[condition][key] != null">{{element[condition][key]}}</span>
                </template>
              </template>
            </div>
          </template>
        </template>
      </template>
    </CollapsibleElement>

    <template v-else>
      <span v-if="element.title" class="jschema-vuer-title"><strong>{{ element.title }}</strong></span>
      <ValueElement v-if="constantValue" :values="constantValue"/>
      <span v-else-if="element.type" class="jschema-vuer-type">{{ element.type }}</span>
      <div v-if="!constantValue">
        <template v-if="getHasEnum(element)">
          <ValueElement :values="element.enum" title="Enum"/>
        </template>
        <template v-for="value in getFormattedValues(element)" >
          <span v-bind:key="value">{{ value }}</span>
        </template>
        <template v-for="key in extraNestedElementKeys" >
          <span v-bind:key="key" v-if="key == 'pattern' && element[key] != null"><code>{{element[key]}}</code></span>
          <span v-bind:key="key" v-else-if="element[key] != null">{{key}}: {{element[key]}}</span>
        </template>
      </div>
    </template>
  </section>
</template>

<script>
import CollapsibleElement from './CollapsibleElement'
import ValueElement from './ValueElement'

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
    },
    nameType: {
      type: String
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  components: {
    CollapsibleElement,
    ValueElement
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
    hasInformation() {
      return this.element.type != null || this.hasNested || this.constantValue || this.getHasEnum(this.element)
        || this.getFormattedValues(this.element).length > 0
    },
    constantValue() {
      return this.getConstantValue(this.element)
    },
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
          return this.baseNestedKeys.indexOf(key) == -1 && ['enum', 'constant'].indexOf(key) == -1
        })
      }
      var keys = []
      if (this.isString) {
        keys.push(
          'pattern',
          'format',
          'contentMediaType',
          'contentEncoding',
        )
      }
      if (this.isNumeric) {
        keys.push(
          'multipleOf',
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
    formatEnumValue(val) {
      if (this.isString || 
        (!this.hasType && isNaN(val) && val != 'null' && val != 'false' && val != 'true')) val = '"' + val + '"'
      return val
    },
    getConstantValue(element) {
      var arr = null
      if (element.const != null) arr = [element.const]
      else if (element.enum != null && element.enum.length == 1) arr = element.enum
      return arr
    },
    getHasEnum(element) {
      return element.enum != null && element.enum.length > 0
    },
    getFormattedValues(rules) {
      var values = []
      var value = null
      if (this.isString) {
        value = ''
        if (rules.minLength != null) value += '( ' + rules.minLength + ' ... '
        if (rules['maxLength'] != null) {
          if (value.length == 0) value += '( ...'
          value += rules['maxLength'] + ' )'
        } else if (value.length > 0)value += ' )'
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