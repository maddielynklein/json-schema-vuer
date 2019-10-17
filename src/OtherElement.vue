<template>
  <section class="jschema-vuer-element">
    <span v-if="name" class="jschema-vuer-prop-name"><span class="jschema-vuer-required" v-if="required">*</span>{{ name }}:</span>
    <CollapsibleElement v-if="hasNested"
      :initiallyCollapsed="initiallyCollapsed"
      :type="element.type"
    >
      <template v-slot:title>
        <span v-if="element.title" class="jschema-vuer-title"><strong>{{ element.title }}</strong></span>
        <span v-if="constantValue">{{ constantValue }}</span>
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
        <span v-if="element.examples" class="jschema-vuer-examples">examples: {{element.examples.toString()}}</span>

        <template v-if="!constantValue">
          <template v-if="getHasEnum(element)">
            <CollapsibleElement type="array" :initiallyCollapsed="true">
              <template v-slot:title><span>Enum:</span></template>
              <template v-slot:content>
                <span v-for="eVal in element.enum" v-bind:key="eVal">{{ isString ? ('"' + eVal + '"') : eVal.toString() }}</span>
              </template>
            </CollapsibleElement>
          </template>
          <template v-for="combo in combinationKeys">
            <span v-bind:key="combo+'-label'" v-if="element[combo] && element[combo].length > 0">{{ combo }}:</span>
            <div v-bind:key="combo" class="jschema-vuer-details">
              <span v-for="(option,index) in element[combo]" v-bind:key="index" class="jschema-vuer-conditional">
                <template v-if="getConstantValue(option) != null">{{ getConstantValue(option) }}</template>
                <template v-else>
                  <template v-for="value in getFormattedValues(option)">
                    <span v-bind:key="value">{{ value }}</span>
                  </template>
                  <template v-if="getHasEnum(option)">
                    <CollapsibleElement type="array" :initiallyCollapsed="true">
                      <template v-slot:title><span>Enum:</span></template>
                      <template v-slot:content>
                        <span v-for="eVal in option.enum" v-bind:key="eVal">{{ isString ? ('"' + eVal + '"') : eVal.toString() }}</span>
                      </template>
                    </CollapsibleElement>
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
              <template v-if="getConstantValue(element[condition]) != null">{{ getConstantValue(element[condition]) }}</template>
              <template v-else>
                <template v-for="value in getFormattedValues(element[condition])">
                  <span v-bind:key="value">{{ value }}</span>
                </template>
                <template v-if="getHasEnum(element[condition])">
                  <CollapsibleElement type="array" :initiallyCollapsed="true">
                    <template v-slot:title><span>Enum:</span></template>
                    <template v-slot:content>
                      <span v-for="eVal in element[condition].enum" v-bind:key="eVal">{{ isString ? ('"' + eVal + '"') : eVal.toString() }}</span>
                    </template>
                  </CollapsibleElement>
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

    <span v-else>
      <span v-if="element.title" class="jschema-vuer-title"><strong>{{ element.title }}</strong></span>
      <span v-if="constantValue">{{ constantValue }}</span>
      <span v-else-if="element.type" class="jschema-vuer-type">{{ element.type }}</span>
      <span v-if="!constantValue">
        <template v-if="getHasEnum(element)">
          <CollapsibleElement type="array" :initiallyCollapsed="true">
            <template v-slot:title><span>Enum:</span></template>
            <template v-slot:content>
              <span v-for="eVal in element.enum" v-bind:key="eVal">{{ isString ? ('"' + eVal + '"') : eVal.toString() }}</span>
            </template>
          </CollapsibleElement>
        </template>
        <template v-for="value in getFormattedValues(element)" >
          <span v-bind:key="value">{{ value }}</span>
        </template>
        <template v-for="key in extraNestedElementKeys" >
          <span v-bind:key="key" v-if="key == 'pattern' && element[key] != null"><code>{{element[key]}}</code></span>
          <span v-bind:key="key" v-else-if="element[key] != null">{{key}}: {{element[key]}}</span>
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
    },
    required: {
      type: Boolean,
      default: false
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
    getConstantValue(element) {
      // call to string for boolean defaults
      var val = null
      if (element.const != null) val = element.const.toString()
      if (element.enum && element.enum.length == 1) val = element.enum[0].toString()
      if (val && this.isString) val = '"' + val + '"'
      return val
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