import { storage } from "../configs/firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadImageToFirebase(file: Buffer, fileName: string): Promise<string> {
  const storageRef = ref(storage, `images/students/${fileName}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
