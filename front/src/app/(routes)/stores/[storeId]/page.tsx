import StoreInfo from "./components/StoreInfo";
import StoreProductList from "./components/StoreProductList";

const StoreDetailPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  return (
    <div className="w-380 space-y-20">
      <StoreInfo storeId={storeId} />
      <StoreProductList storeId={storeId} />
    </div>
  );
};

export default StoreDetailPage;
