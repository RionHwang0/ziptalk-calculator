import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-yellow-500 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/">
          <h1 className="text-xl font-bold cursor-pointer">부동산 계산기</h1>
        </Link>
      </div>
    </header>
  );
} 