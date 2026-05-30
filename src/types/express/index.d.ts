import "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                phone: string;
                role: string;
            };
        }
    }
}

export {};