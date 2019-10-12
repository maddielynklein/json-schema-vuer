import JsonSchemaViewer from './JsonSchemaViewer'


const defaultComponentName = 'JsonSchemaViewer'

const Plugin = {
  install (Vue, options = {}) {
   
    const componentName = options.componentName || defaultComponentName
    Vue.component(componentName, JsonSchemaViewer)
  }
}

export default Plugin