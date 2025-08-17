import { Elysia,t } from "elysia";
import { html, Html } from "@elysiajs/html";
import swagger from "./swagger/index";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";

// Connect Database
import "./database/db_setup";

// Import Controllers

import auth_route from "./routes/auth.route";
import class_route from "./routes/class.route";
import year_route from "./routes/year.route";
import user_route from "./routes/user.route";
const app = new Elysia()
  //middleware
  // HTML
  .use(html())
  // CORS
  .use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    })
  )
  // JWT
  .use(jwt({ secret: process.env.JWT_SECRET }))
  // Swagger
  .use(swagger)
  // Controllers
  .use(auth_route)
  .group("", (app) =>
    app
      .onBeforeHandle(async ({ cookie: { auth }, set, jwt,path }) => {
        try {
          if (path.startsWith("/swagger")) return;
          // ตรวจสอบว่า auth cookie มีอยู่หรือไม่
          if (!auth.value) {
            set.status = 400;
            return { message: "No token provided" };
          }
          // ตรวจสอบ JWT token
          const user = await jwt.verify(auth.value);
          
          if (!user) {
            set.status = 401;
            return { message: "Invalid token" };
          }
        } catch (error) {
          set.status = 401;
          return { message: "Unauthorized" };
        }
      })
      .state("user", { email: ""})
  .derive(async ({ cookie: { auth }, jwt, store }) => {
        if (!auth.value) return { email: "", role: "" };
        const user = await jwt.verify(auth.value);
        if (!user || typeof user !== "object") return { email: "", role: "" };

        store.user = { email: user.email ? user.email.toString() : "" };

        return {
          email: user.email ?? "",
          role: user.role ?? "",
        };
      })
      .use(class_route)
      .use(year_route)
      .use(user_route)
  )
  .post("/upload", ({body, set }) => {
    try {
      console.log(body.file);
      
      const file = body.file;
      // บันทึกไฟล์ที่อัพโหลด
      const filePath = `uploads/${file.name}`;
      console.log(`File uploaded: ${filePath}`);
      return { message: "อัพโหลดไฟล์สำเร็จ", filePath };
      
    } catch (error) {
      console.error("Error uploading file:", error);
      set.status = 500;
      return { message: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์" };
      
    }
  }, {
    body: t.Object({
      file:t.File({format:"image/*"})
    }),
    detail: { tags: ["App"], description: "Upload file" }
  })
  // Home Page
  .get(
    "/",
    () =>
      `<html>
        <head>
          <title>Visit Home API</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
          <div class="text-center p-8 bg-white shadow-lg rounded-lg">
            <h1 class="text-4xl font-bold text-blue-600 mb-6">
              ยินดีต้อนรับสู่ API ระบบเยี่ยมบ้านนักโรงเรียนบางแพปฐมพิทยา
            </h1>
            <p class="text-lg text-gray-700">
              ไปที่ 
              <a href='/swagger' class="text-blue-500 underline hover:text-blue-700">
                เอกสาร API
              </a> 
              เพื่อดูรายละเอียด API ทั้งหมดที่มีในระบบ
            </p>
          </div>
        </body>
      </html>`,
    { detail: { tags: ["App"] } }
  )
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
