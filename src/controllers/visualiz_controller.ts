import { Elysia, t } from "elysia"
import { ObjectId } from "mongodb"
import UserModel from "../models/users/user_model"
import StudentModel from "../models/users/student_model"
import VisitInfoModel from "../models/visit_info_model"
import SDQModel from "../models/sdq_model"
import YearModel from "../models/year_model"
import ClassModel from "../models/class_model"

export default (app: Elysia) =>
    app
        .state({ user: { email: "", roles: [] as string[] } })
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
                    if (teacher.status === "ใช้งานอยู่") active_total++;
                    if (teacher.status === "ไม่ได้ใช้งานแล้ว") inactive_total++;
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
        .get("/show-student-visit-status", async ({ set, store: { user } }) => {
            try {
                if (!user.roles.includes("Teacher")) {
                    set.status = 403;
                    return { message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" };
                }
                const teacher = await UserModel.findOne({ email: user.email, type: { $in: ["Teacher"] } });
                if (!teacher) {
                    set.status = 404;
                    return { message: "ไม่พบข้อมูลครูที่ปรึกษา" };
                }
                const all_year = await YearModel.find().sort({ year: -1 });
                if (all_year.length === 0) {
                    set.status = 204;
                    return { message: "ไม่พบข้อมูลปีการศึกษาในระบบ" };
                }
                const all_year_id: string[] = all_year
                    .map(year => year._id?.toString())
                    .filter((id): id is string => Boolean(id));
                const visit_info_data = await Promise.all(
                    all_year_id.map(async (year_id) => {
                        const visit_info = await VisitInfoModel.find({ year_id: new ObjectId(year_id), teacher_id: teacher._id });

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
                set.status = 500;
                return { message: "เซิฟเวอร์ผิดพลาดในการแสดงจำนวนสถานะการเยี่ยมบ้านของนักเรียน" }
            }
        }, {
            detail: {
                tags: ["Visualiz"],
                description: "แสดงจำนวนสถานะการเยี่ยมบ้านของนักเรียน"
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
                    message: t.String({ examples: ["เซิฟเวอร์ผิดพลาดในการแสดงจำนวนสถานะการเยี่ยมบ้านของนักเรียน"] }),
                }),
                403: t.Object({ message: t.String({ examples: ["คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้"] }) }),
                404: t.Object({ message: t.String({ examples: ["ไม่พบข้อมูลครูที่ปรึกษา"] }) }),
            }
        })
        .get("/show-sdq-status", async ({ set, store: { user } }) => {
            try {
                const teacher = await UserModel.findOne({ email: user.email, type: { $in: ["Teacher"] } });
                if (!teacher) {
                    set.status = 404;
                    return { message: "ไม่พบข้อมูลครูที่ปรึกษา" };
                }
                const all_year = await YearModel.find().sort({ year: -1 });
                if (all_year.length === 0) {
                    set.status = 204;
                    return { message: "ไม่พบข้อมูลปีการศึกษาในระบบ" };
                }
                const classes = await ClassModel.find({ teacher_id: teacher._id });

                const all_year_id: string[] = all_year
                    .map(year => year._id?.toString())
                    .filter((id): id is string => Boolean(id));
 
                const sdq_data = await Promise.all(
                    all_year_id.map(async (year_id) => {
                        let class_id_list = classes.map(c => c._id?.toString()).filter((id): id is string => Boolean(id));
                        let student_id_list: string[] = [];
                        let class_info: { room: number; number: number } | null = null; // แก้ไข type ที่นี่

                        for (const class_id of class_id_list) {
                            const class_data = await ClassModel.findById(class_id);
                            if (!class_data) continue;

                            // เก็บข้อมูล class
                            class_info = {
                                room: class_data.room,
                                number: class_data.number
                            }; // ลบ comma ที่เหลือ

                            if (class_data.students && class_data.students.length > 0) {
                                student_id_list = [...student_id_list, ...class_data.students.map(sid => sid.toString())];
                            }
                        }

                        const sdq = await SDQModel.find({ year_id: new ObjectId(year_id), student_id: { $in: student_id_list } });

                        // หา year object ที่ตรงกับ year_id    
                        const yearData = all_year.find(year => year._id?.toString() === year_id);
                        return {
                            year: yearData ? Number(yearData.year) : null,
                            class: class_info,
                            status_total: sdq.length,
                        };
                    })
                );
                set.status = 200;
                return {
                    sdq_total: sdq_data
                };
            } catch (error) {
                set.status = 500;
                return {
                    message: "เซิฟเวอร์ผิดพลาดในการแสดงจำนวนสถานะ SDQ ของนักเรียน"
                }
            }
        }, {
            detail: {
                tags: ["Visualiz"],
                description: "แสดงจำนวนสถานะ SDQ ของนักเรียน"
            },
            response: {
                200: t.Object({
                    sdq_total: t.Array(t.Object({
                        year: t.Union([t.Number({ examples: [2566] }), t.Null()]),
                        class: t.Union([t.Object({
                            room: t.Number({ examples: [1] }),
                            number: t.Number({ examples: [1] })
                        }), t.Null()]),
                        status_total: t.Number({ examples: [15] })
                    },))
                }),
                204: t.Object({
                    message: t.String({ examples: ["ไม่พบข้อมูลปีการศึกษาในระบบ"] })
                }),
                500: t.Object({
                    message: t.String({ examples: ["เซิฟเวอร์ผิดพลาดในการแสดงจำนวนสถานะ SDQ ของนักเรียน"] }),
                }),
                404: t.Object({
                    message: t.String({ examples: ["ไม่พบข้อมูลครูที่ปรึกษา"] })
                }),

            }
        })
        .get("/teacher-students-analytics", async ({ set, store: { user } }) => {
            try {
                const teacher = await UserModel.findOne({ email: user.email, type: { $in: ["Teacher"] } });
                if (!teacher) {
                    set.status = 404;
                    return { message: "ไม่พบข้อมูลครูที่ปรึกษา" };
                }

                const all_year = await YearModel.find().sort({ year: -1 });
                if (all_year.length === 0) {
                    set.status = 204;
                    return { message: "ไม่พบข้อมูลปีการศึกษาในระบบ" };
                }

                const classes = await ClassModel.find({ teacher_id: teacher._id });
                const all_year_id: string[] = all_year
                    .map(year => year._id?.toString())
                    .filter((id): id is string => Boolean(id));

                const analytics_data = await Promise.all(
                    all_year_id.map(async (year_id) => {
                        let student_id_list: string[] = [];

                        // รวบรวม student IDs จากทุกชั้นเรียนที่ครูดูแล
                        for (const class_data of classes) {
                            if (class_data.students && class_data.students.length > 0) {
                                student_id_list = [...student_id_list, ...class_data.students.map(sid => sid.toString())];
                            }
                        }

                        // ดึงข้อมูลนักเรียนที่มี yearly_data สำหรับปีนี้
                        const students = await StudentModel.find({
                            _id: { $in: student_id_list },
                            "yearly_data.year": new ObjectId(year_id)
                        });

                        // เตรียมตัวแปรสำหรับเก็บสถิติ
                        let family_relation_status = {
                            together: 0,
                            divorced: 0,
                            separated: 0,
                            other: 0
                        };

                        let household_income = {
                            below_3000: 0,
                            income_3000_5000: 0,
                            income_5000_7000: 0,
                            income_7000_9000: 0,
                            above_9000: 0
                        };

                        let daily_allowance = {
                            below_40: 0,
                            allowance_40_60: 0,
                            allowance_60_80: 0,
                            allowance_80_100: 0,
                            above_100: 0
                        };

                        let housing_types: Record<string, number> = {};
                        let housing_conditions: Record<string, number> = {};

                        // วิเคราะห์ข้อมูลแต่ละนักเรียน
                        students.forEach(student => {
                            const yearlyData = student.yearly_data.find(data => 
                                data.year.toString() === year_id
                            );

                            if (yearlyData) {
                                // 1. สถานะความสัมพันธ์ครอบครัว
                                const relationStatus = yearlyData.relationship_info?.family_relation_status;
                                if (relationStatus) {
                                    switch (relationStatus.toLowerCase()) {
                                        case '0':
                                            family_relation_status.together++;
                                            break;
                                        case '1':
                                            family_relation_status.divorced++;
                                            break;
                                        case '2':
                                            family_relation_status.separated++;
                                            break;
                                        default:
                                            family_relation_status.other++;
                                    }
                                }

                                // 2. รายได้รวมของครอบครัว
                                const income = yearlyData.family_info?.total_household_income;
                                if (income !== undefined && income !== null) {
                                    if (income < 3000) household_income.below_3000++;
                                    else if (income >= 3000 && income < 5000) household_income.income_3000_5000++;
                                    else if (income >= 5000 && income < 7000) household_income.income_5000_7000++;
                                    else if (income >= 7000 && income < 9000) household_income.income_7000_9000++;
                                    else if (income >= 9000) household_income.above_9000++;
                                }

                                // 3. เงินค่าขนมที่เด็กได้รับ
                                const allowance = yearlyData.family_info?.daily_total_to_school;
                                if (allowance !== undefined && allowance !== null) {
                                    if (allowance < 40) daily_allowance.below_40++;
                                    else if (allowance >= 40 && allowance < 60) daily_allowance.allowance_40_60++;
                                    else if (allowance >= 60 && allowance < 80) daily_allowance.allowance_60_80++;
                                    else if (allowance >= 80 && allowance < 100) daily_allowance.allowance_80_100++;
                                    else if (allowance >= 100) daily_allowance.above_100++;
                                }

                                // 4. ประเภทที่อยู่อาศัย
                                const housingType = yearlyData.family_info?.housing_type;
                                if (housingType) {
                                    // จัดกลุ่มตาม value-label structure
                                    let typeKey = '';
                                    switch (housingType) {
                                        case '0':
                                            typeKey = '0';
                                            break;
                                        case '1':
                                            typeKey = '1';
                                            break;
                                        case '2':
                                            typeKey = '2';
                                            break;
                                        default:
                                            typeKey = housingType;
                                    }
                                    housing_types[typeKey] = (housing_types[typeKey] || 0) + 1;
                                }

                                // 5. สภาพที่อยู่อาศัย
                                const housingCondition = yearlyData.family_info?.housing_condition;
                                if (housingCondition) {
                                    // จัดกลุ่มตาม value-label structure
                                    let conditionKey = '';
                                    switch (housingCondition) {
                                        case '0':
                                            conditionKey = '0';
                                            break;
                                        case '1':
                                            conditionKey = '1';
                                            break;
                                        case '2':
                                            conditionKey = '2';
                                            break;
                                        default:
                                            conditionKey = housingCondition;
                                    }
                                    housing_conditions[conditionKey] = (housing_conditions[conditionKey] || 0) + 1;
                                }
                            }
                        });

                        const yearData = all_year.find(year => year._id?.toString() === year_id);
                        return {
                            year: yearData ? Number(yearData.year) : null,
                            total_students: students.length,
                            family_relation_status,
                            household_income,
                            daily_allowance,
                            housing_types,
                            housing_conditions
                        };
                    })
                );

                set.status = 200;
                return {
                    analytics: analytics_data
                };

            } catch (error) {
                console.error(error);
                set.status = 500;
                return { message: "เซิฟเวอร์ผิดพลาดในการวิเคราะห์ข้อมูลนักเรียน" };
            }
        }, {
            detail: {
                tags: ["Visualiz"],
                description: "วิเคราะห์ข้อมูลสถิติของนักเรียนสำหรับครู"
            },
            response: {
                200: t.Object({
                    analytics: t.Array(t.Object({
                        year: t.Union([t.Number({ examples: [2567] }), t.Null()]),
                        total_students: t.Number({ examples: [25] }),
                        family_relation_status: t.Object({
                            together: t.Number({ examples: [15] }),
                            divorced: t.Number({ examples: [5] }),
                            separated: t.Number({ examples: [3] }),
                            other: t.Number({ examples: [2] })
                        }),
                        household_income: t.Object({
                            below_3000: t.Number({ examples: [5] }),
                            income_3000_5000: t.Number({ examples: [8] }),
                            income_5000_7000: t.Number({ examples: [7] }),
                            income_7000_9000: t.Number({ examples: [3] }),
                            above_9000: t.Number({ examples: [2] })
                        }),
                        daily_allowance: t.Object({
                            below_40: t.Number({ examples: [3] }),
                            allowance_40_60: t.Number({ examples: [10] }),
                            allowance_60_80: t.Number({ examples: [8] }),
                            allowance_80_100: t.Number({ examples: [3] }),
                            above_100: t.Number({ examples: [1] })
                        }),
                        housing_types: t.Record(t.String({examples:["0"]}), t.Number({ examples: [10] })),
                        housing_conditions: t.Record(t.String(), t.Number())
                    }))
                }),
                204: t.Object({
                    message: t.String({ examples: ["ไม่พบข้อมูลปีการศึกษาในระบบ"] })
                }),
                404: t.Object({
                    message: t.String({ examples: ["ไม่พบข้อมูลครูที่ปรึกษา"] })
                }),
                500: t.Object({
                    message: t.String({ examples: ["เซิฟเวอร์ผิดพลาดในการวิเคราะห์ข้อมูลนักเรียน"] })
                })
            }
        })