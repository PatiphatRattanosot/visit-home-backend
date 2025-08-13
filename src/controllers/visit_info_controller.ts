import { Elysia, t } from "elysia";
import VisitInfoModel from "../models/visit_info_model";

const createVisitInfo = (app: Elysia) =>
  app.post(
    "/visit-info",
    async ({ body, set }) => {
      try {
        const {
          home_img,
          home_description,
          family_img,
          family_description,
          comment,
        } = body;
        // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
        if (
          !home_img ||
          !home_description ||
          !family_img ||
          !family_description ||
          !comment
        ) {
          set.status = 400;
          return { message: "กรุณากรอกข้อมูลให้ครบถ้วน" };
        }
        // สร้างข้อมูลเยี่ยมบ้านใหม่
        const visitInfo = new VisitInfoModel(body);
        await visitInfo.save();
        set.status = 201;
        return { message: "สร้างข้อมูลสำเร็จ", visitInfo };
      } catch (err) {
        set.status = 500;
        return { message: "เกิดข้อผิดพลาดในการสร้างข้อมูล" };
      }
    },
    {
      body: t.Object({
        home_img: t.String(),
        home_description: t.String(),
        family_img: t.String(),
        family_description: t.String(),
        comment: t.String(),
      }),
      detail: { tags: ["VisitInfo"], description: "สร้างข้อมูลเยี่ยมบ้าน" },
    }
  );

const getAllVisitInfo = (app: Elysia) =>
  app.get(
    "/visit-info",
    async () => {
      return await VisitInfoModel.find();
    },
    {
      detail: {
        tags: ["VisitInfo"],
        description: "ดึงข้อมูลเยี่ยมบ้านทั้งหมด",
      },
    }
  );

const getVisitInfoById = (app: Elysia) =>
  app.get(
    "/visit-info/:id",
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

const updateVisitInfo = (app: Elysia) =>
  app.put(
    "/visit-info/:id",
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

const deleteVisitInfo = (app: Elysia) =>
  app.delete(
    "/visit-info/:id",
    async ({ params, set }) => {
      const visitInfo = await VisitInfoModel.findByIdAndDelete(params.id);
      if (!visitInfo) {
        set.status = 404;
        return { message: "ไม่พบข้อมูลที่ต้องการลบ" };
      }
      set.status = 200;
      return { message: "ลบข้อมูลสำเร็จ" };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ["VisitInfo"], description: "ลบข้อมูลเยี่ยมบ้าน" },
    }
  );

const VisitInfoController = {
  createVisitInfo,
  getAllVisitInfo,
  getVisitInfoById,
  updateVisitInfo,
  deleteVisitInfo,
};

export default VisitInfoController;
