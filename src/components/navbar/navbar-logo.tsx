import Image from "next/image";
import Link from "next/link";

export function NavbarLogo() {
    return (
        <Link href="/" className="text-xl font-bold">
            <Image src="/vendure.svg" alt="Vendure" width={40} height={27} className="h-6 w-auto" />
        </Link>
    );
}
