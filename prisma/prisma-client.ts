import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import path from 'path';

interface CustomNodeJsGlobal extends Global {
    prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

// 创建专门用于数据库查询的 logger
const dbLogger = winston.createLogger({
    transports: [
        // 控制台输出（仅开发环境）
        new winston.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} ${level}: ${message}`;
                }),
            ),
        }),
        // 文件输出（所有环境）
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'database.log'),
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json(),
            ),
        }),
    ],
});

// 配置 Prisma 日志选项
const prismaLogOptions = {
    log: [
        {
            emit: 'event' as const,
            level: 'query' as const,
        },
        {
            emit: 'event' as const,
            level: 'error' as const,
        },
        {
            emit: 'event' as const,
            level: 'warn' as const,
        },
        {
            emit: 'stdout' as const,
            level: 'info' as const,
        },
    ],
};

// 创建 Prisma Client 实例
const prisma = global.prisma || new PrismaClient(prismaLogOptions);

// 监听 SQL 查询日志
prisma.$on('query' as any, (e: any) => {
    const duration = e.duration;
    const query = e.query.replace(/\s+/g, ' ').trim();
    const params = e.params;
    
    // 根据查询耗时使用不同的日志级别
    if (duration > 1000) {
        // 超过1秒的慢查询 - 警告
        dbLogger.warn(
            `🐌 SLOW QUERY (${duration}ms) | SQL: ${query} | Params: ${params}`
        );
    } else if (duration > 500) {
        // 超过500ms的查询 - 提示
        dbLogger.info(
            `⚠️  Query (${duration}ms) | SQL: ${query} | Params: ${params}`
        );
    } else {
        // 正常查询
        dbLogger.info(
            `✅ Query (${duration}ms) | SQL: ${query} | Params: ${params}`
        );
    }
});

// 监听错误日志
prisma.$on('error' as any, (e: any) => {
    dbLogger.error(`❌ Prisma Error: ${JSON.stringify(e)}`);
});

// 监听警告日志
prisma.$on('warn' as any, (e: any) => {
    dbLogger.warn(`⚠️  Prisma Warning: ${e.message || JSON.stringify(e)}`);
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
