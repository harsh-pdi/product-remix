import axios from "axios";
import { PRODUCTS_API_URL } from "./constants";

export async function getProducts () {
    return await (await axios(PRODUCTS_API_URL)).data;
}

export async function getProduct (id: number) {
    return await (await axios(`${PRODUCTS_API_URL}/${id}`)).data;
}