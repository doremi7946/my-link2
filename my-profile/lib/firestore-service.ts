import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "./firebase";

export interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  clicks?: number;
  createdAt?: any;
  updatedAt?: any;
}

// 1. 프로필 정보 단발성 조회
export async function fetchProfile(uid: string) {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) {
    return docSnap.data() as { displayname?: string; photoURL?: string; bio?: string; handle?: string };
  }
  return null;
}

// 2. 링크 목록 단발성 조회
export async function fetchLinks(uid: string): Promise<Link[]> {
  const q = query(collection(db, "users", uid, "links"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const linksData: Link[] = [];
  querySnapshot.forEach((docSnap) => {
    linksData.push({ id: docSnap.id, ...docSnap.data() } as Link);
  });
  return linksData;
}

// 3. 디스플레이 네임 중복 확인
export async function checkDisplayNameDuplicate(name: string, currentUid: string): Promise<boolean> {
  const trimmedName = name.trim();
  const q = query(collection(db, "users"), where("displayname", "==", trimmedName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.some(docSnap => docSnap.id !== currentUid);
}

// 3-1. 핸들(이메일 아이디) 중복 확인
export async function checkHandleDuplicate(handle: string, currentUid: string): Promise<boolean> {
  const trimmedHandle = handle.trim().toLowerCase();
  const q = query(collection(db, "users"), where("handle", "==", trimmedHandle));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.some(docSnap => docSnap.id !== currentUid);
}

// 4. 링크 추가
export async function addLink(uid: string, title: string, url: string, icon: string) {
  return await addDoc(collection(db, "users", uid, "links"), {
    title: title.trim(),
    url: url.trim(),
    icon,
    createdAt: serverTimestamp(),
  });
}

// 5. 링크 수정
export async function updateLink(uid: string, linkId: string, title: string, url: string, icon: string) {
  const linkRef = doc(db, "users", uid, "links", linkId);
  return await updateDoc(linkRef, {
    title: title.trim(),
    url: url.trim(),
    icon,
    updatedAt: serverTimestamp(),
  });
}

// 6. 링크 삭제
export async function deleteLink(uid: string, linkId: string) {
  return await deleteDoc(doc(db, "users", uid, "links", linkId));
}

// 7. 프로필 이름/아바타/핸들 수정
export async function updateProfile(uid: string, displayname: string, photoURL: string, handle?: string) {
  const userRef = doc(db, "users", uid);
  const data: any = {
    displayname: displayname.trim(),
    photoURL: photoURL.trim(),
    updatedAt: serverTimestamp(),
  };
  if (handle) {
    data.handle = handle.trim().toLowerCase();
  }
  return await setDoc(userRef, data, { merge: true });
}

// 7-1. 프로필 이름(displayname)만 단독 수정
export async function updateDisplayName(uid: string, displayname: string) {
  const userRef = doc(db, "users", uid);
  return await setDoc(userRef, {
    displayname: displayname.trim(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// 7-2. 핸들(handle)만 단독 수정
export async function updateHandle(uid: string, handle: string) {
  const userRef = doc(db, "users", uid);
  return await setDoc(userRef, {
    handle: handle.trim().toLowerCase(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// 8. 한 줄 소개(Bio) 수정
export async function updateBio(uid: string, bio: string) {
  const userRef = doc(db, "users", uid);
  return await setDoc(userRef, {
    bio: bio.trim(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// 9. 디스플레이 네임 또는 핸들로 프로필 및 UID 조회
export async function fetchProfileByDisplayName(displayName: string) {
  const trimmed = displayName.trim();
  
  // 1. displayname 필드로 검색
  const qName = query(collection(db, "users"), where("displayname", "==", trimmed));
  const querySnapshotName = await getDocs(qName);
  
  if (!querySnapshotName.empty) {
    const docSnap = querySnapshotName.docs[0];
    return {
      uid: docSnap.id,
      ...docSnap.data()
    } as { uid: string; displayname?: string; photoURL?: string; bio?: string; handle?: string };
  }
  
  // 2. displayname이 없다면 handle 필드로 재검색 (대소문자 구분 없이 소문자로 변환)
  const qHandle = query(collection(db, "users"), where("handle", "==", trimmed.toLowerCase()));
  const querySnapshotHandle = await getDocs(qHandle);
  
  if (!querySnapshotHandle.empty) {
    const docSnap = querySnapshotHandle.docs[0];
    return {
      uid: docSnap.id,
      ...docSnap.data()
    } as { uid: string; displayname?: string; photoURL?: string; bio?: string; handle?: string };
  }
  
  return null;
}

// 10. 링크 클릭 카운트 증가
export async function incrementLinkClick(uid: string, linkId: string) {
  const linkRef = doc(db, "users", uid, "links", linkId);
  return await updateDoc(linkRef, {
    clicks: increment(1),
  });
}

