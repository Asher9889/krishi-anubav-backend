import "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                phone: string;
                role: string;
            };
            validatedQuery?: any; // You can replace 'any' with a more specific type if you have one
        }
    }
}

export {};