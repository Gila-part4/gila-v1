'use client';

/* eslint-disable no-console */

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Activity } from '@prisma/client';

import ActivityEditForm from './activity-edit-form';

interface Props {
  handleDelete: () => void;
  activity: Activity;
}

export default function MyActivityKebab({ handleDelete, activity }: Props) {
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 hover:bg-slate-200 rounded-full transition outline-none">
          <EllipsisVertical className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative mr-10 bg-white">
          <DropdownMenuItem className="cursor-pointer" asChild>
            <DialogTrigger className="flex justify-center w-full">수정하기</DialogTrigger>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="w-full border-[0.5px]" />
          <DropdownMenuItem onClick={handleDelete} className="flex justify-center cursor-pointer">
            삭제하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="bg-white h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div />
          </DialogTitle>
        </DialogHeader>
        <ActivityEditForm
          activityId={activity.id}
          title={activity.title}
          description={activity.description}
          location={activity.location}
          tags={activity.tags}
          images={activity.thumbnails}
          maximumCount={activity.maximumCount}
        />
      </DialogContent>
    </Dialog>
  );
}
