import Elysia from "elysia";
import ScheduleController from "../controllers/schedule_controller";
import { verify_admin_or_teacher } from "../utils/verify-role";

export default (app: Elysia) =>
    app.group("/schedule", (app) =>
        app
            .state("user", { email: "", roles: [] as string[] })
            // permissions: teacher
            .group('', (app) =>
                app
                    .onBeforeHandle(async ({ store, set }) => {
                        const verification = await verify_admin_or_teacher(store.user.roles);
                        if (verification.type === false) {
                            set.status = verification.status;
                            return { message: `คุณไม่ใช่ครูและไม่มีสิทธิ์เข้าถึง` };
                        }
                        return;
                    })
                    .use(ScheduleController.create_schedule)
                    .use(ScheduleController.update_schedule)
                    .use(ScheduleController.delete_schedule)
            )
            // permissions: teacher, student, admin 
            .use(ScheduleController.get_by_tc_stu_year)
    );