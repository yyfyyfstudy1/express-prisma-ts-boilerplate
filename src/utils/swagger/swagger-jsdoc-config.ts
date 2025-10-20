import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import apiUri from '@utils/global_api_path/global_api_path';
import { name, version, description, author, license } from '@packagejson';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: name,
            version: version,
            description: description,
            license: {
                name: license,
                url: author.url,
            },
            contact: {
                name: author.name,
                email: author.email,
            },
        },
        servers: [
            {
                url: `${apiUri()}/`,
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                            example: 'ERROR_CODE',
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'Success',
                        },
                        content: {
                            type: 'object',
                        },
                    },
                },
                Prescription: {
                    type: 'object',
                    properties: {
                        Id: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000',
                        },
                        patientId: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174001',
                        },
                        docterId: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174002',
                        },
                        content: {
                            type: 'string',
                            example: '阿莫西林 500mg，一日三次，饭后服用',
                        },
                        creat_time: {
                            type: 'string',
                            format: 'date-time',
                        },
                        update_time: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                CreatePrescriptionRequest: {
                    type: 'object',
                    required: ['patientId', 'docterId', 'content'],
                    properties: {
                        patientId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Patient UUID',
                        },
                        docterId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Doctor UUID',
                        },
                        content: {
                            type: 'string',
                            description: 'Prescription content',
                        },
                    },
                },
                UpdatePrescriptionRequest: {
                    type: 'object',
                    properties: {
                        patientId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        docterId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        content: {
                            type: 'string',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        name: {
                            type: 'string',
                        },
                        phone: {
                            type: 'string',
                        },
                        avatar: {
                            type: 'string',
                            nullable: true,
                        },
                        accountType: {
                            type: 'string',
                            example: 'free',
                        },
                        isRegistered: {
                            type: 'boolean',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'name', 'phone', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: '邮箱地址',
                        },
                        name: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 32,
                            description: '用户名',
                        },
                        phone: {
                            type: 'string',
                            minLength: 11,
                            maxLength: 15,
                            description: '手机号',
                        },
                        password: {
                            type: 'string',
                            minLength: 4,
                            maxLength: 16,
                            description: '密码',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: '邮箱地址',
                        },
                        password: {
                            type: 'string',
                            description: '密码',
                        },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'Success',
                        },
                        content: {
                            type: 'object',
                            properties: {
                                email: {
                                    type: 'string',
                                },
                                name: {
                                    type: 'string',
                                },
                                token: {
                                    type: 'string',
                                    description: 'JWT Token',
                                },
                            },
                        },
                    },
                },
                ForgotPasswordRequest: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: '注册的邮箱地址',
                        },
                    },
                },
                UpdateUserRequest: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                        },
                        phone: {
                            type: 'string',
                        },
                        avatar: {
                            type: 'string',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // 扫描路由文件中的 JSDoc 注释
    apis: [
        path.join(__dirname, '../../routes/**/*.ts'),
        path.join(__dirname, '../../routes/**/*.js'),
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

