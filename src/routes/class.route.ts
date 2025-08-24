import Elysia from "elysia";
import ClassController from "../controllers/class_controller";

export default (app:Elysia) => 
    app.group("/class", (app) =>
        app
          .use(ClassController.create_class)
          .use(ClassController.get_classes_by_year)
          .use(ClassController.get_class_by_id)
          .use(ClassController.update_class)
          .use(ClassController.delete_class)
      )