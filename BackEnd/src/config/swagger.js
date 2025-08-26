const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZuneF API Documentation',
      version: '1.0.0',
      description: 'API documentation for ZuneF Server',
      contact: {
        name: 'API Support',
        email: 'support@zunef.com'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              description: 'User password (hashed)'
            },
            token: {
              type: 'string',
              description: 'Verification token'
            },
            isVerified: {
              type: 'boolean',
              default: false,
              description: 'Email verification status'
            },
            role: {
              type: 'string',
              default: 'user',
              description: 'User role'
            },
            ownership: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'User ownership list'
            }
          }
        },
        Account: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            _id: {
              type: 'string',
              description: 'Account ID'
            },
            name: {
              type: 'string',
              description: 'Account name'
            },
            price: {
              type: 'number',
              description: 'Account price'
            },
            Discount: {
              type: 'number',
              default: 0,
              description: 'Discount percentage'
            },
            stock: {
              type: 'number',
              default: 0,
              description: 'Available stock'
            },
            category: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Account categories'
            },
            thumbnail: {
              type: 'string',
              description: 'Thumbnail image file ID'
            },
            imagepreview: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Preview images file IDs'
            },
            videopreview: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Preview videos file IDs'
            },
            policy: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Account policies'
            },
            description: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Account description'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Account'
              },
              description: 'Array of accounts'
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Current page'
                },
                limit: {
                  type: 'number',
                  description: 'Items per page'
                },
                total: {
                  type: 'number',
                  description: 'Total items'
                },
                totalPages: {
                  type: 'number',
                  description: 'Total pages'
                }
              }
            }
          }
        },
        File: {
          type: 'object',
          properties: {
            fileId: {
              type: 'string',
              description: 'File ID'
            },
            filename: {
              type: 'string',
              description: 'Generated filename'
            },
            originalName: {
              type: 'string',
              description: 'Original filename'
            },
            mimetype: {
              type: 'string',
              description: 'File MIME type'
            },
            size: {
              type: 'number',
              description: 'File size in bytes'
            },
            uploadDate: {
              type: 'string',
              format: 'date-time',
              description: 'Upload timestamp'
            },
            url: {
              type: 'string',
              description: 'File access URL'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs
};