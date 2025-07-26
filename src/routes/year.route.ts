import Elysia from "elysia";
import YearController from "../controllers/year_controller";

export default (app:Elysia) =>
    app.group("/year", (app) =>
        app
          .use(YearController.create_year)
          .use(YearController.auto_create_year)
          .use(YearController.get_years)
          .use(YearController.get_year_by_id)
          .use(YearController.update_year)
          .use(YearController.delete_year)
      )