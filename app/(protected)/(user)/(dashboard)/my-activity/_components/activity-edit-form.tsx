'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Accordion } from '@/components/ui/accordion';
import { Undo2 } from 'lucide-react';
import LocationSelectSection from '@/app/(protected)/(user)/(dashboard)/my-activity/_components/location-select-section';
import ScheduleSection from '@/app/(protected)/(user)/(dashboard)/my-activity/_components/schedule-section';
import DetailInfoSection from '@/app/(protected)/(user)/(dashboard)/my-activity/_components/detail-info-section';
import { useTransition } from 'react';
import { editActivity } from '@/app/action/activity';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const ActivityCreateFormSchema = z.object({
  title: z.string(),
  tags: z.string().array(),
  description: z.string(),
  schedule: z.object({ from: z.date(), to: z.date() }),
  location: z.string(),
  images: z.string().array(),
  maximumCount: z.number().min(1),
});

export type ActivityCreateFormData = z.infer<typeof ActivityCreateFormSchema>;

export interface ActivityCreateFormProps {
  form: UseFormReturn<ActivityCreateFormData>;
}

type Props = {
  activityId: string;
  title: string;
  description: string;
  location: string;
  tags: string[];
  images: string[];
  maximumCount: number;
};

export default function ActivityEditForm({
  activityId,
  title: initTitle,
  description: initDescription,
  location: initLocation,
  tags: initTags,
  images: initImages,
  maximumCount: initMaximumCount,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<ActivityCreateFormData>({
    resolver: zodResolver(ActivityCreateFormSchema),
    defaultValues: {
      title: initTitle,
      description: initDescription,
      location: initLocation,
      tags: initTags,
      images: initImages,
      maximumCount: initMaximumCount,
    },
  });

  const selectLocation = (location: string) => {
    form.setValue('location', location);
    form.clearErrors('location');
  };

  const onSubmit = () => {
    // 제출 눌렀을 때 해당 카드의 데이터 출력
    startTransition(async () => {
      console.log(form.getValues());
    });
  };

  return (
    <Form {...form}>
      <main className="min-h-screen bg-white">
        <div className="mb-5">
          <button
            type="button"
            aria-label="back-btn"
            className="bg-[#ffffff] p-1 rounded-full shadow-md border hover:bg-slate-200"
          >
            <Undo2 />
          </button>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Accordion
            type="single"
            className="flex flex-col gap-5"
            collapsible
            defaultValue="item-1"
          >
            <LocationSelectSection
              className="bg-[#ffffff]"
              form={form}
              selectLocation={selectLocation}
            />
            <ScheduleSection className="bg-[#ffffff]" form={form} />
            <DetailInfoSection className="bg-[#ffffff]" form={form} />
          </Accordion>
          <Button
            onClick={onSubmit}
            disabled={isPending}
            type="submit"
            className="w-full text-xl font-semibold text-black shadow-md py-7"
          >
            제출
          </Button>
        </form>
      </main>
    </Form>
  );
}
