'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Drawer,
  DrawerFooter,
  DrawerClose,
  DrawerDescription,
  DrawerPortal,
} from '@/components/ui/drawer';
import LOCATIONS from '@/constants/locations';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LocationSelectDrawerForNav() {
  const [isDrawOpen, setIsDrawOpen] = useState(false);
  const [province, setProvince] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const cities = useMemo(() => {
    return province ? LOCATIONS[province] : [];
  }, [province]);

  const handleSelectProvince = (provinceLocation: string) => {
    if (provinceLocation === '세종특별자치시') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('location', provinceLocation);
      router.push(`?${params.toString()}`);
    } else {
      setProvince(provinceLocation);
    }
  };

  const handleSelectLocation = (location: string) => {
    if (province) {
      const fullLocation = `${province} ${location}`;
      setSelectedLocation(fullLocation);

      const params = new URLSearchParams(searchParams.toString());

      params.set('location', fullLocation);

      router.push(`?${params.toString()}`);
    }
  };

  const handleResetLocation = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete('location');

    setProvince(null);
    setSelectedLocation(null);

    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const locationValue = searchParams.get('location');
    if (!locationValue) {
      setProvince(null);
      setSelectedLocation(null);
    } else {
      setSelectedLocation(locationValue);
      setIsDrawOpen(false);
    }
  }, [searchParams]);

  return (
    <Drawer open={isDrawOpen} onOpenChange={setIsDrawOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          className="flex items-center justify-between w-full gap-1 text-base font-semibold border shadow-md bg-white_light rounded-3xl hover:bg-gray-200"
        >
          {selectedLocation || '어디로 떠나실래요?'}
          <Compass className="size-5" />
        </Button>
      </DrawerTrigger>
      <DrawerPortal>
        <DrawerContent className="bg-white_light">
          <DrawerHeader>
            <DrawerTitle className="text-2xl">지역을 선택하세요</DrawerTitle>
            <DrawerDescription className="">
              도・광역시・특별시를 먼저 선택하시고 시・군・구를 선택해 주세요.
              <span className="text-xs text-gray-800">(세종특별자치시 제외)</span>
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <Command>
              <CommandList className="flex p-2 relative justify-center shadow-[inset_0_0_5px_rgb(0,0,0,0.1)]">
                <CommandEmpty>확정을 눌러주세요.</CommandEmpty>
                {province === null && (
                  <CommandGroup>
                    <ul className="grid grid-cols-3 gap-3">
                      {Object.keys(LOCATIONS).map((_province) => (
                        <CommandItem
                          key={_province}
                          value={_province}
                          onSelect={handleSelectProvince}
                          className={cn(
                            province === _province && 'bg-gray-200',
                            'flex items-center justify-center p-2 font-medium rounded-lg shadow-md hover:bg-gray-100',
                          )}
                        >
                          {_province}
                        </CommandItem>
                      ))}
                    </ul>
                  </CommandGroup>
                )}
                {province && cities.length > 0 && (
                  <CommandGroup>
                    <ul className="grid grid-cols-3 gap-3">
                      {cities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={handleSelectLocation}
                          className={cn(
                            selectedLocation?.includes(city) && 'bg-gray-200',
                            'flex items-center justify-center p-2 font-medium rounded-lg shadow-md hover:bg-gray-100',
                          )}
                        >
                          {city}
                        </CommandItem>
                      ))}
                    </ul>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
          <DrawerFooter>
            <Button
              type="button"
              onClick={handleResetLocation}
              className="text-base text-white shadow-md bg-slate-800"
            >
              초기화
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="text-base text-white shadow-md bg-primary">
                확정
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
