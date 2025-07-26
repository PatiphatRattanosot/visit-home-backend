import Elysia from "elysia";
import AuthController from "../controllers/auth_controller";

export default (app:Elysia) => 
    app.group("/auth", (app) => app.use(AuthController.sign).use(AuthController.sign_out))