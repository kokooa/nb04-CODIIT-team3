import { menuItems } from "@/data/sellerMenuItems";
import InquiryPage from "../../buyer/inquiry/page";

export default function SellerInquiryPage() {
  return (
    <InquiryPage
      type={"SELLER"}
      menuItem={menuItems}
    />
  );
}
