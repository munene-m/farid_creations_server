import dotenv from "dotenv";

export default {
    log_level: process.env.LOG_LEVEL || "info",
    port: process.env.PORT || 8000,
    database_url: process.env.DATABASE_URL || "",
    jwt_secret: process.env.JWT_SECRET || "",
    bcrypt_salt: process.env.BCRYPT_SALT || "",
    email_from: process.env.EMAIL_FROM || "",
    email_password: process.env.EMAIL_PASSWORD || "",
    client_url: process.env.CLIENT_URL || "",
}