import Elysia from "elysia";
import { verify_admin, verify_admin_or_teacher } from "../utils/verify-role";

import UserController from "../controllers/users/user_controller";
import TeacherController from "../controllers/users/teacher_controller";
import studentController from "../controllers/users/student_controller";

export default (app: Elysia) =>
  app.group("/users", (app) =>
    app
      .state("user", { email: "", roles: [] as string[] }) // เพิ่ม state สำหรับเก็บข้อมูลผู้ใช้
      // User routes
      // permissions: admin
      .group('', (app) =>
        app
          .onBeforeHandle(({ store, set }) => {
            const { roles } = store.user;
            const verification = verify_admin(roles);
            if (verification.type === false) {
              set.status = verification.status;
              return { message: verification.message };
            }
            return;
          })
          .use(UserController.get_users)
          .use(UserController.delete_user)
          .use(UserController.add_admin_role)
          .use(UserController.remove_admin_role)
      )
      // Teacher routes
      // permissions: admin, teacher
      .group("/teacher", (app) =>
        app
          .onBeforeHandle(({ store, set }) => {
            const { roles } = store.user;
            const verification = verify_admin_or_teacher(roles);
            if (verification.type === false) {
              set.status = verification.status;
              return { message: verification.message };
            }
            return;
          })
          .use(TeacherController.create_teacher)
          .use(TeacherController.get_teacher)
          .use(TeacherController.get_teacher_by_id)
          .use(TeacherController.update_teacher)
      )
      // Student routes
      // permissions: admin, teacher, student
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