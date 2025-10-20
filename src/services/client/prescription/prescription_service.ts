import httpMsg from '@utils/http_messages/http_msg';
import prescriptionDao from '@dao/prescription/prescription_dao';
import getOneUser from '@dao/users/user_get_one_dao';

const errCode = 'ERROR_PRESCRIPTION';

// 查询所有处方（支持分页和筛选）
const getAll = async (query: any) => {
    const where: any = {};

    // 支持按 patientId 筛选
    if (query.patientId) {
        where.patientId = query.patientId;
    }

    // 支持按 docterId 筛选
    if (query.docterId) {
        where.docterId = query.docterId;
    }

    const select = {
        Id: true,
        patientId: true,
        docterId: true,
        content: true,
        creat_time: true,
        update_time: true,
    };

    const result = await prescriptionDao.findMany(where, select);

    if (!result.success) {
        return httpMsg.http422('Failed to get prescriptions', errCode);
    }

    return httpMsg.http200(result.data);
};

// 查询单个处方
const getOne = async (id: string) => {
    if (!id) {
        return httpMsg.http422('Prescription ID is required', errCode);
    }

    const where = { Id: id };
    const select = {
        Id: true,
        patientId: true,
        docterId: true,
        content: true,
        creat_time: true,
        update_time: true,
    };

    const result = await prescriptionDao.findOne(where, select);

    if (!result.success || !result.data) {
        return httpMsg.http404('Prescription not found');
    }

    return httpMsg.http200(result.data);
};

// 创建处方
const create = async (data: any) => {
    // 验证必填字段
    if (!data.patientId || !data.docterId || !data.content) {
        return httpMsg.http422('Missing required fields: patientId, docterId, content', errCode);
    }
    // check paientID and docterID exist
    const patient = await getOneUser({ id: data.patientId }, { id: true });
    const docter = await getOneUser({ id: data.docterId }, { id: true });
    if (patient.data === null || docter.data === null) {
        return httpMsg.http422('Patient or docter not found', errCode);
    }

    const prescriptionData = {
        Id: generateUUID(), // 生成 UUID
        patientId: data.patientId,
        docterId: data.docterId,
        content: data.content,
        creat_time: new Date(),
        update_time: new Date(),
    };

    const result = await prescriptionDao.create(prescriptionData);

    if (!result.success) {
        return httpMsg.http422('Failed to create prescription', errCode);
    }

    return httpMsg.http201(result.data);
};

// 更新处方
const update = async (id: string, data: any) => {
    if (!id) {
        return httpMsg.http422('Prescription ID is required', errCode);
    }

    // 检查处方是否存在
    const existingPrescription = await prescriptionDao.findOne(
        { Id: id },
        { Id: true }
    );

    if (!existingPrescription.success || !existingPrescription.data) {
        return httpMsg.http404('Prescription not found');
    }

    const updateData: any = {
        update_time: new Date(),
    };

    if (data.content) updateData.content = data.content;
    if (data.patientId) updateData.patientId = data.patientId;
    if (data.docterId) updateData.docterId = data.docterId;

    const result = await prescriptionDao.update({ Id: id }, updateData);

    if (!result.success) {
        return httpMsg.http422('Failed to update prescription', errCode);
    }

    return httpMsg.http200(result.data);
};

// 删除处方
const remove = async (id: string) => {
    if (!id) {
        return httpMsg.http422('Prescription ID is required', errCode);
    }

    // 检查处方是否存在
    const existingPrescription = await prescriptionDao.findOne(
        { Id: id },
        { Id: true }
    );

    if (!existingPrescription.success || !existingPrescription.data) {
        return httpMsg.http404('Prescription not found');
    }

    const result = await prescriptionDao.remove({ Id: id });

    if (!result.success) {
        return httpMsg.http422('Failed to delete prescription', errCode);
    }

    return httpMsg.http200({ message: 'Prescription deleted successfully' });
};


const getPrescriptionByUser = async (id:string)=>{
    if (!id) {
        return httpMsg.http422('UserID no', '1111');
    }

    // 查看用户是否存在
    const patient = await getOneUser({ id: id }, { id: true });

    if (patient.data === null) {
        return httpMsg.http422('xxx', '1111');
    }

    // 根据用户ID查找处方
    const where = { patientId: id };
    const select = {
        Id: true,
        patientId: true,
        docterId: true,
        content: true,
        creat_time: true,
        update_time: true,
    };

    const prescriptionList = await prescriptionDao.findMany(where, select);

    if (!prescriptionList.success) {
        return httpMsg.http422('Failed to get user prescriptions', errCode);
    }

    return httpMsg.http200(prescriptionList.data);
};

// 简单的 UUID 生成函数
const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
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
