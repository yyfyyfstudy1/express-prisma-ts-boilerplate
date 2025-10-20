import { Router } from 'express';

import auth from '@middlewares/auth/authenticate';
import ctrlUserAuth from '@controllers/client/users_auth_controller';

import { register, login, forgotPasswordRequest, registerConfirmation } from '@schemas/auth_schema';
import { validate } from '@middlewares/validate_schema/validade_schema';

const router = Router();

/**
 * @swagger
 * /client/auth/register:
 *   post:
 *     summary: 用户注册
 *     description: 创建新用户账号
 *     tags:
 *       - User Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "user@example.com"
 *             name: "张三"
 *             phone: "13800138000"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: 注册成功
 *       422:
 *         description: 验证失败或邮箱已存在
 */
router.post('/register', validate(register), ctrlUserAuth.register);

/**
 * @swagger
 * /client/auth/register/confirmation:
 *   get:
 *     summary: 注册确认
 *     description: 通过邮件链接确认注册
 *     tags:
 *       - User Auth
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: 注册邮箱
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 确认令牌
 *     responses:
 *       200:
 *         description: 确认成功
 *       422:
 *         description: 确认失败
 */
router.get('/register/confirmation', validate(registerConfirmation), ctrlUserAuth.registerConfirm);

/**
 * @swagger
 * /client/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 使用邮箱和密码登录
 *     tags:
 *       - User Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: 邮箱或密码错误
 *       422:
 *         description: 验证失败
 */
router.post('/login', validate(login), auth('login-user'), ctrlUserAuth.login);

/**
 * @swagger
 * /client/auth/logout:
 *   get:
 *     summary: 用户登出
 *     description: 退出登录
 *     tags:
 *       - User Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *       401:
 *         description: 未授权
 */
router.get('/logout', auth('jwt-user'), ctrlUserAuth.logout);

/**
 * @swagger
 * /client/auth/forgotpassword/request:
 *   post:
 *     summary: 忘记密码请求
 *     description: 发送重置密码邮件
 *     tags:
 *       - User Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       200:
 *         description: 重置邮件已发送
 *       422:
 *         description: 邮箱不存在
 */
router.post(
    '/forgotpassword/request',
    validate(forgotPasswordRequest),
    ctrlUserAuth.forgotPasswordRequest,
);

/**
 * @swagger
 * /client/auth/forgotpassword/reset:
 *   post:
 *     summary: 重置密码
 *     description: 使用令牌重置密码
 *     tags:
 *       - User Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *           example:
 *             email: "user@example.com"
 *             token: "reset-token-here"
 *             newPassword: "newPassword123"
 *     responses:
 *       200:
 *         description: 密码重置成功
 *       422:
 *         description: 令牌无效或已过期
 */
router.post('/forgotpassword/reset', ctrlUserAuth.forgotPasswordReset);

export default router;
