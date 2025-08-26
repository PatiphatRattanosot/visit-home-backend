import { Elysia, t } from "elysia";
import SDQModel from "../models/sdq_model";
// create
const create_sdq = (app: Elysia) =>
    app.post(
        "/",
        async ({ body, set }) => {
            try {
                const { student_id, year_id } = body;
                // ตรวจสอบว่ามี student_id หรือไม่
                if (!student_id) {
                    set.status = 400;
                    return { message: "กรุณากรอกข้อมูลรหัสประจำตัวนักเรียน" };
                }
                // ตรวจสอบว่ามี year_id หรือไม่
                if (!year_id) {
                    set.status = 400;
                    return { message: "กรุณากรอกข้อมูลปีการศึกษา" };
                }
                // ตรวจสอบว่ามีข้อมูล SDQ ของนักเรียนในปีการศึกษานี้อยู่แล้วหรือไม่
                const existing_sdq = await SDQModel.findOne({ student_id, year_id });
                if (existing_sdq) {
                    set.status = 400;
                    return { message: "มีข้อมูล SDQ ของนักเรียนในปีการศึกษานี้แล้ว" };
                }
                // สร้างข้อมูล SDQ ใหม่
                const sdq = new SDQModel(body);
                await sdq.save();
                set.status = 201;
                return { message: "เพิ่มข้อมูล SDQ สำเร็จ", sdq };
            } catch (error) {
                console.log(error);
                
                set.status = 500;
                return {message:"เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเพิ่มข้อมูล SDQ ได้"}
            }
        },{
            body: t.Object({
                student_id: t.String(),
                year_id: t.String(),
                comment: t.Optional(t.String()),
                assessor: t.Optional(t.String()),
                question: t.Optional(
                    t.Object({})
                ),
            }),
            detail: {
                tags: ["SDQ"],
                description: "สร้างข้อมูล SDQ",
            },
        })

        //ดึงข้อมูล SDQ ตาม student_id และ year_id
    const get_sdq_by_student_and_year = (app: Elysia) =>
    app.post(
        "/by-student-year",
        async ({ body, set }) => {
            try {
                const { student_id, year_id } = body;
                if (!student_id || !year_id) {
                    set.status = 400;
                    return { message: "กรุณาระบุ student_id และ year_id" };
                }
                // populate student and year
                const sdq = await SDQModel.findOne({ student_id, year_id })
                    .populate("student_id", "first_name last_name")
                    .populate("year_id", "year");
                console.log(sdq);
                if (!sdq) {
                    set.status = 404;
                    return { message: "ไม่พบข้อมูล SDQ" };
                }
                set.status = 200;
                return {message: "ดึงข้อมูล SDQ สำเร็จ", sdq };
            } catch (error) {
                set.status = 500;
                return { message: "เกิดข้อผิดพลาด", error };
            }
        },{
            body: t.Object({
                student_id: t.String(),
                year_id: t.String(),
            }),
            detail: {
                tags: ["SDQ"],
                description: "ดึงข้อมูล SDQ ตาม student_id และ year_id",
            },
        }
    );

// PUT: อัปเดต SDQ ตาม id
const update_sdq = (app: Elysia) =>
    app.put(
        "/",
        async ({  body, set }) => {
            try {
                const { sdq_id, student_id, year_id } = body;
                const sdq = await SDQModel.findByIdAndUpdate(sdq_id, body, { new: true });
                if (!sdq) {
                    set.status = 404;
                    return { message: "ไม่พบข้อมูล SDQ" };
                }
                return sdq;
            } catch (err) {
                set.status = 500;
                return { message: "เกิดข้อผิดพลาด", error: err };
            }
        },
        {
            body: t.Object({
                sdq_id: t.String(),
                student_id: t.String(),
                year_id: t.String(),
                comment: t.Optional(t.String()),
                assessor: t.Optional(t.String()),
                question: t.Optional(
                    t.Object({
                        question_1: t.Number(),
                        question_2: t.Number(),
                        question_3: t.Number(),
                        question_4: t.Number(),
                        question_5: t.Number(),
                        question_6: t.Number(),
                        question_7: t.Number(),
                        question_8: t.Number(),
                        question_9: t.Number(),
                        question_10: t.Number(),
                        question_11: t.Number(),
                        question_12: t.Number(),
                        question_13: t.Number(),
                        question_14: t.Number(),
                        question_15: t.Number(),
                        question_16: t.Number(),
                        question_17: t.Number(),
                        question_18: t.Number(),
                        question_19: t.Number(),
                        question_20: t.Number(),
                        question_21: t.Number(),
                        question_22: t.Number(),
                        question_23: t.Number(),
                        question_24: t.Number(),
                        question_25: t.Number(),
                    })
                ),
            }),
            detail: {
                tags: ["SDQ"],
                description: "แก้ไขข้อมูล SDQ",
            },
        }
    );

// DELETE: ลบ SDQ ตาม id
const delete_sdq = (app: Elysia) =>
    app.delete(
        "/",
        async ({ body:{sdq_id}, set }) => {
            try {
                const result = await SDQModel.findByIdAndDelete(sdq_id);
                if (!result) {
                    set.status = 404;
                    return { message: "ไม่พบข้อมูล SDQ" };
                }
                return { message: "ลบข้อมูล SDQ สำเร็จ" };
            } catch (err) {
                set.status = 500;
                return { message: "เกิดข้อผิดพลาด", error: err };
            }
        },
        {
            body: t.Object({
                sdq_id: t.String(),
            }),
            detail: {
                tags: ["SDQ"],
                description: "ลบข้อมูล SDQ",
            },
        }
    );

const SDQController = {
    create_sdq,
    get_sdq_by_student_and_year,
    update_sdq,
    delete_sdq,
};

export default SDQController;