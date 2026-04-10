import { ProductsPage } from "../features/products/components/products-page";
import { useProductsPage } from "../features/products/hooks/use-products-page";

export default function Products() {
    const model = useProductsPage();

    return <ProductsPage model={model} />;
}
