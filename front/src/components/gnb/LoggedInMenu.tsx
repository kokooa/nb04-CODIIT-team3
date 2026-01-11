import { postLogout } from "@/lib/api/auth";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useUserStore } from "@/stores/userStore";
import { User } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Profile from "./Profile";

interface LoggedInMenuProps {
  user: User;
}

export default function LoggedInMenu({ user }: LoggedInMenuProps) {
  const { logout } = useUserStore();
  const router = useRouter();
  const toaster = useToaster();

  const logoutMutation = useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      logout();
      toaster("info", "성공적으로 로그아웃되었습니다.");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toaster("warn", "인증이 필요합니다.");
      } else {
        toaster("warn", "로그아웃에 실패했습니다.");
      }
      logout();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCartClick = () => {
    if (user?.type === "BUYER") {
      router.push("/buyer/shopping");
    }
  };

  return (
    <div className="flex gap-[50px]">
      <Profile
        name={user.name}
        image={user.image}
        role={user.type}
      />
      <button
        className="text-gray01 px-[10.5px] py-[10px] text-sm"
        onClick={handleLogout}
      >
        로그아웃
      </button>
      {user?.type === "BUYER" && (
        <button
          onClick={handleCartClick}
          className="cursor-pointer"
        >
          <Image
            src="/icon/incart.svg"
            alt="장바구니"
            width={20}
            height={20}
          />
        </button>
      )}
    </div>
  );
}
