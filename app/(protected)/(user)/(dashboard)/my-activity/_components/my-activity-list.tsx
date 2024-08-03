'use client';

/* eslint-disable no-underscore-dangle */

import React, { useCallback, useState, useEffect, useTransition } from 'react';
import MyActivityCard from '@/app/(protected)/(user)/(dashboard)/my-activity/_components/my-activity-card';
import { getMyActivities } from '@/app/data/activity';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { ActivityWithFavoriteAndCount } from '@/type';

interface Props {
  myActivities: ActivityWithFavoriteAndCount[];
  activityCursorId: string | null;
}

export default function MyActivityList({ myActivities, activityCursorId }: Props) {
  const [activityList, setActivityList] = useState<ActivityWithFavoriteAndCount[]>(myActivities);
  const [cursorId, setCursorId] = useState(activityCursorId);
  const [isPending, startTransition] = useTransition();

  const loadMoreActivities = useCallback(async () => {
    startTransition(async () => {
      if (!cursorId) return;
      const result = await getMyActivities({ take: 7, cursor: cursorId });
      setActivityList((prev) => [...prev, ...result.activities]);
      setCursorId(result.cursorId);
    });
  }, [cursorId]);

  useEffect(() => {
    setActivityList(myActivities);
    setCursorId(activityCursorId);
  }, [myActivities, activityCursorId]);

  const observer = useInfiniteScroll({
    callback: loadMoreActivities,
    cursorId,
    isLoading: isPending,
  });

  return (
    <div className="flex flex-col items-center">
      <ul className="flex flex-col gap-3 w-full">
        {activityList.map((myActivity) => (
          <li key={myActivity.id}>
            <MyActivityCard activity={myActivity} />
          </li>
        ))}
        <div ref={observer} />
      </ul>
    </div>
  );
}
