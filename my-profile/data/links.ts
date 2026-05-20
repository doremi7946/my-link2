export interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string; // 선택 사항
}

export const dummyLinks: Link[] = [
  {
    id: "1",
    title: "인스타그램",
    url: "https://www.instagram.com/",
    icon: "https://www.google.com/s2/favicons?sz=64&domain=instagram.com",
  },
  {
    id: "2",
    title: "유튜브",
    url: "https://www.youtube.com/",
    icon: "https://www.google.com/s2/favicons?sz=64&domain=youtube.com",
  },
  {
    id: "3",
    title: "블로그",
    url: "https://velog.io/",
    icon: "https://www.google.com/s2/favicons?sz=64&domain=velog.io",
  },
  {
    id: "4",
    title: "GitHub",
    url: "https://github.com/",
    icon: "https://www.google.com/s2/favicons?sz=64&domain=github.com",
  },
  {
    id: "5",
    title: "포트폴리오",
    url: "https://my-portfolio.com",
    icon: "https://www.google.com/s2/favicons?sz=64&domain=google.com", // 예시용
  },
];
