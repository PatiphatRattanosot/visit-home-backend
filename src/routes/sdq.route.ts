import Elysia from "elysia";
import SDQController from "../controllers/sdq_controller";
import { verify_admin_or_teacher } from "../utils/verify-role";
export default (app: Elysia) =>
    app.group("/sdq", (app) =>
        app
            .state("user", { email: "", roles: [] as string[] })
            .group('', (app) =>
                app
                    .onBeforeHandle(({ store, set }) => {
                        const verification = verify_admin_or_teacher(store.user.roles);
                        if (verification.type === false) {
                            set.status = verification.status;
                            return { message: verification.message };
                        }
                     })
                    .use(SDQController.delete_sdq)
            )
            // permissions: admin, teacher, student
            .use(SDQController.create_sdq)
            .use(SDQController.get_sdq_by_student_year_and_assessor))