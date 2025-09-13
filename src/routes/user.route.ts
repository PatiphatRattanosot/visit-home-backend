import Elysia from "elysia";


import UserController from "../controllers/users/user_controller";
import TeacherController from "../controllers/users/teacher_controller";
import studentController from "../controllers/users/student_controller";

export default (app:Elysia) =>
    app.group("/users", (app) =>
        app
          // User
          .use(UserController.get_users)
          .use(UserController.delete_user)
          .use(UserController.add_admin_role)
          .use(UserController.remove_admin_role)
          // Teacher
          .group("/teacher", (app) =>
            app
              .use(TeacherController.create_teacher)
              .use(TeacherController.get_teacher)
              .use(TeacherController.get_teacher_by_id)
              .use(TeacherController.update_teacher)
          )
          // Student
          .group("/student", (app) => 
            app
          
              .use(studentController.get_all)
              .use(studentController.create)
              .use(studentController.create_many)
              .use(studentController.get_by_id)
              .use(studentController.get_student_by_year_id)
              .use(studentController.update_student_info)
              .use(studentController.update_yearly_data)
              .use(studentController.update_student_profile)
            )
      )