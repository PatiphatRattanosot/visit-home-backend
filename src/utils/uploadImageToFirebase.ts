import { storage } from "../configs/firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadImageToFirebase(file: Buffer, fileName: string ,fileType: string): Promise<string> {
  const storageRef = ref(storage, `images/students/${fileName}`);
  await uploadBytes(storageRef, file, {
  contentType: fileType
});
  const url = await getDownloadURL(storageRef);
  return url;
}
