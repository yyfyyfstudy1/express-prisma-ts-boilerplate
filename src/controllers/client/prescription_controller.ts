import { Request, Response, NextFunction } from 'express';
import prescriptionService from '@services/client/prescription/prescription_service';
import logger from '@utils/logger/winston/logger';

// 获取所有处方
const getAll = (req: Request, res: Response, next: NextFunction) => {
    prescriptionService
        .getAll(req.query)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next */ {
            logger.error(`Get all prescriptions error: ${err.message}`);
            next(err);
        });
};

// 获取单个处方
const getOne = (req: Request, res: Response, next: NextFunction) => {
    prescriptionService
        .getOne(req.params.id)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next */ {
            logger.error(`Get prescription error: ${err.message}`);
            next(err);
        });
};

// 创建处方
const create = (req: Request, res: Response, next: NextFunction) => {
    prescriptionService
        .create(req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next */ {
            logger.error(`Create prescription error: ${err.message}`);
            next(err);
        });
};

// 更新处方
const update = (req: Request, res: Response, next: NextFunction) => {
    prescriptionService
        .update(req.params.id, req.body)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next */ {
            logger.error(`Update prescription error: ${err.message}`);
            next(err);
        });
};

// 删除处方
const remove = (req: Request, res: Response, next: NextFunction) => {
    prescriptionService
        .remove(req.params.id)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next */ {
            logger.error(`Delete prescription error: ${err.message}`);
            next(err);
        });
};

// 根据用户ID获取处方列表
const getPrescriptionByUser = (req: Request, res: Response, next: NextFunction) => {
    prescriptionService
        .getPrescriptionByUser(req.params.userId)
        .then((result: any) => res.status(result.httpStatusCode).json(result.data))
        .catch((err: any) => /* istanbul ignore next */ {
            logger.error(`Get prescriptions by user error: ${err.message}`);
            next(err);
        });
};

export default {
    getAll,
    getOne,
    create,
    update,
    remove,
    getPrescriptionByUser,
};
