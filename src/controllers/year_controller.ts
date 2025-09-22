import { Elysia, t } from "elysia";
import { ObjectId } from "mongodb"
import YearModel, { IYear } from "../models/year_model";
import { auto_update_classes_by_year } from "./class_controller";

const create_year = async (app: Elysia) =>
  app.post(
    "/",
    async ({ body, set }) => {
      try {
        const { year } = body;
        // ตรวจสอบว่ามี year หรือไม่
        if (!year) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการปีการศึกษา" };
        }
        // ถ้ามีปีการศึกษาแล้ว ให้เพิ่มปีการศึกษาใหม่ที่เป็นปีถัดไป
        const existing_year = await YearModel.findOne({ year });
        if (existing_year) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: `ปีการศึกษา ${year} มีอยู่แล้ว ` };
        }
        // สร้างปีการศึกษาใหม่
        const new_year = new YearModel({ year });
        await new_year.save();
        set.status = 201; // ตั้งค่า HTTP status เป็น 201 (Created)
        return { message: `สร้างปีการศึกษา ${year} สำเร็จ` };
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเพิ่มปีการศึกษาได้",
        };
      }
    },
    {
      body: t.Object({
        year: t.Number(), // ปีการศึกษา
      }),
      detail: {
        tags: ["Year"],
        description: "สร้างปีการศึกษา",
      },
    }
  );

const auto_create_year = async (app: Elysia) =>
  app.post(
    "/auto",
    async ({ set }) => {
      try {
        const old_year = (await YearModel.findOne()
          .sort({ year: -1 })
          .limit(1)); // ค้นหาปีการศึกษาล่าสุดในฐานข้อมูล
        if (!old_year) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ยังไม่มีปีการศึกษาในระบบ" };
        }

        const new_year = new YearModel({ year: Number(old_year.year) + 1 }); // สร้างปีการศึกษาใหม่ที่เป็นปีถัดไป

        await new_year.save(); // บันทึกปีการศึกษาใหม่
        // console.log(new_year);

        if (old_year._id && new_year._id) {
          const res = await auto_update_classes_by_year(old_year._id.toString(), new_year._id.toString());
          

          if (res.type === true) {
            await YearModel.findByIdAndDelete(new_year._id);
            set.status = 201; // ตั้งค่า HTTP status เป็น 201 (Created)
            return { message: `สร้างปีการศึกษา ${new_year.year} สำเร็จ` };
          }
        }
        
        // console.log(delete_year);
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)

        return { message: `สร้างปีการศึกษา ${new_year.year} ไม่สำเร็จ` };

      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)

        return {
          message:
            "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเพิ่มปีการศึกษาอัตโนมัติได้",
        };
      }
    },
    {
      detail: {
        tags: ["Year"],
        description: "สร้างปีการศึกษาอัตโนมัติ",
      },
    }
  );

// ฟังก์ชันสำหรับดึงข้อมูลปีการศึกษาทั้งหมดจากฐานข้อมูล
const get_years = async (app: Elysia) =>
  app.get(
    "/",
    async ({ set }) => {
      try {
        const years = await YearModel.find({}); // ค้นหาปีการศึกษาทั้งหมดในฐานข้อมูล
        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
        return years; // ส่งคืนปีการศึกษาทั้งหมด
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถดูปีการศึกษาได้",
        };
      }
    },
    {
      detail: {
        tags: ["Year"],
        description: "ดูปีการศึกษาทั้งหมด",
      },
    }
  );

// ฟังก์ชันสำหรับดึงข้อมูลปีการศึกษาโดยใช้ year_id
const get_year_by_name= async (app: Elysia) =>
  app.get(
    "/:year",
    async ({ params, set }) => {
      try {
        const { year } = params; // ดึง year_id จากพารามิเตอร์
        
        const yearData = await YearModel.find({ year }); // ค้นหาปีการศึกษาตาม year_id
        if (!yearData) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: "ไม่พบปีการศึกษานี้ในระบบ" };
        }
        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
        return yearData; // ส่งคืนปีการศึกษา
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถดูปีการศึกษาได้",
        };
      }
    },
    {
      params: t.Object({ year: t.Number() }),
      detail: {
        tags: ["Year"],
        description: "ดูปีการศึกษา",
      },
    }
  );

// ฟังก์ชันสำหรับแก้ไขปีการศึกษาในฐานข้อมูล
const update_year = async (app: Elysia) =>
  app.put(
    "/",
    async ({ body, set }) => {
      try {
        const { year_id, new_year } = body;
        // ตรวจสอบว่ามี year_id หรือไม่
        if (!year_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการ year_id" };
        }
        // ตรวจสอบว่ามี new_year หรือไม่
        if (!new_year) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "กรุณากรอกการปีการศึกษา" };
        }
        const year = (await YearModel.findByIdAndUpdate({
          _id: year_id,
        })) as IYear;
        if (!year) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: "ไม่พบปีการศึกษานี้ในระบบ" };
        }
        const existing_year = await YearModel.findOne({
          year: new_year,
        });
        // ตรวจสอบว่ามีปีการศึกษาใหม่ซ้ำกันหรือไม่
        if (existing_year) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: `ปีการศึกษา ${new_year} มีอยู่แล้ว ` };
        }

        // แก้ไขปีการศึกษา
        const old_year = year.year;
        year.year = new_year;
        await year.save(); // บันทึกข้อมูลที่แก้ไขลงในฐานข้อมูล
        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
        return {
          message: `แก้ไขปีการศึกษา ${old_year} เป็น ${new_year} สำเร็จ`,
        };
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถแก้ไขปีการศึกษาได้",
        };
      }
    },
    {
      body: t.Object({
        year_id: t.String(), // ID ของปีการศึกษา
        new_year: t.Number(), // ปีการศึกษา
      }),
      detail: {
        tags: ["Year"],
        description: "แก้ไขปีการศึกษา",
      },
    }
  );

// ฟังก์ชันสำหรับลบปีการศึกษาในฐานข้อมูล
const delete_year = async (app: Elysia) =>
  app.delete(
    "/",
    async ({ body, set }) => {
      try {
        const { year_id } = body;
        // ตรวจสอบว่ามี year_id หรือไม่
        if (!year_id) {
          set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
          return { message: "ต้องการ year_id" };
        }
        // ลบปีการศึกษา
        const year = await YearModel.findByIdAndDelete(year_id); // ลบปีการศึกษาจากฐานข้อมูล
        if (!year) {
          set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
          return { message: "ไม่พบปีการศึกษานี้ในระบบ" };
        }

        set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
        return { message: `ลบปีการศึกษา ${year.year} สำเร็จ` };
      } catch (error) {
        set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถลบปีการศึกษาได้",
        };
      }
    },
    {
      body: t.Object({
        year_id: t.String(), // ID ของปีการศึกษา
      }),
      detail: {
        tags: ["Year"],
        description: "ลบปีการศึกษา",
      },
    }
  );

const update_appointment_time = async (app: Elysia) =>
  app.patch(
    "/add-schedule",
    async ({ body, set }) => {
      try {
        const { year_id, start_schedule_date, end_schedule_date } = body;
        if (!year_id) {
          set.status = 400;
          return { message: "ต้องการ year_id" };
        }
        if (!start_schedule_date || !end_schedule_date) {
          set.status = 400;
          return { message: "กรุณากรอกวันที่ให้ครบถ้วน" };
        }
        const year = (await YearModel.findByIdAndUpdate({
          _id: year_id
        }, { start_schedule_date, end_schedule_date }, { new: true }))
        if (!year) {
          set.status = 404;
          return { message: "ไม่พบปีการศึกษานี้ในระบบ" };
        }
        set.status = 200;
        return { message: "กำหนดช่วงเวลานัดหมาย สำเร็จ", year };
      } catch (error) {
        set.status = 500;
        return {
          message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถแก้ไขข้อมูลได้",
        };
      }
    }, {
    body: t.Object({
      year_id: t.String(),
      start_schedule_date: t.Date(),
      end_schedule_date: t.Date(),
    }),
    detail: { tags: ["Year"], description: "เพิ่ม/แก้ไข ช่วงเวลานัดหมาย" },
  })


const YearController = {
  create_year,
  auto_create_year,
  get_years,
  get_year_by_name,
  update_year,
  update_appointment_time,
  delete_year,
};

export default YearController;
