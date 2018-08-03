const joi = require('joi');

const patch = require('./patch.item');

module.exports.handler = patch.handler;

module.exports.validate = {
  payload: joi.object({
    test: joi
      .string()
      .strict()
      .required(),
    test1: joi
      .boolean()
      .strict()
      .optional(),
    test2: joi
      .number()
      .strict()
      .optional(),
  }),
  params: {
    id: joi
      .string()
      .strict()
      .lowercase()
      .length(24)
      .hex()
      .required(),
  },
  headers: joi
    .object({
      authorization: joi
        .string()
        .strict()
        .valid('a')
        .required(),
    })
    .options({ allowUnknown: true }),
};
