import Divder from "@/components/divider/Divder";
import { Suspense } from "react";
import ProductList from "./components/ProductList";
import RecommendedProducts from "./components/RecommendedProducts";
import SearchProduct from "./components/SearchProduct";

const ProductsPage = () => {
  return (
    <div className="w-380">
      <RecommendedProducts />
      <Divder className="mt-20 mb-7.5" />
      <SearchProduct />
      <Divder
        className="mt-7.5 mb-10"
        id={"content"}
      />
      <Suspense>
        <ProductList />
      </Suspense>
    </div>
  );
};

export default ProductsPage;
