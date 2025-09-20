import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    prefix: { type: String, required: true },
    role: [
      { type: String, required: true, enum: ["Admin", "Teacher", "Student"], default: "Student" },
    ],
    type: { type: String, required: true, enum: ["Teacher", "Student"] },
    phone: { type: String },      // เพิ่มถ้าต้องการ
    status: { type: String },     // เพิ่มถ้าต้องการ
  },
  {
    timestamps: true,
    discriminatorKey: "type",
    // toObject: {
    //   virtuals: true,
    //   transform: (doc, ret) => {
    //     ret.id = ret._id.toString();
    //     delete ret._id;
    //     delete ret.__v;
    //     return ret;
    //   }
    // }
  }
);

// UserSchema.virtual('id').get(function () {
//   return this._id.toString();
// });

const UserModel = model("User", UserSchema);
export default UserModel;