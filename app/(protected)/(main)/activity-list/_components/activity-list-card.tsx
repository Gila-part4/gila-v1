import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityWithUserAndFavoCount } from '@/type';
import formatDateRange from '@/utils/formatDateRange';

interface Props {
  activity: ActivityWithUserAndFavoCount;
}

export default function ActivityListCard({ activity }: Props) {
  const { title, startDate, endDate, location, views, _count, user, thumbnails } = activity;
  const formatDate = formatDateRange({ startDateString: startDate, endDateString: endDate });

  return (
    <Link href={`/activity/${activity.id}`}>
      <Card className="h-[400px] flex flex-col items-start border-none shadow-md hover:shadow-xl">
        <div className="flex justify-center w-full h-full row-span-2 px-2 pt-2 rounded-md">
          <div className="relative w-full h-full rounded-md">
            <Image
              src={thumbnails[0] || '/default-carousel-image.png'}
              alt="thumbnail"
              fill
              sizes="(max-width: 768px) 100vw"
              style={{ objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
        </div>
        <div className="flex flex-col w-full row-span-1 gap-1 p-2">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold text-black truncate">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-center">
              <span className="text-sm font-normal text-gray-500">길라: {user.nickname}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900">{formatDate}</span>
              <span className="text-xs font-semibold text-gray-900">{location}</span>
            </div>
          </CardContent>
          <CardFooter className="p-0">
            <div className="flex items-center justify-end w-full gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="text-red" size={16} />
                <span>{_count.favorites}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{views}</span>
              </div>
            </div>
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}
