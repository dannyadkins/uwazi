import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import model from 'api/templates/templatesModel';
import { objectIdSchema, propertySchema } from 'api/utils/jsonSchemas';

const ajv = ajvKeywords(Ajv({ allErrors: true }), ['uniqueItemProperties']);

ajv.addKeyword('uniqueName', {
  async: true,
  errors: false,
  type: 'object',
  async validate(schema, data) {
    if (!schema) {
      return true;
    }
    const regex = new RegExp(`^${data.name}$`, 'i');
    const [similarTemplate] = await model.get({ _id: { $ne: data._id }, name: regex });
    if (similarTemplate) {
      return false;
    }
    return true;
  }
});

ajv.addKeyword('requireTitleProperty', {
  errors: false,
  type: 'array',
  validate(schema, properties) {
    return properties.some(prop => prop.name === 'title');
  }
});

ajv.addKeyword('uniquePropertyFields', {
  errors: false,
  type: 'object',
  validate(fields, data) {
    if (!fields.length) {
      return true;
    }
    const uniqueValues = fields.reduce((memo, field) => ({ ...memo, [field]: new Set() }), {});
    const properties = data.properties || [];
    const commonProperties = data.commonProperties || [];
    const allProperties = properties.concat(commonProperties);
    for (let propIndex = 0; propIndex < allProperties.length; propIndex += 1) {
      for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
        const property = allProperties[propIndex];
        const field = fields[fieldIndex];
        const value = property[field] && property[field].toLowerCase().trim();
        if (value && uniqueValues[field].has(value)) {
          return false;
        }
        uniqueValues[field].add(value);
      }
    }
    return true;
  }
});

ajv.addKeyword('requireContentForSelectFields', {
  errors: false,
  type: 'object',
  validate(schema, data) {
    if (!schema) {
      return true;
    }
    if (['multiselect', 'select'].includes(data.type)) {
      return !!(data.content && data.content.length);
    }

    return true;
  }
});

ajv.addKeyword('requireRelationTypeForRelationship', {
  errors: false,
  type: 'object',
  validate(schema, data) {
    if (!schema) {
      return true;
    }
    if (data.type === 'relationship') {
      return !!(data.relationType && data.relationType.length);
    }
    return true;
  }
});

ajv.addKeyword('requireInheritPropertyForInheritingRelationship', {
  errors: false,
  type: 'object',
  validate(schema, data) {
    if (!schema) {
      return true;
    }
    if (data.type === 'relationship' && data.inherit) {
      return !!data.inheritProperty;
    }
    return true;
  }
});

const schema = {
  $schema: 'http://json-schema.org/schema#',
  $async: true,
  type: 'object',
  uniqueName: true,
  required: ['name', 'commonProperties'],
  uniquePropertyFields: ['id', 'name', 'label', 'relationType'],
  properties: {
    _id: objectIdSchema,
    name: { type: 'string', minLength: 1 },
    color: { type: 'string', default: '' },
    default: { type: 'boolean', default: false },
    commonProperties: {
      type: 'array',
      requireTitleProperty: true,
      minItems: 1,
      items: propertySchema
    },
    properties: {
      type: 'array',
      items: propertySchema
    }
  }
};

const validateTemplate = ajv.compile(schema);

export {
  validateTemplate
};
