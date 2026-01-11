import Image from "next/image";
import Link from "next/link";
import StockAlertPopover from "./StockAlertPopover";

interface ProfileProps {
  name: string;
  image: string;
  role: "BUYER" | "SELLER";
}

export default function Profile({ name, image, role }: ProfileProps) {
  // const profileImgSrc = role === "BUYER" ? "/images/profile-buyer.png" : "/images/profile-seller.png";
  const roleText = role === "BUYER" ? "바이어" : "셀러";
  const href = role === "BUYER" ? "/buyer/mypage" : "/seller/stores";

  return (
    <div className="flex items-center gap-5">
      <StockAlertPopover />
      <div className="bg-gray03 h-3 w-[1px]" />
      <Link
        href={href}
        className="flex cursor-pointer items-center gap-[10px]"
      >
        <Image
          className="h-10 w-10 rounded-full"
          src={image || "/icon/user_default.svg"}
          alt="profile"
          width={40}
          height={40}
        />
        <div className="text-black02 text-sm font-bold">{name}</div>
      </Link>
      <div className="bg-gray03 h-3 w-[1px]" />
      <div className="text-black02 text-sm">{roleText}</div>
    </div>
  );
}
