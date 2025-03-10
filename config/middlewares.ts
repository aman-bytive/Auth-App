export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: "strapi::body",
    config: {
      formLimit: "600mb",   // Form body limit
      jsonLimit: "600mb",   // JSON body limit
      textLimit: "600mb",   // Text body limit
      formidable: {
        maxFileSize: 600 * 1024 * 1024, // 500MB file upload limit
      },
    },
  },
];
