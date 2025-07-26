import Elysia from "elysia";
import swagger from "@elysiajs/swagger";

export default (app:Elysia) => 
    app.use(
        swagger({
          documentation: {
            info: {
              title: "เอกสาร API ระบบเยี่ยมบ้าน",
              description: "description",
              version: "0.3.0",
            },
            servers: [
              {
                url: "http://localhost:3000",
                description: "Development server",
              },
              {
                url: "https://api.example.com",
                description: "Production server",
              },
            ],
            tags: [
              {
                name: "App",
                description: "API ทั่วไปของระบบ",
              },
              {
                name: "Auth",
                description: "API สำหรับการเข้าสู่ระบบและยืนยันตัวตน ",
              },
              {
                name: "User",
                description: "API สำหรับการจัดการผู้ใช้",
              },
              {
                name: "Teacher",
                description: "API สำหรับการจัดการข้อมูลครู",
              },
              {
                name: "Year",
                description: "API สำหรับการจัดการปีการศึกษา",
              },
              {
                name: "Class",
                description: "API สำหรับการจัดการชั้นเรียน",
              },
            ],
          },
        })
      ) 