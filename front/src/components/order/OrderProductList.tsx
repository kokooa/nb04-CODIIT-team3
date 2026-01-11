import OrderProductCard from "@/components/order/OrderProductCard";
import { useOrderStore } from "@/store/orderStore";
import { ProductInfoData } from "@/types/Product";

export default function OrderProductList() {
  const selectedItems = useOrderStore((state) => state.selectedItems);

  return (
    <section className="mb-8">
      <h2 className="border-b border-black px-2 py-2.5 text-xl font-extrabold">주문상품 ({selectedItems.length})</h2>
      <div className="mt-8 flex h-[32.5rem] flex-col gap-4 overflow-auto pr-4">
        {selectedItems.map((item) => (
          <OrderProductCard
            key={item.id}
            name={item.product.name}
            size={item.sizeId}
            price={Math.floor((item.product as ProductInfoData).discountPrice ?? item.product.price * (1 - item.product.discountRate / 100)).toLocaleString() + "원"}
            count={item.quantity}
            imageUrl={item.product.image}
          />
        ))}
      </div>
    </section>
  );
}
