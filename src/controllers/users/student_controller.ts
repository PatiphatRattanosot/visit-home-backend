
import { Elysia, t } from "elysia";
import StudentModel from "../../models/users/student_model";
import { IStudent, IYearlyData } from "../../models/users/student_interface";
import { add_student_to_class } from "../class_controller";
// ฟังก์ชัน studentController สำหรับจัดการ Student
const create = (app: Elysia) =>
  app.post(
    "/create",
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

        if (class_id && student._id) {
          const res = await add_student_to_class(class_id, student._id.toString());
          if (res == true) {
            set.status = 201;
            return { message: "เพิ่มข้อมูลนักเรียนสำเร็จ", student };
          }
        }
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
// สร้างข้อมูลนักเรียนใหม่หลายคนพร้อมกัน (ใช้ในกรณีอัปโหลด CSV)
const create_many = (app: Elysia) =>
  app.post(
    "/create_many",
    async ({ body, set }) => {
      try {
        let existing_students: string[] = []
        let unable_to_create: string[] = []
        let added_students: string[] = []
        await Promise.all(body.map(async (student) => {
          const { first_name, last_name, prefix, user_id, class_id } = student;
          const existing_student = await StudentModel.findOne({ user_id });
          if (existing_student) {
            existing_students.push(`${prefix}${first_name} ${last_name}`);
            return;
          }

          const email = `${user_id}bp@bangpaeschool.ac.th`;
          const new_student = new StudentModel({
            first_name,
            last_name,
            prefix,
            user_id,
            email,
            role: ["Student"],
            class_id,
          });
          if (!new_student || !new_student._id) {
            unable_to_create.push(`${prefix}${first_name} ${last_name}`);
            return;
          }
          await new_student.save();
          add_student_to_class(class_id, new_student._id.toString());
          added_students.push(`${prefix}${first_name} ${last_name}`);
        }))
        if (existing_students.length > 0) {
          set.status = 400;
          return { message: "มีข้อมูลนักเรียนบางคนในระบบแล้ว", data: { existing_students, added_students } };
        }
        if (unable_to_create.length > 0) {
          set.status = 500;
          return { message: "เกิดข้อผิดพลาดบางอย่างไม่สามารถเพิ่มข้อมูลนักเรียนได้", data: { unable_to_create, added_students } };
        }
        set.status = 201;
        return { message: "เพิ่มข้อมูลนักเรียนทั้งหมดสำเร็จ", data: added_students };
      } catch (error) {
        set.status = 500;
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเพิ่มข้อมูลนักเรียนได้",
        };
      }
    }, {
    body: t.Array(t.Object({
      first_name: t.String(),
      last_name: t.String(),
      prefix: t.String(),
      user_id: t.String(),
      class_id: t.String(),
    }))
  });



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
      return { message: "ดึงข้อมูลนักเรียนสำเร็จ", student };
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
        }).populate("class_id", "room number");

        if (students.length === 0) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: `ไม่พบนักเรียนสำหรับปีการศึกษา ${year_id}` };
        }
        const filteredStudents = students.map(student => {
          const obj = student.toObject();
          obj.yearly_data = obj.yearly_data
            //เช็คว่าปีในฐานข้อมูลตรงกับปีที่ต้องการถึงจะส่งออก
            .filter((data: IYearlyData) => data.year.toString() === year_id)
          return obj;
        });
        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)

        return {
          message: `ดึงนักเรียนสำหรับปีการศึกษา ${year_id} สำเร็จ`,
          students: filteredStudents,
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
      const { first_name, last_name, prefix, user_id, class_id, phone } = body;
      try {
        const student = await StudentModel.findByIdAndUpdate(
          params.id,
          { first_name, last_name, prefix, user_id, class_id, phone },
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
        phone: t.String(),
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
        const { student_id, year_id } = body;
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
            relationship_info: body.relationship_info ?? {},
            family_info: body.family_info ?? {},
            behavior_info: body.behavior_info ?? {},
            risk_info: body.risk_info ?? {},
            additional_info: body.additional_info ?? {},
            isCompleted: body.isCompleted,
          };
          student.yearly_data.push(yearly);
        } else {
          yearly.isCompleted = body.isCompleted;
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
        student_id: t.Optional(t.String()),
        year_id: t.Optional(t.String()),
        isCompleted: t.String({ enum: ["Completed", "Incomplete", "Edit"] }),
        personal_info: t.Optional(t.Any()),
        relationship_info: t.Optional(t.Any()),
        family_info: t.Optional(t.Any()),
        behavior_info: t.Optional(t.Any()),
        risk_info: t.Optional(t.Any()),
        additional_info: t.Optional(t.Any()),
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


        const { uploadImage } = await import("../../utils/uploadImageToFirebase");
        const imageUrl = await uploadImage(file);
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

export const auto_create_student = async (class_id: string, new_year: string) => {
  const old_students = await StudentModel.find({ class_id: class_id });

  if (old_students.length <= 0) {
    return { type: false }
  }
  let new_students: any[] = []
  await Promise.all(
    old_students.map(async (old_student) => {
      const res = await auto_update_for_student(old_student, new_year) as any;

      if (res?.type === true) new_students.push({ _id: res.student_id })
    })
  );
  return { type: true, new_students }
}

const auto_update_for_student = async (old_student: IStudent, new_year: string) => {
  try {
    const existing_student = await StudentModel.findOne({ user_id: old_student.user_id, "yearly_data.year": new_year });
    if (existing_student) {
      return { type: false }
    }

    const old_personal_info = old_student.yearly_data.find((y) => y.year.toString() === old_student.yearly_data[old_student.yearly_data.length - 1].year.toString())?.personal_info || {}

    const new_yearly_data = {
      year: new_year,
      personal_info: old_personal_info
    } as IYearlyData
    const update_student = await StudentModel.findByIdAndUpdate({ _id: old_student._id })
    update_student?.yearly_data.push(new_yearly_data)

    await update_student?.save()
    return { message: "เพิ่มข้อมูลนักเรียนสำเร็จ", status: 201, type: true, student_id: update_student?._id }
  } catch (error) {
    return { type: false }
  }
}


const StudentController = {
  create,
  create_many,
  get_all,
  get_by_id,
  get_student_by_year_id,
  update_student_info,
  update_yearly_data,
  update_student_profile,
};

export default StudentController;
