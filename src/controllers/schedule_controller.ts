import { Elysia, t } from "elysia";
import ScheduleModel from "../models/schedule_model";

// สร้างข้อมูล schedule
const create_schedule = (app: Elysia) =>
    app.post("/create", async ({ body, set }) => {
        try {
            const { teacher_id, student_id, year_id, appointment_date, status, comment } = body;
            if (!teacher_id) {
                set.status = 400;
                return { message: "กรุณาระบุรหัสครูที่ปรึกษา" };
            }
            if (!student_id) {
                set.status = 400;
                return { message: "กรุณาระบุรหัสนักเรียน" };
            }
            if (!year_id) {
                set.status = 400;
                return { message: "กรุณาระบุรหัสปีการศึกษา" };
            }
            if (!appointment_date || !status) {
                set.status = 400;
                return { message: "กรุณาระบุวันที่นัดหมายและสถานะ" };
            }
            const schedule = new ScheduleModel({
                teacher_id,
                student_id,
                year_id,
                appointment_date,
                status,
            });
            if (comment) {
                schedule.comment = comment;
            }
            if (!schedule) {
                set.status = 404;
                return { message: "ไม่สามารถสร้างข้อมูลตารางได้" };
            }
            await schedule.save();
            set.status = 201;
            return { message: "สร้างข้อมูลตารางสำเร็จ", schedule };
        } catch (error) {
            set.status = 500;
            return { message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถสร้างข้อมูลตารางได้" };
        }
    }, {
        body: t.Object({
            teacher_id: t.String(),
            student_id: t.String(),
            year_id: t.String(),
            appointment_date: t.Date(),
            status: t.String(),
            comment: t.Optional(t.String()),
        }),
        detail: { tags: ["Schedule"], description: "สร้างข้อมูลตาราง" }
    });

// ดึงข้อมูล schedule ตาม teacher_id, student_id, year_id
const get_by_tc_stu_year = (app: Elysia) =>
    app.post("/get_schedule", async ({ body, set }) => {
        try {
            const { teacher_id, student_id, year_id } = body;
            if (!teacher_id) {
                set.status = 400;
                return { message: "กรุณาระบุรหัสครูที่ปรึกษา" };
            }
            if (!student_id) {
                set.status = 400;
                return { message: "กรุณาระบุรหัสนักเรียน" };
            }
            if (!year_id) {
                set.status = 400;
                return { message: "กรุณาระบุรหัสปีการศึกษา" };
            }
            const schedules = await ScheduleModel.find({ teacher_id, student_id, year_id });
            if (!schedules) {
                set.status = 404;
                return { message: "ไม่พบข้อมูลตาราง" };
            }
            set.status = 200;
            return { message: "ดึงข้อมูลตารางสำเร็จ", schedules };
        } catch (error) {
            set.status = 500;
            return { message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถดึงข้อมูลตารางได้" };
        }
    }, {
        body: t.Object({
            teacher_id: t.Optional(t.String()),
            student_id: t.Optional(t.String()),
            year_id: t.Optional(t.String()),
        }),
        detail: { tags: ["Schedule"], description: "ดึงข้อมูลตารางตาม teacher, student, year" }
    });

// อัปเดตข้อมูล schedule
const update_schedule = (app: Elysia) =>
    app.put("/update", async ({ body, set }) => {
        try {
            const { schedule_id, appointment_date, status, comment} = body;
            const schedule = await ScheduleModel.findByIdAndUpdate(schedule_id, { appointment_date, status }, { new: true });
            if (!schedule) {
                set.status = 404;
                return { message: "ไม่พบข้อมูลตาราง" };
            }
            if (comment) {
                schedule.comment = comment;
            }
            await schedule.save();
            set.status = 200;
            return { message: "อัปเดตข้อมูลตารางสำเร็จ", schedule };
        } catch (error) {
            set.status = 500;
            return { message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถอัปเดตข้อมูลตารางได้" };
        }
    }, {
        body: t.Object({
            schedule_id: t.String(),
            appointment_date: t.Date(),
            status: t.String(),
            comment: t.Optional(t.String()),
        }),
        detail: { tags: ["Schedule"], description: "อัปเดตข้อมูลตาราง" }
    });

// ลบข้อมูล schedule
const delete_schedule = (app: Elysia) =>
    app.delete("/delete", async ({ body, set }) => {
        try {
            const { schedule_id } = body;
            const result = await ScheduleModel.findByIdAndDelete(schedule_id);
            if (!result) {
                set.status = 404;
                return { message: "ไม่พบข้อมูลตาราง" };
            }
            set.status = 200;
            return { message: "ลบข้อมูลตารางสำเร็จ" };
        } catch (error) {
            set.status = 500;
            return { message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถลบข้อมูลตารางได้" };
        }
    }, {
        body: t.Object({ schedule_id: t.String() }),
        detail: { tags: ["Schedule"], description: "ลบข้อมูลตาราง" }
    });

const ScheduleController = {
    create_schedule,
    get_by_tc_stu_year,
    update_schedule,
    delete_schedule,
};

export default ScheduleController;

