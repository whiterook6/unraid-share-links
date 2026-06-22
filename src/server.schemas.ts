export const schemas = {
  get: {
    schema: {
      params: {
        type: "object",
        properties: {
          key: {
            type: "string",
            minLength: 32, // 16 bytes = 32 hex characters
            maxLength: 32,
            pattern: "^[a-f0-9]{32}$",
          },
        },
        required: ["key"],
        additionalProperties: false,
      },
    },
  },
};
