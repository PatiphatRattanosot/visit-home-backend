import Elysia from "elysia";
import YearController from "../controllers/year_controller";
import { verify_admin } from "../utils/verify-role";

export default (app: Elysia) =>
    app.group("/year", (app) =>
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
                    .use(YearController.create_year)
                    .use(YearController.auto_create_year)
                    .use(YearController.update_year)
                    .use(YearController.update_appointment_time)
                    .use(YearController.delete_year)
            )
            // permissions: admin, teacher, student
            .use(YearController.get_year_by_name)
            .use(YearController.get_years)

    )