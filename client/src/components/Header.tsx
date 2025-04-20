import { Link } from "wouter";

interface HeaderProps {
  subtitle: string;
}

export default function Header({ subtitle }: HeaderProps) {
  return (
    <header className="text-center mb-8">
      <Link href="/">
        <h1 className="text-3xl font-bold text-primary mb-2 cursor-pointer">
          参加証NFT発行アプリ
        </h1>
      </Link>
      <h2 className="text-xl text-blue-400">{subtitle}</h2>
    </header>
  );
}
