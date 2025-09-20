
import { Elysia, t } from "elysia";
import ClassModel, { IClass } from "../models/class_model";
import { auto_create_student } from "./users/student_controller";
import { IStudent } from "../models/users/student_interface";
import { add_class_to_teacher } from "./users/teacher_controller";

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
        if (!new_class || !new_class._id) {
          set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
          return { message: "เซิฟเวอร์เกิดข้อผิดพลาดสร้างชั้นปีไม่สำเร็จ" };
        }
        await new_class.save();
        const res = await add_class_to_teacher(teacher_id, new_class._id.toString());

        if (!res || res.status === 500 || res.status === 404) {
          set.status = 500;
          return { message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเพิ่มข้อมูลชั้นปีให้กับครูได้" };
        }

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
        })
          .populate("teacher_id", "first_name last_name")
          .populate("students", "prefix first_name last_name user_id email");
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
  app.post(
    "/by_teacher/",
    async ({ body, set }) => {
      try {
        const { teacher_id, year_id } = body;
        // ตรวจสอบว่ามี teacher_id หรือไม่
        if (!teacher_id && !year_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการ ID ของครูและปีการศึกษาเพื่อดึงชั้นปี" };
        }
        // ดึงชั้นปีตาม teacher_id
        const classes = await ClassModel.find({ teacher_id, year_id })
          .populate("students", "user_id prefix first_name last_name yearly_data")
          .populate("year_id", "year");
        if (classes.length === 0) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: `ไม่พบชั้นปีสำหรับครู ID ${teacher_id}` };
        }

        const filteredClasses = classes.map(classItem => {
          const obj: any = classItem.toObject();
          if (obj.students && obj.students.length > 0) {
            obj.students = obj.students.map((student: IStudent) => {
              // filter yearly_data เฉพาะ year_id ที่ต้องการ
              const filteredYearly = student.yearly_data?.find((yearly) => yearly.year?.toString() === year_id);
              return {
                _id: student._id,
                first_name: student.first_name,
                last_name: student.last_name,
                prefix: student.prefix,
                user_id: student.user_id,
                isCompleted: filteredYearly?.isCompleted ?? null,
              };
            });
          }
          return obj;
        });

        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
        return {
          message: `ดึงชั้นปีสำหรับครู ID ${teacher_id} สำเร็จ`,
          classes: filteredClasses,
        };
      } catch (error) {
        console.log(error);

        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถดึงชั้นปีได้",
        };
      }
    },
    {
      body: t.Object({
        teacher_id: t.String(),
        year_id: t.String()
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
    console.log(`เพิ่มนักเรียนที่มี ID ${student_id} เข้าไปในชั้นปีที่มี ID ${class_id} สำเร็จ`);

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export const delete_student_from_class = async (student_id: string, class_id: string) => {
  try {
    if (!class_id || !student_id) {
      return { message: `ต้องการ class_id และ student_id`, status: 400, t: false }
    }

    const class_data = await ClassModel.findById(class_id)
    if (!class_data) {
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

export const auto_update_classes_by_year = async (old_year: string, new_year: string) => {
  try {
    const old_classes = await ClassModel.find({ year_id: old_year });
    if (old_classes.length === 0) {
      return { message: `ไม่พบชั้นปีสำหรับปีการศึกษา ${old_year}`, status: 404, type: false }
    }
    
    for (const old_class of old_classes) {
      if (old_class.number === 1, old_class.room === 2,  old_class.room === 4, old_class.room === 5) {
        await auto_create_class(old_class, new_year); 
      }
    }

    return { message: `อัพเดตชั้นปีจากปีการศึกษา ${old_year} ไปยัง ${new_year} สำเร็จ`, status: 200, type: true }

  } catch (error) {
    return { message: `เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถอัพเดตชั้นปีได้`, status: 500, type: false }
  }
}

const auto_create_class = async (class_data: IClass, new_year: string) => {
  if (!class_data._id)  return 
  
  const res = await auto_create_student(class_data._id.toString(), new_year) as any;
  if (res?.type === true) {
    const { new_students } = res
    const new_class = new ClassModel({
      room: (class_data.room + 1),
      number: class_data.number,
      year_id: new_year,
      teacher_id: class_data.teacher_id,
      students: new_students
    });

    await new_class.save();
    return
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
