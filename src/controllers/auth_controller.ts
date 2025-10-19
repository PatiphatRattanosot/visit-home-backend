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
          const { access_token } = body;

          // ตรวจสอบว่ามี access_token หรือไม่
          if (!access_token) {
            set.status = 400;
            return { message: "ต้องการ Token" };
          }

          // Decode JWT token ที่ส่งมาจาก frontend
          let email: string;
          try {
            const decoded_token = await jwt.verify(access_token);
            if (!decoded_token || typeof decoded_token !== "object") {
              set.status = 401;
              return { message: "Token ไม่ถูกต้อง" };
            }

            // แก้ไขการดึง email - รวม character ที่แยกออกมา
            if (decoded_token.email) {
              // กรณีปกติที่มี property email
              email = String(decoded_token.email);
            } else {
              // กรณีที่ email ถูกแยกเป็น character แล้ว ให้รวมกลับ
              const keys = Object.keys(decoded_token)
                .filter(key => !isNaN(Number(key)) && key !== "exp")
                .sort((a, b) => Number(a) - Number(b));
              
              if (keys.length > 0) {
                email = keys.map(key => decoded_token[key]).join('');
              } else {
                set.status = 401;
                return { message: "ไม่พบอีเมลใน Token" };
              }
            }

            if (!email || typeof email !== "string") {
              set.status = 401;
              return { message: "ไม่พบอีเมลใน Token" };
            }
          } catch (tokenError) {
            console.error("Token decode error:", tokenError);
            set.status = 401;
            return { message: "Token หมดอายุหรือไม่ถูกต้อง" };
          }

          // ตรวจสอบและลบ cookie auth เดิมถ้า email ไม่ตรงกับ token ที่มีอยู่
          if (auth.value) {
            try {
              const user_token = await jwt.verify(auth.value.toString());
              if (user_token && typeof user_token === "object") {
                if (email !== user_token.email) {
                  auth.remove(); // ลบ cookie auth เดิม
                }
              }
            } catch (cookieError) {
              // หาก cookie เดิมไม่ถูกต้อง ก็ลบทิ้ง
              auth.remove();
            }
          }

          // ค้นหาผู้ใช้ในฐานข้อมูลตาม email ที่ decode ได้
          const user = await UserModel.findOne({ email: email }).select('email role first_name last_name prefix user_id class_id');

          // หากไม่พบผู้ใช้
          if (!user) {
            set.status = 404;
            return { message: "ไม่พบอีเมลนี้ในระบบ" };
          }

          // สร้าง JWT token ใหม่สำหรับ backend โดยใส่ข้อมูล email และ role ของผู้ใช้
          const token = await jwt.sign({ email, role: user.role.toString() });

          // ตั้งค่า cookie สำหรับการยืนยันตัวตน
          auth.set({
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            domain: process.env.NODE_ENV === "production" ? undefined : "localhost"
          });

          set.status = 200;
          return { message: "เข้าสู่ระบบสำเร็จ", token, user };
        } catch (error) {
          console.error("Auth error:", error);
          set.status = 500;
          return { message: "เซิฟเวอร์เกิดข้อผิดพลาดไม่สามารถเข้าสู่ระบบได้" };
        }
      },
      {
        body: t.Object({
          access_token: t.String(),
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
            message: t.String({ examples: ["ต้องการ Token"] }),
          }),
          401: t.Object({
            message: t.String({ examples: ["Token ไม่ถูกต้อง", "Token หมดอายุหรือไม่ถูกต้อง", "ไม่พบอีเมลใน Token"] }),
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
