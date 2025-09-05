import { Elysia, t } from "elysia";
import SDQModel, { ISDQ } from "../models/sdq_model";
// create
const create_sdq = (app: Elysia) =>
    app.post(
        "/",
        async ({ body, set }) => {
            try {
                const { student_id, year_id, emotional, behavioral, hyperactivity, friendship, social } = body;
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

                // คำนวณคะแนนรวมด้านอารมณ์
                const { question_3, question_8, question_13, question_16, question_24 } = emotional;
                const emotional_total = (question_3 + question_8 + question_13 + question_16 + question_24)

                // คำนวณคะแนนรวมด้านพฤติกรรม
                const { question_5, question_7, question_12, question_18, question_22 } = behavioral;
                const behavioral_total = (question_5 + question_7 + question_12 + question_18 + question_22)

                // คำนวณคะแนนรวมด้านสมาธิสั้น
                const { question_2, question_10, question_15, question_21, question_25 } = hyperactivity;
                const hyperactivity_total = (question_2 + question_10 + question_15 + question_21 + question_25)

                // คำนวณคะแนนรวมด้านความสัมพันธ์กับเพื่อน
                const { question_6, question_11, question_14, question_19, question_23 } = friendship;
                const friendship_total = (question_6 + question_11 + question_14 + question_19 + question_23)

                // คำนวณคะแนนรวมด้านสังคม
                const { question_1, question_4, question_9, question_17, question_20 } = social;
                const social_total = (question_1 + question_4 + question_9 + question_17 + question_20)

                sdq.emotional.total_score = Number(emotional_total);
                sdq.behavioral.total_score = Number(behavioral_total);
                sdq.hyperactivity.total_score = Number(hyperactivity_total);
                sdq.friendship.total_score = Number(friendship_total);
                sdq.social.total_score = Number(social_total);

                sdq.status = true;
                await sdq.save();
                set.status = 201;
                return { message: "เพิ่มข้อมูล SDQ สำเร็จ", sdq };
            } catch (error) {
                set.status = 500;
                return { message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเพิ่มข้อมูล SDQ ได้" }
            }
        }, {
        body: t.Object({
            student_id: t.String(),
            year_id: t.String(),
            assessor: t.String(),
            emotional: t.Object({
                question_3: t.String(),
                question_8: t.String(),
                question_13: t.String(),
                question_16: t.String(),
                question_24: t.String(),
            }),
            behavioral: t.Object({
                question_5: t.String(),
                question_7: t.String(),
                question_12: t.String(),
                question_18: t.String(),
                question_22: t.String(),
            }),
            hyperactivity: t.Object({
                question_2: t.String(),
                question_10: t.String(),
                question_15: t.String(),
                question_21: t.String(),
                question_25: t.String(),
            }),
            friendship: t.Object({
                question_6: t.String(),
                question_11: t.String(),
                question_14: t.String(),
                question_19: t.String(),
                question_23: t.String(),
            }),
            social: t.Object({
                question_1: t.String(),
                question_4: t.String(),
                question_9: t.String(),
                question_17: t.String(),
                question_20: t.String(),
            }),
            other: t.Object({
                additional: t.String(),
                overall_problem: t.String(),
                problem_time: t.String(),
                is_uneasy_student: t.String(),
                is_annoy_student: t.String(),
                is_difficult_student: t.String(),
            })
        }),
        detail: {
            tags: ["SDQ"],
            description: "สร้างข้อมูล SDQ",
        },
    })

//ดึงข้อมูล SDQ ตาม student_id และ year_id
const get_sdq_by_student_year_and_assessor = (app: Elysia) =>
    app.post(
        "/by-student-year",
        async ({ body, set }) => {
            try {
                const { student_id, year_id, assessor } = body;
                if (!student_id || !year_id) {
                    set.status = 400;
                    return { message: "กรุณาระบุ student_id และ year_id" };
                }
                // populate student and year
                const sdq = await SDQModel.findOne({ student_id, year_id, assessor })
                    .populate("student_id", "first_name last_name")
                    .populate("year_id", "year");
                if (!sdq) {
                    set.status = 404;
                    return { message: "ไม่พบข้อมูล SDQ" };
                }
                set.status = 200;
                return { message: "ดึงข้อมูล SDQ สำเร็จ", sdq };
            } catch (error) {
                set.status = 500;
                return { message: "เกิดข้อผิดพลาด", error };
            }
        }, {
        body: t.Object({
            student_id: t.String(),
            year_id: t.String(),
            assessor: t.String()
        }),
        detail: {
            tags: ["SDQ"],
            description: "ดึงข้อมูล SDQ ตาม student_id และ year_id",
        },
    }
    );



// DELETE: ลบ SDQ ตาม id
const delete_sdq = (app: Elysia) =>
    app.delete(
        "/",
        async ({ body: { sdq_id }, set }) => {
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
    get_sdq_by_student_year_and_assessor,
    delete_sdq,
};

export default SDQController;