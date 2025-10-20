import { Router } from 'express';

import auth from '@middlewares/auth/authenticate';
import ctrlUserMe from '@controllers/client/users_me_controller';

const router = Router();

/**
 * @swagger
 * /client/user/me:
 *   get:
 *     summary: 获取当前用户信息
 *     description: 获取当前登录用户的个人信息
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回用户信息
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权
 */
router.get('/', auth('jwt-user'), ctrlUserMe.showMe);

/**
 * @swagger
 * /client/user/me:
 *   patch:
 *     summary: 更新当前用户信息
 *     description: 更新当前登录用户的个人信息
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           example:
 *             name: "李四"
 *             phone: "13900139000"
 *             avatar: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权
 *       422:
 *         description: 更新失败
 */
router.patch('/', auth('jwt-user'), ctrlUserMe.updateMe);

/**
 * @swagger
 * /client/user/me:
 *   delete:
 *     summary: 删除当前用户
 *     description: 删除当前登录用户的账号（软删除）
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                   example: User deleted successfully
 *       401:
 *         description: 未授权
 *       422:
 *         description: 删除失败
 */
router.delete('/', auth('jwt-user'), ctrlUserMe.deleteMe);

export default router;
