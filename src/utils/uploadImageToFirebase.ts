import { storage } from "../configs/firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const uploadImageToFirebase = async (file: Buffer, fileName: string ,fileType: string): Promise<string> => {
  const storageRef = ref(storage, `images/students/${fileName}`);
  await uploadBytes(storageRef, file, {
  contentType: fileType
});
  const url = await getDownloadURL(storageRef);
  return url;
}


export const uploadImage = async (file: any): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const fileName = `${file.name}_${Date.now()}`;
  return uploadImageToFirebase(buffer, fileName, file.type);
};
