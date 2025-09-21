import Elysia from "elysia";
import VisitInfoController from "../controllers/visit_info_controller";
import { verify_admin_or_teacher } from "../utils/verify-role";

export default (app: Elysia) =>
    app.group("/visit-info", (app) =>
        app
            .state("user", { email: "", roles: [] as string[] })
            // permissions: admin, teacher
            .group('', (app) =>
                app
                    .onBeforeHandle(({ store, set }) => { 
                        const verification = verify_admin_or_teacher(store.user.roles);
                        if (verification.type === false) {
                            set.status = verification.status;
                            return { message: verification.message };
                        }
                        return;
                    })
                    .use(VisitInfoController.create_visit_info)
                    .use(VisitInfoController.get_visit_info_by_id)
                    .use(VisitInfoController.get_visit_info_student_by_year_id)
                    .use(VisitInfoController.update_visit_info)
                    .use(VisitInfoController.delete_visit_info)
            )

    )

