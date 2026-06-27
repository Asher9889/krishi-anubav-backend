import "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                phone: string;
                role: string;
            };
            validatedQuery?: any; 
            validatedParams?: any; 
        }
    }
}

export {};