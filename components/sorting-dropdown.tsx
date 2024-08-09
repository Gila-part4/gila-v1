'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortOption } from '@/constants/sort';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  sorts: SortOption[];
}

export default function SortingDropdown({ sorts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentSort, setCurrentSort] = useState('recent');
  const currentSortKorean = sorts.find((sort) => sort.en === currentSort)?.ko || '최신순';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const handleClickSort = ({ name, value }: { name: string; value: string }) => {
    router.push(`${pathname}?${createQueryString(name, value)}`);
    setCurrentSort(value);
  };

  useEffect(() => {
    const sortValue = searchParams.get('sort');
    if (sortValue) {
      setCurrentSort(sortValue);
    }
  }, [searchParams]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="flex justify-between gap-1 p-0 px-1 bg-white_light hover:bg-gray-200"
        >
          <div className="text-sm">{currentSortKorean}</div>
          <div className="flex justify-end w-full">
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-none bg-opacity-90 bg-white_light" align="end">
        {sorts.map((sort) => (
          <DropdownMenuItem asChild key={sort.en}>
            <button
              type="button"
              className={cn(
                currentSort === sort.en && `bg-gray-200 bg-opacity-90`,
                `flex w-full items-center justify-center text-black hover:bg-gray-100`,
              )}
              onClick={() => handleClickSort({ name: 'sort', value: sort.en })}
            >
              {sort.ko}
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
