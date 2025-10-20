import { Router } from 'express';
import auth from '@middlewares/auth/authenticate';
import prescriptionController from '@controllers/client/prescription_controller';

const router = Router();

/**
 * @swagger
 * /client/prescription:
 *   get:
 *     summary: 获取所有处方
 *     description: 获取所有处方列表，支持按 patientId 和 docterId 筛选
 *     tags:
 *       - Prescription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 按患者ID筛选
 *       - in: query
 *         name: docterId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 按医生ID筛选
 *     responses:
 *       200:
 *         description: 成功返回处方列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prescription'
 *       401:
 *         description: 未授权
 *       422:
 *         description: 请求失败
 */
router.get('/', auth('jwt-user'), prescriptionController.getAll);

/**
 * @swagger
 * /client/prescription/{id}:
 *   get:
 *     summary: 获取单个处方
 *     description: 根据ID获取处方详情
 *     tags:
 *       - Prescription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 处方ID
 *     responses:
 *       200:
 *         description: 成功返回处方详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 content:
 *                   $ref: '#/components/schemas/Prescription'
 *       204:
 *         description: 处方不存在
 *       401:
 *         description: 未授权
 */
router.get('/:id', auth('jwt-user'), prescriptionController.getOne);

/**
 * @swagger
 * /client/prescription:
 *   post:
 *     summary: 创建处方
 *     description: 创建新的处方记录
 *     tags:
 *       - Prescription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePrescriptionRequest'
 *           example:
 *             patientId: "123e4567-e89b-12d3-a456-426614174001"
 *             docterId: "123e4567-e89b-12d3-a456-426614174002"
 *             content: "阿莫西林 500mg，一日三次，饭后服用"
 *     responses:
 *       201:
 *         description: 处方创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 content:
 *                   $ref: '#/components/schemas/Prescription'
 *       401:
 *         description: 未授权
 *       422:
 *         description: 缺少必填字段或创建失败
 */
router.post('/', auth('jwt-user'), prescriptionController.create);

/**
 * @swagger
 * /client/prescription/{id}:
 *   put:
 *     summary: 更新处方
 *     description: 更新指定ID的处方信息
 *     tags:
 *       - Prescription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 处方ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePrescriptionRequest'
 *           example:
 *             content: "更新后的处方内容"
 *     responses:
 *       200:
 *         description: 处方更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 content:
 *                   $ref: '#/components/schemas/Prescription'
 *       204:
 *         description: 处方不存在
 *       401:
 *         description: 未授权
 *       422:
 *         description: 更新失败
 */
router.put('/:id', auth('jwt-user'), prescriptionController.update);

/**
 * @swagger
 * /client/prescription/{id}:
 *   delete:
 *     summary: 删除处方
 *     description: 删除指定ID的处方
 *     tags:
 *       - Prescription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 处方ID
 *     responses:
 *       200:
 *         description: 处方删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 content:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Prescription deleted successfully"
 *       204:
 *         description: 处方不存在
 *       401:
 *         description: 未授权
 *       422:
 *         description: 删除失败
 */
router.delete('/:id', auth('jwt-user'), prescriptionController.remove);

/**
 * @swagger
 * /client/prescription/by-user/{userId}:
 *   get:
 *     summary: 根据用户ID获取处方列表
 *     description: 获取指定用户（患者）的所有处方记录
 *     tags:
 *       - Prescription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 用户ID（作为患者的ID）
 *     responses:
 *       200:
 *         description: 成功返回用户的处方列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prescription'
 *       401:
 *         description: 未授权
 *       422:
 *         description: 查询失败
 */
router.get('/by-user/:userId', auth('jwt-user'), prescriptionController.getPrescriptionByUser);

export default router;
