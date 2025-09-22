import Elysia, { t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import UserModel from "../models/users/user_model";

// ฟังก์ชัน sign ใช้สำหรับสร้าง endpoint "/sign" เพื่อเข้าสู่ระบบ
const sign = async (app: Elysia) =>
  app
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET })) // ใช้ middleware สำหรับจัดการ JWT โดยใช้ secret key จาก environment variable
    .post(
      "/sign",
      async ({ body, set, jwt, cookie: { auth } }) => {
        try {
          const { email } = body;

          // ตรวจสอบว่ามี email หรือไม่
          if (!email) {
            set.status = 400; // ตั้งค่า HTTP status เป็น 400 (Bad Request)
            return { message: "ต้องการอีเมล" };
          }
          // ตรวจสอบและลบ cookie auth เดิมถ้า email ไม่ตรงกับ token ที่มีอยู่
          if (auth.value) {
            const user_token = await jwt.verify(auth.value.toString());
            if (user_token && typeof user_token === "object") {
              if (email != user_token.email) {
                auth.remove(); // ลบ cookie auth เดิม
              }
            }
          }



          // ค้นหาผู้ใช้ในฐานข้อมูลตาม email ที่ได้รับมา
          const user = await UserModel.findOne({ email: email }).select('email role first_name last_name prefix user_id ');

          // หากไม่พบผู้ใช้
          if (!user) {
            set.status = 404; // ตั้งค่า HTTP status เป็น 404 (Not Found)
            return { message: "ไม่พบอีเมลนี้ในระบบ" };
          }

          // สร้าง JWT token โดยใส่ข้อมูล email และ role ของผู้ใช้
          const token = await jwt.sign({ email, role: user.role.toString() });
          // ตั้งค่า cookie สำหรับการยืนยันตัวตน
          auth.set({
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000, 
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // สำคัญมาก! เพื่อให้ทำงานข้าม domain
            domain: process.env.NODE_ENV === "production" ? undefined : "localhost" // ไม่ตั้ง domain ใน production เพื่อให้ยืดหยุ่น
          });

          set.status = 200; // ตั้งค่า HTTP status เป็น 200 (OK)
          return { message: "เข้าสู่ระบบสำเร็จ", token, user }; // ส่งข้อความแจ้งเตือนสำเร็จพร้อม token และข้อมูลผู้ใช้
        } catch (error) {
          // หากเกิดข้อผิดพลาด
          set.status = 500; // ตั้งค่า HTTP status เป็น 500 (Internal Server Error)
          return { message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเข้าสู่ระบบได้" };
        }
      },
      {
        body: t.Object({
          email: t.String({ examples: ["bp12345@bangpaeschool.ac.th", "123bp@bangpaeschool.ac.th", "654259017@webmail.npru.ac.th"] }),
        }),
        detail: {
          tags: ["Auth"],
          description: "ฟังชั่นเข้าใช้งานระบบ",
        },
        response: {
          200: t.Object({
            message: t.String({ examples: ["เข้าสู่ระบบสำเร็จ"] }),
            token: t.Optional(t.String()),
            user: t.Optional(t.Any()),
          }),
          400: t.Object({
            message: t.String({ examples: ["ต้องการอีเมล"] }),
          }),
          404: t.Object({
            message: t.String({ examples: ["ไม่พบอีเมลนี้ในระบบ"] }),
          }),
          500: t.Object({
            message: t.String({ examples: ["เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเข้าสู่ระบบได้"] }),
          }),
        }
      }
    );

const sign_out = async (app: Elysia) =>
  app.post(
    "/sign-out",
    async ({ set, cookie: { auth } }) => {
      auth.remove();
      set.status = 200;
      return { message: "ออกจากระบบสำเร็จ" };
    },
    {
      detail: {
        tags: ["Auth"],
        description: "ฟังชั่นออกจากระบบ",
      },
      response: {
        200: t.Object({
          message: t.String({ examples: ["ออกจากระบบสำเร็จ"] }),
        }),
      },
    }
  );

const AuthController = {
  sign,
  sign_out,
};

export default AuthController;
