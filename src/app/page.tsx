import Image from "next/image";
import {query} from "@/lib/vendure/api";
import {graphql} from "@/graphql";

const GetProductsQuery = graphql(`
    query GetProducts($options: ProductListOptions) {
        products(options: $options) {
            items {
                id
                name
                slug
                description
            }
        }
    }
`);

export default async function Home() {
    return (
        <h1>Home</h1>
    );
}
