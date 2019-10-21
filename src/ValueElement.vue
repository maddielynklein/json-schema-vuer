<script>
  import CollapsibleElement from './CollapsibleElement.vue'

  export default {
    name: 'ValueElement',
    props: {
      values: {
        type: Array,
        required: true
      },
      propName: {
        type: String,
        defualt: null
      },
      title: {
        type: String,
        defualt: null
      },
      className: {
        type: String,
        default: 'jschema-vuer-element'
      }
    },
    components: {
      CollapsibleElement
    },
    render(createElement) {
      var config = {}
      if (!this.isCollapsible) {
        config = {class: {}}
        if (this.className) config.class[this.className] = true
        if (this.propName) {
          return createElement('span', config,[
              createElement('span', {class: {'jschema-vuer-prop-name': true}}, this.propName + ': '),
              createElement('ValueElement', {
                props: {
                  values: [this.values[0]]
                }
              })
            ]
          )
        }
        return createElement('span', config, (this.title ? this.title + ': ' : '') + this.formatString(this.values[0]))
      }
      var contentChildren = null
      var type = (this.isMultiple || Array.isArray(this.values[0])) ? 'array' : 'object'
      if (type == 'array') {
        var arr = this.isMultiple ? this.values : this.values[0]
        contentChildren = arr.map(v => createElement('ValueElement', {
          props: {
            values: [v]
          }
        }))
      } else {
        contentChildren = Object.keys(this.values[0]).map(k => createElement('ValueElement', {
          props: {
            propName: k,
            values: [this.values[0][k]]
          }
        }))
      }
      config = {
        props: {
          initiallyCollapsed: true,
          type: type
        }
      }
      var children = []
      if (this.title != null) {
        children.push(createElement('span', {
          slot: 'title'
        }, this.title + ': '))
      } else if (this.propName != null) {
        children.push(createElement('span', {
          class: {'jschema-vuer-prop-name': true},
          slot: 'title'
        }, this.propName + ': '))
      }
      children.push(createElement('template', {
          slot: 'content'
        }, contentChildren))
      return createElement('CollapsibleElement', config, children)
    },
    computed: {
      isCollapsible () {
        return this.isMultiple || typeof this.values[0] == 'object'
      },
      isMultiple() {
        return this.values.length > 1
      },
    },
    methods: {
      formatString(val) {
        if (isNaN(val) && val != 'null' && val != 'true' && val != 'false') {
          val = '"' + val + '"'
        }
        return val
      }
    }
  }
</script>