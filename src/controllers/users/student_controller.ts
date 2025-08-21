
import { Elysia, t } from "elysia";
import StudentModel from "../../models/users/student_model";
// ฟังก์ชัน studentController สำหรับจัดการ Student
const create = (app: Elysia) =>
  app.post(
    "/",
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
        await student.save();
        set.status = 201;
        return { message: "เพิ่มข้อมูลนักเรียนสำเร็จ", student };
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
    "",
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
    "/:id",
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
const get_student_by_year_id = (app: Elysia) =>
  app.get(
    "/by_year/:year_id",
    async (ctx: { set: any; params: any; store: any }) => {
      try {
        const { params, set, store } = ctx;
        const email = store.user.email;

        const { year_id } = params;
        if (!year_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการปีการศึกษาเพื่อดึงนักเรียน" };
        }
        // ดึงนักเรียนตาม year_id
        const students = await StudentModel.find({
          email: email,
          "yearly_data.year": year_id,
        });

        if (students.length === 0) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: `ไม่พบนักเรียนสำหรับปีการศึกษา ${year_id}` };
        }

        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)

        return {
          message: `ดึงนักเรียนสำหรับปีการศึกษา ${year_id} สำเร็จ`,
          students,
        };
      } catch (error) {
        ctx.set.status = 500
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถดึงนักเรียนได้",
        };
      }
    },
    {
      params: t.Object({
        year_id: t.String(),
      }),
      detail: {
        tags: ["Student"],
        description: "ดึงนักเรียนตามปีการศึกษา",
      },
    }
  );


// อัพเดตข้อมูลหลักนักเรียน
const update_student_info = (app: Elysia) =>
  app.put(
    "/:id",
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
        set.status = 200;
        return { message: "แก้ไขข้อมูลนักเรียนสำเร็จ", student };
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
        description: "แก้ไขข้อมูลนักเรียนหลัก",
      },
    }
  );

// อัพเดตข้อมูลรายปีของนักเรียน
const update_yearly_data = (app: Elysia) =>
  app.put("/yearly",
    async ({ body, set }) => {
      try {
        const { _id: student_id, year_id } = body;
        if (!student_id || !year_id) {
          set.status = 400;
          return { message: "กรุณากรอกข้อมูลให้ครบถ้วน" };
        }
        const student = await StudentModel.findById(student_id);
        if (!student) {
          set.status = 404;
          return { message: "ไม่พบข้อมูลนักเรียน" };
        }

        // หา yearly_data ที่ตรงกับ year_id
        let yearly = student.yearly_data.find(
          (y: any) => y.year.toString() === year_id
        );

        if (!yearly) {
          yearly = {
            year: year_id,
            personal_info: body.personal_info ?? {},
            relation_info: body.relation_info ?? {},
            family_status_info: body.family_status_info ?? {},
            behavior_and_risk: body.behavior_and_risk ?? {},
          };
          student.yearly_data.push(yearly);
        } else {
          Object.assign(yearly, body);
        }

        await student.save();
        set.status = 200;
        return { message: "แก้ไขข้อมูลรายปีนักเรียนสำเร็จ", yearly };
      } catch (err) {
        set.status = 500;
        return {
          message:
            "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถแก้ไขข้อมูลรายปีนักเรียนได้",
        };
      }
    },
    {
      body: t.Object({
        _id: t.Optional(t.String()),
        year_id: t.Optional(t.String()),
        personal_info: t.Optional(t.Any()),
        relation_info: t.Optional(t.Any()),
        family_status_info: t.Optional(t.Any()),
        behavior_and_risk: t.Optional(t.Any()),
      }),
      detail: {
        tags: ["Student"],
        description: "แก้ไขข้อมูลรายปีของนักเรียน",
      },
    }
  );
// อัปเดตรูปโปรไฟล์นักเรียน (API แยก)
const update_student_profile = (app: Elysia) =>
  app.put(
    "/profile-image",
    async ({ body, set }) => {
      try {
        const { student_id } = body;
        if (!student_id) {
          set.status = 400;
          return { message: "กรุณากรอกข้อมูลไอดีนักเรียน" };
        }
        const student = await StudentModel.findById(student_id);
        if (!student) {
          set.status = 404;
          return { message: "ไม่พบข้อมูลนักเรียน" };
        }

        const file = body.file_image;
        if (!file) {
          set.status = 400;
          return { message: "กรุณาอัปโหลดไฟล์รูปภาพ" };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${file.name}_${Date.now()}`;
        const { uploadImageToFirebase } = await import("../../utils/uploadImageToFirebase");
        const imageUrl = await uploadImageToFirebase(buffer, fileName, file.type);
        if (!imageUrl) {
          set.status = 500;
          return { message: "ไม่สามารถอัปโหลดรูปภาพได้" };
        }
        student.image_url = imageUrl;
        await student.save();
        set.status = 200;
        return { message: "อัปเดตรูปโปรไฟล์สำเร็จ", image_url: imageUrl };
      } catch (err) {
        set.status = 500;
        return { message: "เซิฟเวอร์เกิดข้อผิดพลาด ไม่สามารถอัปเดตรูปโปรไฟล์ได้" };
      }
    },
    {
      body: t.Object({ file_image: t.File(), student_id: t.Optional(t.String()) }),
      detail: {
        tags: ["Student"],
        description: "อัปเดตรูปโปรไฟล์นักเรียน",
      },
    }
  );
const StudentController = {
  create,
  get_all,
  get_by_id,
  get_student_by_year_id,
  update_student_info,
  update_yearly_data,
  update_student_profile,
};

export default StudentController;
