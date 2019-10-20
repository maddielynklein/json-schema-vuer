# json-schema-vuer

## Add to project
```
npm install json-schema-vuer
```

## Description
Vue component to visualize JSON schema in interactive view. Based on official JSON schema documentation: https://json-schema.org

## Project Dependencies
vue

## Example
```html
<JsonSchemaViewer schema='{"type":"object","properties":{"demo":{"type":"string"},"version":{"type":"integer","exclusiveMin":0,"max":100},"keywords":{"type":"array","items":{"type":"string"},"uniqueItems":true},"framework":{"const":"Vue"}},"additionalProperties":false,"required":["demo","version"]}'/>
```

