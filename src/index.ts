import { Elysia, t } from "elysia";
import { html, Html } from "@elysiajs/html";
import swagger from "./swagger/index";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { logger } from "@tqman/nice-logger";
import { elysiaXSS } from 'elysia-xss'

// Connect Database
import "./database/db_setup";

// Import Controllers
import auth_route from "./routes/auth.route";
import class_route from "./routes/class.route";
import year_route from "./routes/year.route";
import user_route from "./routes/user.route";
import sdq_route from "./routes/sdq.route";
import visit_info from "./routes/visit-info.route";
import scheduleRoute from "./routes/schedule.route";
import visualiz from "./controllers/visualiz_controller";

const app = new Elysia()
  //middleware
  // HTML
  .use(html())
  // CORS
  .use(
    cors({
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "https://project-visit-home.xyz",
        "https://project-visit-home.vercel.app",
        "http://206.189.92.255:3000",
      ],
      credentials: true,
    })
  )
  // JWT
  .use(jwt({ secret: process.env.JWT_SECRET, exp: '1d' }))
  // Logger
  .use(logger({
    mode: "live", // "live" or "combined" (default: "combined")
    withTimestamp: true, // optional (default: false)
  }))
  // XSS Protection 
  .use(elysiaXSS({}))
  // Swagger
  .use(swagger)
  // Controllers
  .group("/api", (app) =>
    app
      .use(auth_route)
      .group("", (app) =>
        app
          .onBeforeHandle(async ({ cookie: { auth }, set, jwt, path ,}) => {
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
          .state("user", { email: "", roles: [] as string[] })
          .derive(async ({ cookie: { auth }, jwt, store }) => {
            if (!auth.value) return { email: "", roles: [] };
            const user = await jwt.verify(auth.value);
            // console.log(user);

            if (!user || typeof user !== "object") return { email: "", roles: [] };

            // แยก role string เป็น array (รองรับทั้ง "Teacher,Admin" และ "Teacher")
            const userRoles = user.role
              ? user.role.toString().split(',').map((r: string) => r.trim())
              : [];
            // console.log(userRoles);

            store.user = {
              email: user.email ? user.email.toString() : "",
              roles: userRoles
            };

            return {
              email: user.email ?? "",
              roles: userRoles,
            };
          })
          .use(class_route)
          .use(year_route)
          .use(user_route)
          .use(sdq_route)
          .use(visit_info)
          .use(scheduleRoute)
          .use(visualiz)
      )
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
              <a href='/api/swagger' class="text-blue-500 underline hover:text-blue-700">
                เอกสาร API
              </a> 
              เพื่อดูรายละเอียด API ทั้งหมดที่มีในระบบ
            </p>
          </div>
        </body>
      </html>`,
        { detail: { tags: ["App"] } }
      )
  )

  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.url}api`
);
