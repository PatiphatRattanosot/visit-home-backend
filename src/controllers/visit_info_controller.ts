import { Elysia, t } from "elysia";
import VisitInfoModel from "../models/visit_info_model";

const create_visit_info = (app: Elysia) =>
  app.post(
    "/create",
    async ({ body, set }) => {
      try {
        const { home_img, home_description, family_img, family_description, comment, student_id, teacher_id, year_id } = body;
        // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
        
        if (!home_img || !home_description || !family_img || !family_description || !comment ||!student_id || !teacher_id || !year_id) {
          set.status = 400;
          return { message: "กรุณากรอกข้อมูลให้ครบถ้วน" };
        }
        const visit_info_exists = await VisitInfoModel.findOne({ student_id, teacher_id, year_id });
        if (visit_info_exists) {
          set.status = 400;
          return { message: "ข้อมูลเยี่ยมบ้านนี้มีอยู่แล้ว" };
        }
        // อัพโหลดไฟล์รูปภาพ
        const { uploadImage } = await import("../utils/uploadImageToFirebase");
        const home_img_url = await uploadImage(home_img);
        const family_img_url = await uploadImage(family_img);
        // สร้างข้อมูลเยี่ยมบ้านใหม่
        const visit_info = new VisitInfoModel({
          home_img: home_img_url,
          home_description,
          family_img: family_img_url,
          family_description,
          comment,
          student_id,
          teacher_id,
          year_id
        });
        await visit_info.save();
        console.log(visit_info);

        set.status = 201;
        return { message: "สร้างข้อมูลสำเร็จ", data: visit_info };
      } catch (err) {
        console.log(err);

        set.status = 500;
        return { message: "เกิดข้อผิดพลาดในการสร้างข้อมูล" };
      }
    },
    {
      body: t.Object({
        home_img: t.File(),
        home_description: t.String(),
        family_img: t.File(),
        family_description: t.String(),
        comment: t.String(),
        student_id: t.String(),
        teacher_id: t.String(),
        year_id: t.String(),
      }),
      detail: { tags: ["VisitInfo"], description: "สร้างข้อมูลเยี่ยมบ้าน" },
    }
  );


const get_visit_info_by_id = (app: Elysia) =>
  app.get(
    "/by_id/:id",
    async ({ params, set }) => {
      const visitInfo = await VisitInfoModel.findById(params.id);
      if (!visitInfo) {
        set.status = 404;
        return { message: "ไม่พบข้อมูล" };
      }
      return visitInfo;
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ["VisitInfo"], description: "ดึงข้อมูลเยี่ยมบ้านตาม id" },
    }
  );

const update_visit_info = (app: Elysia) =>
  app.put(
    "/update",
    async ({ params, body, set }) => {
      try {
        const visitInfo = await VisitInfoModel.findByIdAndUpdate(
          params.id,
          body,
          { new: true }
        );
        if (!visitInfo) {
          set.status = 404;
          return { message: "ไม่พบข้อมูลที่ต้องการแก้ไข" };
        }
        set.status = 200;
        return { message: "แก้ไขข้อมูลสำเร็จ", visitInfo };
      } catch (err) {
        set.status = 500;
        return { message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        home_img: t.String(),
        home_description: t.String(),
        family_img: t.String(),
        family_description: t.String(),
        comment: t.String(),
      }),
      detail: { tags: ["VisitInfo"], description: "แก้ไขข้อมูลเยี่ยมบ้าน" },
    }
  );

const delete_visit_info = (app: Elysia) =>
  app.delete(
    "/delete",
    async ({ body, set }) => {
      const visitInfo = await VisitInfoModel.findByIdAndDelete(body.id);
      if (!visitInfo) {
        set.status = 404;
        return { message: "ไม่พบข้อมูลที่ต้องการลบ" };
      }
      set.status = 200;
      return { message: "ลบข้อมูลสำเร็จ" };
    },
    {
      body: t.Object({ id: t.String() }),
      detail: { tags: ["VisitInfo"], description: "ลบข้อมูลเยี่ยมบ้าน" },
    }
  );

const VisitInfoController = {
  create_visit_info,
  get_visit_info_by_id,
  update_visit_info,
  delete_visit_info,
};

export default VisitInfoController;
