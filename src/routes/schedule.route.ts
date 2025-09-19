import Elysia from "elysia";
import ScheduleController from "../controllers/schedule_controller";

export default (app: Elysia) =>
    app.group("/schedule", (app) =>
        app
            .use(ScheduleController.create_schedule)
            .use(ScheduleController.get_by_tc_stu_year)
            .use(ScheduleController.update_schedule)
            .use(ScheduleController.delete_schedule)
    );