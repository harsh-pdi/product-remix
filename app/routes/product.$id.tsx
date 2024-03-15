import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getProduct } from "~/lib/api";

export async function loader ({ params }: LoaderFunctionArgs) {
    const productId = params.id;

    if (!productId) {
        return redirect('/products');
    }

    const product = await getProduct(+productId);
    return json({
        product,
    });
}

export default function Products () {
    const { product } = useLoaderData<typeof loader>();
    return (
        <div style={{ margin: '40px' }}>
            <img src={product.image} alt={product.title} width={200} height={200} />
            <h3>{product.title}</h3>
            <p style={{ fontSize: 14 }}>{product.description}</p>
        </div>
    )
}