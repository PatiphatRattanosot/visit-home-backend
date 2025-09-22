import Elysia from "elysia";
import ClassController from "../controllers/class_controller";
import { verify_admin_or_teacher, verify_admin } from "../utils/verify-role";

export default (app: Elysia) =>
    app.group("/class", (app) =>
        app
            .state("user", { email: "", roles: [] as string[] })
            // permissions: admin   
            .group('', (app) =>
                app
                    .onBeforeHandle(({ store, set }) => {
                        const verification = verify_admin(store.user.roles);
                        if (verification.type === false) {
                            set.status = verification.status;
                            return { message: verification.message };
                        }
                        return;
                    })
                    .use(ClassController.create_class)
                    .use(ClassController.update_class)
                    .use(ClassController.delete_class)
            )
            // permissions: teacher, admin   
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
                    .use(ClassController.get_classes_by_year)
                    .use(ClassController.get_class_by_teacher_id)
                    .use(ClassController.get_class_by_id)
            )

    )