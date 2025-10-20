import prisma from '../../../prisma/prisma-client';
import logger from '@utils/logger/winston/logger';

const msgError = 'Failed to operate prescription.';

// 查询所有（支持筛选和字段选择）
const findMany = (where: object = {}, select: object) => {
    const result = prisma.prescription
        .findMany({ select, where })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => /* istanbul ignore next */ {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};

// 查询单条
const findOne = (where: object, select: object) => {
    const result = prisma.prescription
        .findFirst({ where, select })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => /* istanbul ignore next */ {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};

// 创建
const create = (data: any) => {
    const result = prisma.prescription
        .create({ data })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => /* istanbul ignore next */ {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};

// 更新
const update = (where: object, data: any) => {
    const result = prisma.prescription
        .update({ where, data })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => /* istanbul ignore next */ {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};

// 删除
const remove = (where: object) => {
    const result = prisma.prescription
        .delete({ where })
        .then((res: any) => ({ success: true, data: res, error: null }))
        .catch((error: any) => /* istanbul ignore next */ {
            logger.error(`${msgError} ${error}`);
            return { success: false, data: null, error: msgError };
        });

    return result;
};

export default {
    findMany,
    findOne,
    create,
    update,
    remove,
};
