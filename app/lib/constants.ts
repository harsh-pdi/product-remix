export const PRODUCTS_API_URL = 'https://fakestoreapi.com/products';

export type Rating = {
    rate: number;
    countr: number;
}

export type Product = {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: Rating;
}