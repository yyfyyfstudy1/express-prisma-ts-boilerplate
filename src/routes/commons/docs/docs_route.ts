import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import pkg from '@packagejson';
import swaggerSpec from '@utils/swagger/swagger-jsdoc-config';

const router = Router();

const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `Doc ${pkg.name}`,
    customfavIcon: '/assets/images/favicons/favicon.ico',
};

// Swagger UI with JSDoc
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, options));

export default router;
