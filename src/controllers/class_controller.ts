import { Elysia, t } from "elysia";
import ClassModel, { IClass } from "../models/class_model";

const create_class = async (app: Elysia) =>
  app.post(
    "/",
    async ({ body, set }) => {
      try {
        const { room, number, year_id, teacher_id } = body;

        // ตรวจสอบว่ามี year_id หรือไม่
        if (!year_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการปีการศึกษาที่เพิ่มชั้นปี" };
        }
        // ตรวจสอบว่ามี ห้องและหมายเลขชั้นปี
        if (!room || !number) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการห้องและหมายเลขชั้นปี" };
        }

        // ตรวจสอบว่ามีชั้นปีนี้อยู่แล้วหรือไม่
        const existing_class = await ClassModel.findOne({
          room,
          number,
          year_id,
        });
        if (existing_class) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: `ชั้นปี ${room} ห้องที่ ${number} มีอยู่แล้ว` };
        }
        const new_class = new ClassModel({
          room,
          number,
          year_id,
          teacher_id,
        });
        await new_class.save();
        set.status = 201; // ตั้งค่า HTTP status เป็น 201 (Created)
        return { message: `สร้างชั้นปี ${room} ห้องที่ ${number} สำเร็จ` };
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเพิ่มชั้นปีได้",
        };
      }
    },
    {
      body: t.Object({
        room: t.Number(),
        number: t.Number(),
        year_id: t.String(),
        teacher_id: t.String(),
      }),
      detail: {
        tags: ["Class"],
        description: "สร้างชั้นปีการศึกษา",
      },
    }
  );

// ดึง class ตามปีการศึกษา
const get_classes_by_year = async (app: Elysia) =>
  app.get(
    "/by_year/:year_id",
    async ({ params, set }) => {
      try {
        const { year_id } = params;
        if (!year_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการปีการศึกษาเพื่อดึงชั้นปี" };
        }
        // ดึงชั้นปีตาม year_id
        const classes = await ClassModel.find({ year_id }, { year_id: 0 });
        if (classes.length === 0) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: `ไม่พบชั้นปีสำหรับปีการศึกษา ${year_id}` };
        }

        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
        return {
          message: `ดึงชั้นปีสำหรับปีการศึกษา ${year_id} สำเร็จ`,
          classes,
        };
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถดึงชั้นปีได้",
        };
      }
    },
    {
      params: t.Object({
        year_id: t.String(),
      }),
      detail: {
        tags: ["Class"],
        description: "ดึงชั้นปีตามปีการศึกษา",
      },
    }
  );

//   ดึงชั้นปีโดยใช้ class_id
const get_class_by_id = async (app: Elysia) =>
  app.get(
    "/by_id/:class_id",
    async ({ params, set }) => {
      try {
        const { class_id } = params;
        // ดึงชั้นปีตาม class_id
        const class_data = await ClassModel.findById(class_id, {
          year_id: 0,
        }).populate("teacher_id", "first_name last_name")
          .populate("students");
        if (!class_data) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: `ไม่พบชั้นปีสำหรับ ID ${class_id}` };
        }
        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
        return {
          message: `ชั้นปี ${class_data.room} ห้องที่ ${class_data.number} สำเร็จ`,
          class: class_data,
        };
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถดึงชั้นปีได้",
        };
      }
    },
    {
      params: t.Object({
        class_id: t.String(),
      }),
      detail: {
        tags: ["Class"],
        description: "ดึงชั้นปีตาม ID",
      },
    }
  );

const get_class_by_teacher_id = async (app: Elysia) =>
  app.get(
    "/by_teacher/:teacher_id",
    async ({ params, set }) => {
      try {
        const { teacher_id } = params;
        // ตรวจสอบว่ามี teacher_id หรือไม่
        if (!teacher_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการ ID ของครูเพื่อดึงชั้นปี" };
        }
        // ดึงชั้นปีตาม teacher_id
        const classes = await ClassModel.find({ teacher_id }, { year_id: 0 });
        if (classes.length === 0) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: `ไม่พบชั้นปีสำหรับครู ID ${teacher_id}` };
        }

        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
        return {
          message: `ดึงชั้นปีสำหรับครู ID ${teacher_id} สำเร็จ`,
          classes,
        };
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถดึงชั้นปีได้",
        };
      }
    },
    {
      params: t.Object({
        teacher_id: t.String(),
      }),
      detail: {
        tags: ["Class"],
        description: "ดึงชั้นปีตาม ID ของครู",
      },
    }
  );
//   อัพเดตชั้นปี
const update_class = async (app: Elysia) =>
  app.put(
    "/",
    async ({ body, set }) => {
      try {
        const { class_id, room, number, teacher_id } = body;

        // ตรวจสอบว่ามี class_id หรือไม่
        if (!class_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการ ID ชั้นปีที่ต้องการแก้ไข" };
        }
        // ตรวจสอบว่ามี room, number และ year_id หรือไม่
        if (!room || !number) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการห้องและหมายเลขชั้นปีที่ต้องการแก้ไข" };
        }
        // ตรวจสอบว่ามี teacher_id หรือไม่
        if (!teacher_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการ ID ของครูที่รับผิดชอบชั้นปี" };
        }
        // ค้นหาชั้นปีที่ต้องการแก้ไข
        const class_data = await ClassModel.findById(class_id);
        if (!class_data) {
          set.status = 404;
          return { message: `ไม่พบชั้นปีสำหรับ ID ${class_id}` };
        }

        // ตรวจสอบว่ามี class ซ้ำกันหรือไม่ (แต่ยกเว้น record เดิมของตัวเอง)
        const existing_class = await ClassModel.findOne({
          room,
          number,
          year_id: class_data.year_id,
          _id: { $ne: class_id }, //$ne = not equal
        });

        if (existing_class) {
          set.status = 400;
          return {
            message: `ชั้นปี ${room} ห้องที่ ${number} มีอยู่แล้ว ไม่สามารถแก้ไขได้`,
          };
        }

        // อัปเดตข้อมูล
        class_data.room = room;
        class_data.number = number;
        class_data.teacher_id = teacher_id; // Mongoose จะ cast ObjectId ให้อัตโนมัติถ้าเป็น string
        await class_data.save();

        set.status = 200;
        return { message: `อัพเดตชั้นปี ${room} ห้องที่ ${number} สำเร็จ` };
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถอัพเดตชั้นปีได้",
        };
      }
    },
    {
      body: t.Object({
        class_id: t.String(),
        room: t.Number(),
        number: t.Number(),
        teacher_id: t.String(),
      }),
      detail: {
        tags: ["Class"],
        description: "อัพเดตชั้นปีการศึกษา",
      },
    }
  );

// ลบชั้นปี
const delete_class = async (app: Elysia) =>
  app.delete(
    "/",
    async ({ body, set }) => {
      try {
        const { class_id } = body;
        // ตรวจสอบว่ามี class_id หรือไม่
        if (!class_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการ ID ชั้นปีที่ต้องการลบ" };
        }
        // ลบชั้นปี
        const class_data = await ClassModel.findByIdAndDelete(class_id);
        if (!class_data) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: `ไม่พบชั้นปีสำหรับ ID ${class_id}` };
        }
        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
        return {
          message: `ลบชั้นปี ${class_data.room} ห้องที่ ${class_data.number} สำเร็จ`,
        };
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถลบชั้นปีได้",
        };
      }
    },
    {
      body: t.Object({
        class_id: t.String(),
      }),
      detail: {
        tags: ["Class"],
        description: "ลบชั้นปีการศึกษา",
      },
    }
  );

export const add_student_to_class = async (class_id: string, student_id: string) => {
  try {
    if (!class_id || !student_id) return false
    const class_data = await ClassModel.findById(class_id)
    if (!class_data) return false
    if (class_data.students && class_data.students.includes(student_id as any)) return true
    class_data.students = class_data.students ? [...class_data.students, student_id as any] : [student_id as any]
    await class_data.save()
    return true
  } catch (error) {
    return false
  }
}

export const delete_student_from_class = async (student_id: string, class_id: string) => {
  try {
    if (!class_id || !student_id) {
      return { message: `ต้องการ class_id และ student_id`, status: 400, t: false }
    }
    console.log(class_id, student_id);
    
    const class_data = await ClassModel.findById(class_id)
    if (!class_data){
      return { message: `ไม่พบชั้นปีที่มี ID ${class_id}`, status: 404, t: false }
    }
    if (!class_data.students || !class_data.students.includes(student_id as any)) {
      return { message: `ไม่พบนักเรียนที่มี ID ${student_id} ในชั้นปีนี้`, status: 404, t: false }
    }
    class_data.students = class_data.students.filter(sid => sid.toString() !== student_id
      .toString())
    await class_data.save()
    return { message: `ลบนักเรียนที่มี ID ${student_id} ออกจากชั้นปีสำเร็จ`, status: 200, t: true, data: class_data }
  } catch (error) {
    return { message: `เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถลบนักเรียนออกจากชั้นปีได้`, status: 500, t: false }
  }
}

const ClassController = {
  create_class,
  get_classes_by_year,
  get_class_by_id,
  update_class,
  delete_class,
  get_class_by_teacher_id
};
export default ClassController;
