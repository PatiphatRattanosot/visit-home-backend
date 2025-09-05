import Elysia from "elysia";
import VisitInfoController from "../controllers/visit_info_controller";

export default (app:Elysia) => 
    app.group("/visit-info", (app) =>
        app
            .use(VisitInfoController.create_visit_info)
            .use(VisitInfoController.get_visit_info_by_id)
            .use(VisitInfoController.get_visit_info_student_by_year_id)
            .use(VisitInfoController.update_visit_info)
            .use(VisitInfoController.delete_visit_info)
    )

