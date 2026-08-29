'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, CalendarDays, Layers, Settings } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button, Sheet, SheetContent, SheetTrigger } from '@/shared/ui';

const navItems = [
  { label: 'Календарь', href: '/', icon: CalendarDays },
  { label: 'Типы смен', href: '/settings/shift-types', icon: Layers },
  { label: 'Пресеты', href: '/settings/presets', icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => setIsOpen(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-bold text-lg flex items-center gap-2">
          <span>📅</span> Смены.График
        </Link>

        {/* Десктопная навигация */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 transition-colors hover:text-foreground/80',
                  isActive
                    ? 'text-foreground font-medium'
                    : 'text-foreground/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Мобильное меню (бургер) */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-70 sm:w-87.5">
            <div className="flex flex-col gap-1 mt-6">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-base transition-colors hover:bg-muted',
                      isActive
                        ? 'bg-muted font-medium text-foreground'
                        : 'text-foreground/70'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
