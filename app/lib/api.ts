import { PRODUCTS_API_URL } from "./constants";

export async function getProducts () {
    return await (await fetch(PRODUCTS_API_URL)).json();
}

export async function getProduct (id: number) {
    return await (await fetch(`${PRODUCTS_API_URL}/${id}`)).json();
}