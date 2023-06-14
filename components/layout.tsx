import { useTheme } from 'next-themes';
import ColorModeSwitch from './ColorModeSwitch';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="w-full flex flex-col space-y-4 h-full">
      <header className="w-full sticky top-0 z-40 dark:bg-gray-600 bg-gray-200 shadow-sm">
        <div className="container flex items-center mx-auto py-2 h-12 px-4">
          {/* <nav className="">
            <a href="#" className="hover:text-orange-400 cursor-pointer">
              Home
            </a>
          </nav> */}
          <ColorModeSwitch />
        </div>
      </header>
      <div className="container mx-auto h-full">
        <main className="flex w-full flex-1 flex-col h-full">{children}</main>
      </div>
    </div>
  );
}
