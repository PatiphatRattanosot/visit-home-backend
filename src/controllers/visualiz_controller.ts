import { Elysia, t } from "elysia"
import { ObjectId } from "mongodb"
import UserModel from "../models/users/user_model"
import VisitInfoModel from "../models/visit_info_model"
import YearModel from "../models/year_model"

export default (app: Elysia) =>
    app
        .get("/show-all-user", async ({ set }) => {
            try {
                const all_user = await UserModel.find();

                let admin_total: number = 0;
                let teacher_total: number = 0;
                let student_total: number = 0;

                if (all_user.length === 0) {
                    set.status = 204;
                    return { message: "ไม่พบข้อมูลผู้ใช้ในระบบ", admin_total, teacher_total, student_total };
                }

                all_user.forEach(user => {
                    if (user.role.includes("Admin")) admin_total++;
                    if (user.role.includes("Teacher")) teacher_total++;
                    if (user.role.includes("Student")) student_total++;
                });

                set.status = 200;
                return {
                    admin_total,
                    teacher_total,
                    student_total
                };
            } catch (error) {
                set.status = 500;
                return { message: "เซิฟเวอร์ผิดพลาดในการแสดงจำนวณผู้ใช้ทั้งหมด" };
            }
        }, {
            detail: {
                tags: ["Visualiz"],
                description: "แสดงจำนวณผู้ใช้ทั้งหมดโดยจำแนกตามบทบาท"
            },
            response: {
                200: t.Object({
                    admin_total: t.Number({ examples: [19] }),
                    teacher_total: t.Number({ examples: [29] }),
                    student_total: t.Number({ examples: [39] }),
                }),
                204: t.Object({
                    message: t.String({ examples: ["ไม่พบข้อมูลผู้ใช้ในระบบ"] }),
                    admin_total: t.Number({ examples: [0] }),
                    teacher_total: t.Number({ examples: [0] }),
                    student_total: t.Number({ examples: [0] }),
                }),
                500: t.Object({
                    message: t.String({ examples: ["เซิฟเวอร์ผิดพลาดในการแสดงจำนวณผู้ใช้ทั้งหมด"] }),
                })
            }
        })
        .get("/show-teacher-status", async ({ set }) => {
            try {
                const all_teacher = await UserModel.find({ type: { $in: ["Teacher"] } });
                console.log(all_teacher);
                let active_total: number = 0;
                let inactive_total: number = 0;

                if (all_teacher.length === 0) {
                    set.status = 204;
                    return { message: "ไม่พบข้อมูลครูในระบบ", active_total, inactive_total };
                }
                all_teacher.forEach(teacher => {
                    if (teacher.status === "Active") active_total++;
                    if (teacher.status === "Inactive") inactive_total++;
                });

                set.status = 200;
                return {
                    active_total,
                    inactive_total
                };
            } catch (error) {
                set.status = 500;
                return { message: "เซิฟเวอร์ผิดพลาดในการแสดงจำนวณของครู" };
            }
        }, {
            detail: {
                tags: ["Visualiz"],
                description: "แสดงจำนวณของครูโดยจำแนกตามสถานะ"
            },
            response: {
                200: t.Object({
                    active_total: t.Number({ examples: [99] }),
                    inactive_total: t.Number({ examples: [99] }),
                }),
                204: t.Object({
                    message: t.String({ examples: ["ไม่พบข้อมูลครูในระบบ"] }),
                    active_total: t.Number({ examples: [0] }),
                    inactive_total: t.Number({ examples: [0] }),
                }),
                500: t.Object({
                    message: t.String({ examples: ["เซิฟเวอร์ผิดพลาดในการแสดงจำนวณของครู"] }),
                })
            }
        })
        .get("/show-visit-info-status", async ({ set }) => {
            try {
                const all_year = await YearModel.find().sort({ year: -1 });

                if (all_year.length === 0) {
                    set.status = 204;
                    return { message: "ไม่พบข้อมูลปีการศึกษาในระบบ" };
                }

                // แก้ไข type เป็น string[]
                const all_year_id: string[] = all_year
                    .map(year => year._id?.toString())
                    .filter((id): id is string => Boolean(id));

                
                const visit_info_data = await Promise.all(
                    all_year_id.map(async (year_id) => {
                        const visit_info = await VisitInfoModel.find({ year_id: new ObjectId(year_id) });

                        // หา year object ที่ตรงกับ year_id
                        const yearData = all_year.find(year => year._id?.toString() === year_id);

                        return {
                            year: yearData ? Number(yearData.year) : null,
                            status_total: visit_info.length,
                        };
                    })
                );

                set.status = 200;
                return {
                    visit_info_total: visit_info_data
                };

            } catch (error) {
                console.error(error);
                set.status = 500;
                return { message: "เซิฟเวอร์ผิดพลาดในการแสดงจำนวนสถานะการเยี่ยมบ้านทั้งหมด" };
            }
        }, {
            detail: {
                tags: ["Visualiz"],
                description: "แสดงจำนวนสถานะการเยี่ยมบ้านทั้งหมดแยกตามปี"
            },
            response: {
                200: t.Object({
                    visit_info_total: t.Array(t.Object({
                        year: t.Union([t.Number({ examples: [2566] }), t.Null()]),
                        status_total: t.Number({ examples: [15] })
                    },))
                }),
                204: t.Object({
                    message: t.String({ examples: ["ไม่พบข้อมูลปีการศึกษาในระบบ"] })
                }),
                500: t.Object({
                    message: t.String({ examples: ["เซิฟเวอร์ผิดพลาดในการแสดงจำนวนสถานะการเยี่ยมบ้านทั้งหมด"] }),
                })
            }
        })