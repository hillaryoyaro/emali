'use client'

import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarIcon } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { PopoverClose } from '@radix-ui/react-popover'

type DateRange = {
  from: Date
  to: Date
}

export function CalendarDateRangePicker({
  defaultDate,
  setDate,
  className,
}: {
  defaultDate?: DateRange
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  className?: string
}) {
  const [calendarDate, setCalendarDate] = useState<[Date | null, Date | null]>([
    defaultDate?.from || null,
    defaultDate?.to || null,
  ])

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !calendarDate[0] && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {calendarDate[0] ? (
              calendarDate[1] ? (
                <>
                  {formatDateTime(calendarDate[0]).dateOnly} -{' '}
                  {formatDateTime(calendarDate[1]).dateOnly}
                </>
              ) : (
                formatDateTime(calendarDate[0]).dateOnly
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          onCloseAutoFocus={() =>
            setCalendarDate([
              defaultDate?.from || null,
              defaultDate?.to || null,
            ])
          }
          className="w-auto p-4"
          align="end"
        >
          <DatePicker
            selectsRange
            startDate={calendarDate[0]}
            endDate={calendarDate[1]}
            onChange={(dates) => setCalendarDate(dates as [Date, Date])}
            inline
          />
          <div className="flex gap-4 pt-4">
            <PopoverClose asChild>
              <Button
                onClick={() => {
                  if (calendarDate[0] && calendarDate[1]) {
                    setDate({ from: calendarDate[0], to: calendarDate[1] })
                  }
                }}
              >
                Apply
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button
                variant="outline"
                onClick={() =>
                  setCalendarDate([
                    defaultDate?.from || null,
                    defaultDate?.to || null,
                  ])
                }
              >
                Cancel
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
