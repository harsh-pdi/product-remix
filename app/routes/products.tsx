import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getProducts } from "~/lib/api";
import { Product } from "~/lib/constants";

export async function loader () {
    const products = await getProducts();
    return json({
        products,
    });
}

export default function Products () {
    const { products } = useLoaderData<typeof loader>();
    return (
        <div style={{ margin: '40px' }}>
            <h2 style={{ marginBottom: '40px' }}>Products List</h2>

            <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min-content, 300px))', gap: '40px' }}>
                {products.map((product: Product, index: number) => (
                    <Link key={index} to={`/product/${product.id}`} style={{ color: 'black', textDecoration: 'none' }}>
                        <img src={product.image} alt={product.title} width={100} height={100} />
                        <p style={{ fontSize: 18 }}>{product.title}</p>
                        <p style={{ fontSize: 14 }}>{product.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}