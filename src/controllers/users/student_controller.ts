import { Elysia, t } from "elysia";
import StudentModel from "../../models/users/student_model";

// ฟังก์ชัน studentController สำหรับจัดการ Student
const create = (app: Elysia) =>
  app.post(
    "/students",
    async ({ body, set }) => {
      const { first_name, last_name, prefix, user_id, class_id } = body;
      try {
        // ตรวจสอบว่ามี user_id หรือไม่
        if (!user_id) {
          set.status = 400;
          return { message: "กรุณากรอกข้อมูลรหัสประจำตัวนักเรียน" };
        }
        const email = `${user_id}bp@bangpaeschool.ac.th`;
        // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
        if (!first_name || !last_name || !prefix || !class_id) {
          set.status = 400;
          return { message: "กรุณากรอกข้อมูลให้ครบถ้วน" };
        }
        // ตรวจสอบว่ามี student_id ซ้ำหรือไม่
        const existing_student = await StudentModel.findOne({ user_id });
        if (existing_student) {
          set.status = 400;
          return { message: "มีข้อมูลนักเรียนนี้ในระบบแล้ว" };
        }
        // สร้างข้อมูลนักเรียนใหม่
        const student = new StudentModel({
          first_name,
          last_name,
          prefix,
          user_id,
          email,
          role: ["Student"],
          class_id,
        });
        // await student.save();
        set.status = 201;
        return {message: "เพิ่มข้อมูลนักเรียนสำเร็จ", student  };
      } catch (err) {
        set.status = 500;
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเพิ่มข้อมูลนักเรียนได้",
        };
      }
    },
    {
      body: t.Object({
        first_name: t.String(),
        last_name: t.String(),
        prefix: t.String(),
        user_id: t.String(),
        class_id: t.String(),
      }),
      detail: {
        tags: ["Student"],
        description: "สร้างข้อมูลนักเรียน",
      },
    }
  );

const get_all = (app: Elysia) =>
  app.get(
    "/students",
    async () => {
      return await StudentModel.find();
    },
    {
      detail: {
        tags: ["Student"],
        description: "ดึงข้อมูลนักเรียนทั้งหมด",
      },
    }
  );

const get_by_id = (app: Elysia) =>
  app.get(
    "/students/:id",
    async ({ params, set }) => {
      const student = await StudentModel.findById(params.id);
      if (!student) {
        set.status = 404;
        return { error: "Student not found" };
      }
      return student;
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Student"],
        description: "ดึงข้อมูลนักเรียนตาม id",
      },
    }
  );

  const update = (app: Elysia) =>
  app.put(
    "/students/:id",
    async ({ params, body, set }) => {
      const { first_name, last_name, prefix, user_id, class_id } = body;
      try {
        const student = await StudentModel.findByIdAndUpdate(
          params.id,
          { first_name, last_name, prefix, user_id, class_id },
          { new: true }
        );
        if (!student) {
          set.status = 404;
          return { message: "ไม่พบข้อมูลนักเรียนที่ต้องการแก้ไข" };
        }
        return student;
      } catch (err) {
        set.status = 500;
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถแก้ไขข้อมูลนักเรียนได้",
        };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        first_name: t.String(),
        last_name: t.String(),
        prefix: t.String(),
        user_id: t.String(),
        class_id: t.String(),
      }),
      detail: {
        tags: ["Student"],
        description: "แก้ไขข้อมูลนักเรียนตาม id",
      },
    }
  );


const StudentController = {
  create,
  get_all,
  get_by_id,
  update,
  
};

export default StudentController;
