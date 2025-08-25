import Elysia from "elysia";
import SDQController from "../controllers/sdq_controller";
export default (app: Elysia) =>
    app.group("/sdq", (app) =>
        app
            .use(SDQController.create_sdq)
            .use(SDQController.get_sdq_by_student_and_year)
            .use(SDQController.update_sdq)
            .use(SDQController.delete_sdq)
    )