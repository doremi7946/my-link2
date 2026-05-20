"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Pencil, Trash2, Check, X, LogIn, LogOut, Lock, Sun, Moon, Palette, Copy, QrCode, ExternalLink } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchProfile, 
  fetchLinks, 
  checkDisplayNameDuplicate, 
  checkHandleDuplicate,
  addLink, 
  updateLink, 
  deleteLink, 
  updateProfile, 
  updateDisplayName,
  updateHandle,
  updateBio, 
  Link as FirestoreLink 
} from "@/lib/firestore-service";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

// 폼 검증 스키마 정의
const linkSchema = z.object({
  title: z.string()
    .min(1, "제목을 입력해주세요.")
    .max(50, "제목은 50자 이내로 입력해주세요."),
  url: z.string()
    .min(1, "URL을 입력해주세요.")
    .refine((val: string) => {
      let url = val.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      try {
        const u = new URL(url);
        return u.hostname.includes(".");
      } catch {
        return false;
      }
    }, "유효하지 않은 URL 형식입니다."),
});

type LinkFormValues = z.infer<typeof linkSchema>;

export default function LinksPage() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 프로필 수정 관련 상태
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPhotoURL, setEditPhotoURL] = useState("");
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [displayNameChecked, setDisplayNameChecked] = useState(false);
  const [displayNameError, setDisplayNameError] = useState("");

  // 한 줄 소개(Bio) 인라인 편집 상태
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBioText, setEditBioText] = useState("");

  // 디스플레이 네임 및 핸들 인라인 편집 상태
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [editDisplayNameText, setEditDisplayNameText] = useState("");
  const [isEditingHandle, setIsEditingHandle] = useState(false);
  const [editHandleText, setEditHandleText] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deletingLink, setDeletingLink] = useState<FirestoreLink | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  // 드롭다운 기능 관련 상태
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState("bg-slate-50");
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  // Firebase Auth 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // TanStack Query 선언
  const { data: profileData } = useQuery({
    queryKey: ["profile", currentUser?.uid],
    queryFn: () => fetchProfile(currentUser!.uid),
    enabled: !!currentUser,
  });

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ["links", currentUser?.uid],
    queryFn: () => fetchLinks(currentUser!.uid),
    enabled: !!currentUser,
  });

  const isLoading = isAuthLoading || isLinksLoading;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
  });

  // --- React Query Mutations ---
  const addLinkMutation = useMutation({
    mutationFn: ({ title, url, icon }: { title: string; url: string; icon: string }) => 
      addLink(currentUser!.uid, title, url, icon),
    onMutate: async (newLinkInput) => {
      await queryClient.cancelQueries({ queryKey: ["links", currentUser?.uid] });
      const previousLinks = queryClient.getQueryData<FirestoreLink[]>(["links", currentUser?.uid]);

      const tempLink: FirestoreLink = {
        id: `temp-${Date.now()}`,
        title: newLinkInput.title,
        url: newLinkInput.url,
        icon: newLinkInput.icon,
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
      };

      queryClient.setQueryData(["links", currentUser?.uid], (old: FirestoreLink[] | undefined) => {
        return old ? [tempLink, ...old] : [tempLink];
      });

      handleOpenChange(false);
      return { previousLinks };
    },
    onError: (error, newLinkInput, context) => {
      console.error("Error adding document: ", error);
      if (context?.previousLinks) {
        queryClient.setQueryData(["links", currentUser?.uid], context.previousLinks);
      }
      toast.error("링크 추가 중 오류가 발생했습니다.");
    },
    onSuccess: () => {
      toast.success("새 링크가 추가되었습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links", currentUser?.uid] });
    }
  });

  const updateLinkMutation = useMutation({
    mutationFn: ({ linkId, title, url, icon }: { linkId: string; title: string; url: string; icon: string }) => 
      updateLink(currentUser!.uid, linkId, title, url, icon),
    onMutate: ({ linkId }) => {
      setEditingCardId(linkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", currentUser?.uid] });
      toast.success("링크가 수정되었습니다.");
      setEditingLinkId(null);
    },
    onError: (error) => {
      console.error("Error updating document: ", error);
      toast.error("링크 수정 중 오류가 발생했습니다.");
    },
    onSettled: () => {
      setEditingCardId(null);
    }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: string) => deleteLink(currentUser!.uid, linkId),
    onMutate: async (deletedLinkId) => {
      await queryClient.cancelQueries({ queryKey: ["links", currentUser?.uid] });
      const previousLinks = queryClient.getQueryData<FirestoreLink[]>(["links", currentUser?.uid]);

      setDeletingCardId(deletedLinkId);

      queryClient.setQueryData(["links", currentUser?.uid], (old: FirestoreLink[] | undefined) => {
        return old ? old.filter(link => link.id !== deletedLinkId) : [];
      });

      return { previousLinks };
    },
    onError: (error, deletedLinkId, context) => {
      console.error("Error deleting document: ", error);
      if (context?.previousLinks) {
        queryClient.setQueryData(["links", currentUser?.uid], context.previousLinks);
      }
      toast.error("링크 삭제 중 오류가 발생했습니다.");
    },
    onSuccess: () => {
      toast.success("링크가 삭제되었습니다.");
    },
    onSettled: () => {
      setDeletingCardId(null);
      queryClient.invalidateQueries({ queryKey: ["links", currentUser?.uid] });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ displayname, photoURL }: { displayname: string; photoURL: string }) => 
      updateProfile(currentUser!.uid, displayname, photoURL),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", currentUser?.uid] });
      toast.success("프로필이 성공적으로 수정되었습니다.");
      setIsProfileDialogOpen(false);
    },
    onError: (error) => {
      console.error("프로필 수정 오류:", error);
      toast.error("프로필 수정 중 오류가 발생했습니다.");
    }
  });

  const updateBioMutation = useMutation({
    mutationFn: (bio: string) => updateBio(currentUser!.uid, bio),
    onMutate: async (newBio) => {
      await queryClient.cancelQueries({ queryKey: ["profile", currentUser?.uid] });
      const previousProfile = queryClient.getQueryData<{ displayname?: string; photoURL?: string; bio?: string; handle?: string }>(["profile", currentUser?.uid]);

      queryClient.setQueryData(["profile", currentUser?.uid], (old: any) => {
        return old ? { ...old, bio: newBio } : { bio: newBio };
      });

      setIsEditingBio(false);
      return { previousProfile };
    },
    onError: (error, newBio, context) => {
      console.error("Bio 저장 오류:", error);
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile", currentUser?.uid], context.previousProfile);
      }
      toast.error("한 줄 소개 저장 중 오류가 발생했습니다.");
    },
    onSuccess: () => {
      toast.success("한 줄 소개가 수정되었습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", currentUser?.uid] });
    }
  });

  const updateDisplayNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const isDuplicate = await checkDisplayNameDuplicate(newName, currentUser!.uid);
      if (isDuplicate) {
        throw new Error("이미 사용 중인 이름입니다.");
      }
      return updateDisplayName(currentUser!.uid, newName);
    },
    onMutate: async (newName) => {
      await queryClient.cancelQueries({ queryKey: ["profile", currentUser?.uid] });
      const previousProfile = queryClient.getQueryData<{ displayname?: string; photoURL?: string; bio?: string; handle?: string }>(["profile", currentUser?.uid]);

      queryClient.setQueryData(["profile", currentUser?.uid], (old: any) => {
        return old ? { ...old, displayname: newName } : { displayname: newName };
      });

      setIsEditingDisplayName(false);
      return { previousProfile };
    },
    onError: (error: any, newName, context) => {
      console.error("DisplayName 저장 오류:", error);
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile", currentUser?.uid], context.previousProfile);
      }
      toast.error(error.message || "디스플레이 네임 저장 중 오류가 발생했습니다.");
    },
    onSuccess: () => {
      toast.success("프로필 이름이 수정되었습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", currentUser?.uid] });
    }
  });

  const updateHandleMutation = useMutation({
    mutationFn: async (newHandle: string) => {
      const isDuplicate = await checkHandleDuplicate(newHandle, currentUser!.uid);
      if (isDuplicate) {
        throw new Error("이미 사용 중인 핸들입니다.");
      }
      return updateHandle(currentUser!.uid, newHandle);
    },
    onMutate: async (newHandle) => {
      await queryClient.cancelQueries({ queryKey: ["profile", currentUser?.uid] });
      const previousProfile = queryClient.getQueryData<{ displayname?: string; photoURL?: string; bio?: string; handle?: string }>(["profile", currentUser?.uid]);

      queryClient.setQueryData(["profile", currentUser?.uid], (old: any) => {
        return old ? { ...old, handle: newHandle } : { handle: newHandle };
      });

      setIsEditingHandle(false);
      return { previousProfile };
    },
    onError: (error: any, newHandle, context) => {
      console.error("Handle 저장 오류:", error);
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile", currentUser?.uid], context.previousProfile);
      }
      toast.error(error.message || "핸들 저장 중 오류가 발생했습니다.");
    },
    onSuccess: () => {
      toast.success("핸들 이름이 수정되었습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", currentUser?.uid] });
    }
  });

  const handleSaveDisplayName = (text: string) => {
    if (!currentUser) return;
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("프로필 이름을 입력해 주세요.");
      return;
    }
    if (trimmed.length > 20) {
      toast.error("프로필 이름은 20자 이하로 입력해 주세요.");
      return;
    }
    updateDisplayNameMutation.mutate(trimmed);
  };

  const handleSaveHandle = (text: string) => {
    if (!currentUser) return;
    const trimmed = text.trim().toLowerCase();
    if (!trimmed) {
      toast.error("핸들을 입력해 주세요.");
      return;
    }
    if (!/^[a-z0-9_.]+$/.test(trimmed)) {
      toast.error("핸들은 영문 소문자, 숫자, 밑줄(_), 마침표(.)만 포함할 수 있습니다.");
      return;
    }
    if (trimmed.length > 20) {
      toast.error("핸들은 20자 이하로 입력해 주세요.");
      return;
    }
    updateHandleMutation.mutate(trimmed);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      reset();
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const defaultHandle = user.email ? user.email.split('@')[0] : "user";
      // 로그인 시 자동으로 유저 문서 생성/병합 (기본 핸들도 전송)
      await updateProfile(
        user.uid, 
        user.displayName || defaultHandle, 
        user.photoURL || "", 
        defaultHandle
      );
      
      queryClient.invalidateQueries({ queryKey: ["profile", user.uid] });
      queryClient.invalidateQueries({ queryKey: ["links", user.uid] });
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // displayname 중복 확인 검사
  const checkDisplayName = async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setDisplayNameError("디스플레이 네임을 입력해주세요.");
      setDisplayNameChecked(false);
      return;
    }

    if (trimmedName.length > 20) {
      setDisplayNameError("디스플레이 네임은 20자 이하로 입력해주세요.");
      setDisplayNameChecked(false);
      return;
    }

    // 본인의 기존 이름과 동일하면 중복검사를 통과한 것으로 처리
    const currentName = profileData?.displayname || currentUser?.displayName || currentUser?.email?.split('@')[0] || "User";
    if (trimmedName === currentName) {
      setDisplayNameError("");
      setDisplayNameChecked(true);
      toast.success("현재 사용 중인 이름입니다.");
      return;
    }

    setIsCheckingDuplicate(true);
    setDisplayNameError("");
    try {
      const isDuplicate = await checkDisplayNameDuplicate(trimmedName, currentUser!.uid);

      if (isDuplicate) {
        setDisplayNameError("이미 사용 중인 이름입니다.");
        setDisplayNameChecked(false);
      } else {
        setDisplayNameError("");
        setDisplayNameChecked(true);
        toast.success("사용 가능한 이름입니다!");
      }
    } catch (error) {
      console.error("중복 확인 에러:", error);
      setDisplayNameError("중복 확인 중 오류가 발생했습니다.");
      setDisplayNameChecked(false);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // 프로필 정보 저장
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (!displayNameChecked) {
      toast.error("프로필 이름 중복 확인을 해주세요.");
      return;
    }

    updateProfileMutation.mutate({ displayname: editDisplayName, photoURL: editPhotoURL });
  };

  // 한 줄 소개(Bio) 저장
  const handleSaveBio = async (text: string) => {
    if (!currentUser) return;
    
    const trimmedBio = text.trim();
    if (trimmedBio.length > 80) {
      toast.error("한 줄 소개는 80자 이내로 작성해주세요.");
      return;
    }

    updateBioMutation.mutate(trimmedBio);
  };

  const onSubmit = async (data: LinkFormValues) => {
    if (!currentUser) return;
    let formattedUrl = data.url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    const hostname = new URL(formattedUrl).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

    addLinkMutation.mutate({ title: data.title, url: formattedUrl, icon: faviconUrl });
  };

  const startEdit = (link: FirestoreLink, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingLinkId(link.id);
    resetEdit({ title: link.title, url: link.url });
  };

  const cancelEdit = () => {
    setEditingLinkId(null);
  };

  const onEditSubmit = async (data: LinkFormValues) => {
    if (!editingLinkId || !currentUser) return;
    const targetId = editingLinkId;
    
    let formattedUrl = data.url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }
    const hostname = new URL(formattedUrl).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

    updateLinkMutation.mutate({ linkId: targetId, title: data.title, url: formattedUrl, icon: faviconUrl });
  };

  const openDeleteModal = (link: FirestoreLink, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDeletingLink(link);
  };

  const confirmDelete = async () => {
    if (!deletingLink || !currentUser) return;
    const targetId = deletingLink.id;
    setDeletingLink(null);
    deleteLinkMutation.mutate(targetId);
  };

  // --- 드롭다운 핸들러 ---
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const changeThemeColor = () => {
    const colors = ["bg-slate-50", "bg-pink-50", "bg-cyan-50", "bg-lime-50", "bg-purple-50", "bg-amber-50"];
    const nextColor = colors[(colors.indexOf(themeColor) + 1) % colors.length];
    setThemeColor(nextColor);
  };

  const copyMyLink = () => {
    const handle = profileData?.handle || currentUser?.email?.split('@')[0] || "user";
    const publicUrl = `${window.location.origin}/${handle}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("링크가 복사되었습니다!", {
      description: publicUrl,
    });
  };

  const openQrCode = () => {
    const handle = profileData?.handle || currentUser?.email?.split('@')[0] || "user";
    const publicUrl = `${window.location.origin}/${handle}`;
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(publicUrl)}`;
    setQrUrl(qrImage);
    setIsQrDialogOpen(true);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // 비로그인 상태 화면
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="z-10 bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <LogIn className="w-8 h-8 text-slate-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            My Link
          </h1>
          <p className="text-slate-500 mb-8">
            로그인 후 나만의 링크 포트폴리오를 만들어보세요!<br/>
            모든 링크를 한 곳에 모아 공유할 수 있습니다.
          </p>

          <Button 
            onClick={loginWithGoogle}
            className="w-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 h-12 font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            구글 계정으로 계속하기
          </Button>

          <div className="mt-6 text-xs text-slate-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            안전하게 로그인됩니다.
          </div>
        </div>
      </div>
    );
  }

  // 로그인 상태 화면
  return (
    <div className={`min-h-screen flex flex-col items-center ${isDarkMode ? 'dark bg-slate-950 text-slate-50' : `${themeColor} text-slate-900`} transition-colors duration-300 font-sans relative overflow-x-hidden`}>
      
      {/* 헤더 */}
      <header className={`w-full border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-200'} backdrop-blur-md flex justify-between items-center p-4 lg:px-8 z-20 sticky top-0 transition-colors duration-300`}>
        <div className="text-xl font-bold tracking-tight flex items-center gap-2">
          MyLink<span className="text-blue-500">.</span>
        </div>
        <div className="flex items-center gap-4">
          
          {/* 내 페이지 바로가기 링크 */}
          <a
            href={`/${profileData?.handle || currentUser.email?.split('@')[0] || "user"}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300' : 'border-slate-200 bg-white/50 hover:bg-slate-100 text-slate-700'}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            내 페이지 보기
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger className={`h-10 w-10 rounded-full border shadow-sm hover:scale-105 transition-transform overflow-hidden p-0 outline-none ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
              <img 
                src={profileData?.photoURL || currentUser.photoURL || "/avatar.png"} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-56 rounded-xl border shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-semibold text-xs text-slate-500 py-2">
                  내 계정 설정
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => {
                  const handle = profileData?.handle || currentUser.email?.split('@')[0] || "user";
                  window.open(`/${handle}`, "_blank");
                }} 
                className="font-medium cursor-pointer py-2 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-md"
              >
                <ExternalLink className="mr-3 h-4 w-4" />
                내 페이지 보기
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setEditDisplayName(profileData?.displayname || currentUser.displayName || currentUser.email?.split('@')[0] || "User");
                  setEditPhotoURL(profileData?.photoURL || currentUser.photoURL || "");
                  setDisplayNameChecked(true);
                  setDisplayNameError("");
                  setIsProfileDialogOpen(true);
                }} 
                className="font-medium cursor-pointer py-2 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-md"
              >
                <Pencil className="mr-3 h-4 w-4" />
                프로필 수정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleDarkMode} className="font-medium cursor-pointer py-2 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-md">
                {isDarkMode ? <Sun className="mr-3 h-4 w-4" /> : <Moon className="mr-3 h-4 w-4" />}
                {isDarkMode ? "라이트 모드" : "다크 모드"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={changeThemeColor} className="font-medium cursor-pointer py-2 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-md">
                <Palette className="mr-3 h-4 w-4" />
                테마 배경 변경
              </DropdownMenuItem>
              <DropdownMenuSeparator className={`my-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <DropdownMenuItem onClick={copyMyLink} className="font-medium cursor-pointer py-2 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-md">
                <Copy className="mr-3 h-4 w-4" />
                내 링크 복사하기
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openQrCode} className="font-medium cursor-pointer py-2 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-md">
                <QrCode className="mr-3 h-4 w-4" />
                QR 코드 생성
              </DropdownMenuItem>
              <DropdownMenuSeparator className={`my-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <DropdownMenuItem onClick={handleLogout} className="font-medium cursor-pointer py-2 text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 rounded-md">
                <LogOut className="mr-3 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="w-full max-w-xl flex flex-col gap-6 relative z-10 py-12 px-6">
        
        {/* 프로필 영역 */}
        <div className="flex flex-col items-center mb-6 gap-4">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full overflow-hidden border-2 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-200 bg-white'}`}>
              <img 
                src={profileData?.photoURL || currentUser.photoURL || "/avatar.png"} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => {
                setEditDisplayName(profileData?.displayname || currentUser.displayName || currentUser.email?.split('@')[0] || "User");
                setEditPhotoURL(profileData?.photoURL || currentUser.photoURL || "");
                setDisplayNameChecked(true);
                setDisplayNameError("");
                setIsProfileDialogOpen(true);
              }}
              className={`absolute bottom-0 right-0 p-1.5 rounded-full border shadow-sm transition-all hover:scale-110 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}
              title="프로필 수정"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          {/* 디스플레이 네임 (Username) 영역 */}
          {isEditingDisplayName ? (
            <div className="w-full max-w-sm flex items-center gap-2 mt-1">
              <Input
                value={editDisplayNameText}
                onChange={(e) => setEditDisplayNameText(e.target.value)}
                maxLength={20}
                placeholder="프로필 이름을 입력해 주세요"
                className={`h-9 text-base font-semibold rounded-lg flex-1 text-center focus-visible:ring-slate-400 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`}
                autoFocus
                disabled={updateDisplayNameMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveDisplayName(editDisplayNameText);
                  } else if (e.key === "Escape") {
                    setIsEditingDisplayName(false);
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSaveDisplayName(editDisplayNameText)}
                disabled={updateDisplayNameMutation.isPending}
                className={`h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20 dark:hover:text-green-400 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              >
                {updateDisplayNameMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditingDisplayName(false)}
                disabled={updateDisplayNameMutation.isPending}
                className={`h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              onClick={() => {
                setEditDisplayNameText(profileData?.displayname || currentUser.displayName || currentUser.email?.split('@')[0] || "User");
                setIsEditingDisplayName(true);
              }}
              className="group/name flex items-center gap-1.5 cursor-pointer max-w-sm px-3 py-1 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <h1 className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
                {profileData?.displayname || currentUser.displayName || currentUser.email?.split('@')[0] || "User"}
              </h1>
              <Pencil className={`h-3.5 w-3.5 shrink-0 opacity-0 group-hover/name:opacity-100 transition-opacity duration-150 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
          )}

          {/* 핸들 (@이메일 아이디) 영역 */}
          {isEditingHandle ? (
            <div className="w-full max-w-sm flex items-center gap-2 mt-1">
              <div className="relative flex-1 flex items-center">
                <span className={`absolute left-3 text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>@</span>
                <Input
                  value={editHandleText}
                  onChange={(e) => setEditHandleText(e.target.value)}
                  maxLength={20}
                  placeholder="아이디"
                  className={`h-9 pl-7 text-sm rounded-lg flex-1 focus-visible:ring-slate-400 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`}
                  autoFocus
                  disabled={updateHandleMutation.isPending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveHandle(editHandleText);
                    } else if (e.key === "Escape") {
                      setIsEditingHandle(false);
                    }
                  }}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSaveHandle(editHandleText)}
                disabled={updateHandleMutation.isPending}
                className={`h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20 dark:hover:text-green-400 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              >
                {updateHandleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditingHandle(false)}
                disabled={updateHandleMutation.isPending}
                className={`h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              onClick={() => {
                setEditHandleText(profileData?.handle || currentUser.email?.split('@')[0] || "user");
                setIsEditingHandle(true);
              }}
              className="group/handle flex items-center gap-1.5 cursor-pointer max-w-sm px-3 py-1 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors mt-[-8px]"
            >
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                @{profileData?.handle || currentUser.email?.split('@')[0] || "user"}
              </p>
              <Pencil className={`h-3 w-3 shrink-0 opacity-0 group-hover/handle:opacity-100 transition-opacity duration-150 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
          )}

          {/* 한 줄 소개 (Bio) 영역 */}
          {isEditingBio ? (
            <div className="w-full max-w-sm flex items-center gap-2 mt-1">
              <Input
                value={editBioText}
                onChange={(e) => setEditBioText(e.target.value)}
                maxLength={80}
                placeholder="한 줄 소개를 입력해주세요."
                className={`h-9 text-sm rounded-lg flex-1 focus-visible:ring-slate-400 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`}
                autoFocus
                disabled={updateBioMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveBio(editBioText);
                  } else if (e.key === "Escape") {
                    setIsEditingBio(false);
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSaveBio(editBioText)}
                disabled={updateBioMutation.isPending}
                className={`h-9 w-9 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20 dark:hover:text-green-400 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              >
                {updateBioMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditingBio(false)}
                disabled={updateBioMutation.isPending}
                className={`h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              onClick={() => {
                setEditBioText(profileData?.bio || "");
                setIsEditingBio(true);
              }}
              className="group/bio flex items-center gap-1.5 cursor-pointer max-w-sm mt-1 px-3 py-1 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <p className={`text-sm text-center break-all select-none ${profileData?.bio ? (isDarkMode ? 'text-slate-300' : 'text-slate-600') : 'text-slate-400 italic font-normal'}`}>
                {profileData?.bio || "한 줄 소개를 입력해주세요."}
              </p>
              <Pencil className={`h-3 w-3 shrink-0 opacity-0 group-hover/bio:opacity-100 transition-opacity duration-150 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
          )}
        </div>

        {/* 링크 추가 버튼과 목록을 묶는 컨테이너 */}
        <div className="w-full flex flex-col gap-3">
          {/* 링크 추가 버튼 */}
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className={`w-full h-14 rounded-xl shadow-sm transition-all font-medium text-base ${isDarkMode ? 'bg-slate-100 text-slate-900 hover:bg-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            <Plus className="mr-2 h-5 w-5" /> 새 링크 추가
          </Button>

          {/* 링크 목록 */}
        {isLoading ? (
          <div className="flex flex-col gap-3 w-full animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-16 rounded-xl flex items-center p-4 border shadow-sm ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                <div className={`flex-1 mx-4 h-5 rounded-md ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
              </div>
            ))}
          </div>
        ) : links.length > 0 || addLinkMutation.isPending ? (
          <div className="flex flex-col gap-3 w-full">
            {addLinkMutation.isPending && (
              <div className={`h-16 rounded-xl flex items-center p-4 border shadow-sm animate-pulse ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Loader2 className={`h-5 w-5 animate-spin mr-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <span className="font-medium text-sm">링크 추가 중...</span>
              </div>
            )}
            
            {links.map((link) => {
              if (deletingCardId === link.id) {
                return (
                  <div key={link.id} className={`h-16 rounded-xl flex items-center p-4 border shadow-sm animate-pulse ${isDarkMode ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
                    <Loader2 className="h-5 w-5 animate-spin text-red-500 mr-4" />
                    <span className="font-medium text-sm text-red-500">링크 삭제 중...</span>
                  </div>
                );
              }

              if (editingCardId === link.id) {
                return (
                  <div key={link.id} className={`h-16 rounded-xl flex items-center p-4 border shadow-sm animate-pulse ${isDarkMode ? 'bg-amber-950/20 border-amber-900/30' : 'bg-amber-50 border-amber-100'}`}>
                    <Loader2 className="h-5 w-5 animate-spin text-amber-500 mr-4" />
                    <span className="font-medium text-sm text-amber-600">링크 수정 중...</span>
                  </div>
                );
              }

              const isEditing = editingLinkId === link.id;

              if (isEditing) {
                return (
                  <Card key={link.id} className={`border rounded-xl shadow-sm p-4 transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <form onSubmit={handleEditSubmit(onEditSubmit)} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <Input 
                          {...registerEdit("title")} 
                          placeholder="링크 제목 (예: 내 포트폴리오)"
                          className={`h-10 rounded-lg text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700' : 'bg-white border-slate-200 focus-visible:ring-slate-300'} ${editErrors.title ? "border-red-500" : ""}`}
                        />
                        {editErrors.title && <p className="text-xs text-red-500">{editErrors.title.message}</p>}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Input 
                          {...registerEdit("url")} 
                          placeholder="URL 주소 (예: https://example.com)"
                          className={`h-10 rounded-lg text-sm ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus-visible:ring-slate-700' : 'bg-white border-slate-200 focus-visible:ring-slate-300'} ${editErrors.url ? "border-red-500" : ""}`}
                        />
                        {editErrors.url && <p className="text-xs text-red-500">{editErrors.url.message}</p>}
                      </div>
                      <div className="flex gap-2 justify-end mt-1">
                        <Button type="button" variant="ghost" onClick={cancelEdit} className={`rounded-lg h-9 text-sm px-4 ${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                          취소
                        </Button>
                        <Button type="submit" disabled={updateLinkMutation.isPending} className={`rounded-lg h-9 text-sm px-4 shadow-sm ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                          {updateLinkMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                          저장
                        </Button>
                      </div>
                    </form>
                  </Card>
                );
              }

              return (
                <div key={link.id} className={`group relative border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center h-16 w-full">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex items-center justify-center px-5 outline-none relative"
                    >
                      <div className="absolute left-4">
                        {link.icon ? (
                          <div className={`w-10 h-10 flex items-center justify-center border rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <img
                              src={link.icon}
                              alt={`${link.title} icon`}
                              className="w-6 h-6 object-contain"
                            />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 border rounded-full ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                        )}
                      </div>
                      
                      <span className={`font-medium text-[15px] text-center px-16 truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {link.title}
                      </span>
                    </a>
                    
                    {/* 액션 버튼 영역 */}
                    <div className={`absolute right-0 top-0 bottom-0 flex border-l opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                      <button 
                        onClick={(e) => startEdit(link, e)} 
                        className={`px-4 flex items-center justify-center transition-colors border-r ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                        title="수정"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => openDeleteModal(link, e)} 
                        className={`px-4 flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-red-950/30 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`text-center py-16 border rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <p className={`font-medium text-base mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>아직 등록된 링크가 없습니다.</p>
            <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>첫 링크를 추가해보세요.</p>
          </div>
        )}
        
        </div>
      </main>

      {/* 링크 추가 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange} className={isDarkMode ? 'bg-slate-900' : themeColor}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-white' : ''}>새 링크 추가</DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
            추가할 링크의 제목과 URL을 입력해주세요. URL을 기반으로 아이콘이 자동 적용됩니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>링크 제목</label>
            <Input 
              id="title"
              {...register("title")}
              placeholder="예: 내 포트폴리오 사이트" 
              className={`rounded-lg h-11 text-sm focus-visible:ring-slate-400 ${errors.title ? "border-red-500" : ""} ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-200'}`}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="url" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>URL 주소</label>
            <Input 
              id="url"
              {...register("url")}
              placeholder="예: https://example.com" 
              className={`rounded-lg h-11 text-sm focus-visible:ring-slate-400 ${errors.url ? "border-red-500" : ""} ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-200'}`}
            />
            {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
          </div>
          <Button 
            type="submit" 
            disabled={addLinkMutation.isPending}
            className={`w-full mt-4 h-12 text-sm font-semibold rounded-xl shadow-sm transition-all ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            {addLinkMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {addLinkMutation.isPending ? "추가 중..." : "추가 완료"}
          </Button>
        </form>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)} className={isDarkMode ? 'bg-slate-900' : themeColor}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-white' : ''}>정말 삭제하시겠습니까?</DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
            이 작업은 되돌릴 수 없으며 링크가 영구적으로 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <div className={`mt-4 p-3 rounded-lg border flex items-center text-sm font-medium ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
          {deletingLink?.title}
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button 
            variant="ghost" 
            onClick={() => setDeletingLink(null)} 
            className={`rounded-xl flex-1 h-11 font-medium ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            취소
          </Button>
          <Button 
            onClick={confirmDelete} 
            disabled={deleteLinkMutation.isPending} 
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex-1 h-11 font-medium shadow-sm"
          >
            {deleteLinkMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            삭제하기
          </Button>
        </div>
      </Dialog>

      {/* QR 코드 확인 모달 */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen} className={isDarkMode ? 'bg-slate-900' : themeColor}>
        <DialogHeader>
          <DialogTitle className={`text-center ${isDarkMode ? 'text-white' : ''}`}>
            내 프로필 QR 코드
          </DialogTitle>
          <DialogDescription className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            스캔하면 내 프로필로 바로 연결됩니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 mt-2">
          <div className="p-4 bg-white border rounded-2xl shadow-sm mb-6">
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
              </div>
            )}
          </div>
          <Button 
            onClick={() => {
              if (qrUrl) {
                const link = document.createElement('a');
                link.href = qrUrl;
                link.download = `mylink-qr-${profileData?.displayname || "profile"}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            className={`w-full font-medium text-sm rounded-xl h-11 shadow-sm ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            다운로드
          </Button>
        </div>
      </Dialog>

      {/* 프로필 수정 다이얼로그 */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} className={isDarkMode ? 'bg-slate-900' : themeColor}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-white' : ''}>프로필 수정</DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
            프로필 이름과 아바타 이미지를 수정할 수 있습니다. 이름은 다른 사용자와 중복될 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 mt-2">
          {/* 아바타 미리보기 및 이미지 입력 */}
          <div className="flex flex-col items-center gap-3 my-2">
            <div className={`w-20 h-20 rounded-full overflow-hidden border-2 shadow-sm ${isDarkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-200 bg-white'}`}>
              <img 
                src={editPhotoURL || "/avatar.png"} 
                alt="Profile Preview" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avatar.png";
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="photoURL" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>프로필 이미지 URL</label>
              <Input 
                id="photoURL"
                value={editPhotoURL}
                onChange={(e) => setEditPhotoURL(e.target.value)}
                placeholder="https://example.com/image.png" 
                className={`rounded-lg h-10 text-sm focus-visible:ring-slate-400 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-200'}`}
              />
            </div>
          </div>

          {/* 디스플레이 네임 입력 및 중복 체크 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="editDisplayName" className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>프로필 이름 (Display Name)</label>
            <div className="flex gap-2">
              <Input 
                id="editDisplayName"
                value={editDisplayName}
                onChange={(e) => {
                  setEditDisplayName(e.target.value);
                  setDisplayNameChecked(false);
                  setDisplayNameError("");
                }}
                placeholder="프로필 이름을 입력해 주세요" 
                className={`rounded-lg h-11 text-sm focus-visible:ring-slate-400 flex-1 ${displayNameError ? "border-red-500" : ""} ${displayNameChecked ? "border-green-500" : ""} ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-200'}`}
              />
              <Button 
                type="button" 
                onClick={() => checkDisplayName(editDisplayName)}
                disabled={isCheckingDuplicate}
                variant="outline"
                className={`rounded-lg h-11 text-sm px-4 ${isDarkMode ? 'border-slate-800 text-white hover:bg-slate-800' : 'border-slate-200 text-slate-800 hover:bg-slate-50'}`}
              >
                {isCheckingDuplicate && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                중복 확인
              </Button>
            </div>
            {displayNameError && <p className="text-xs text-red-500 font-medium">{displayNameError}</p>}
            {displayNameChecked && (
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 사용 가능한 이름입니다!
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setIsProfileDialogOpen(false)} 
              className={`rounded-xl flex-1 h-11 font-medium ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfileMutation.isPending || !displayNameChecked}
              className={`rounded-xl flex-1 h-11 font-medium shadow-sm ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'} disabled:opacity-50`}
            >
              {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              저장하기
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
