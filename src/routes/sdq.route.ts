import Elysia from "elysia";
import SDQController from "../controllers/sdq_controller";
export default (app: Elysia) =>
    app.group("/sdq", (app) =>
        app
            .use(SDQController.create_sdq)
            .use(SDQController.get_sdq_by_student_year_and_assessor)
            .use(SDQController.delete_sdq)
    )