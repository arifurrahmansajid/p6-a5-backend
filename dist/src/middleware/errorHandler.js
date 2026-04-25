"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: "Validation error",
            errors: err.issues.map((issue) => issue.message),
        });
    }
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(500).json({ message });
}
