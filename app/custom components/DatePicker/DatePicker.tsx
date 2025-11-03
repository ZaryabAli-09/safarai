"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

export function DatePicker({
  label,
  field,
  formData,
  handleChange,
}: {
  label: string;
  field: string;
  formData: any;
  handleChange: (field: string, value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const currentDate = formData[field] ? new Date(formData[field]) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-56 justify-between font-normal"
          >
            {currentDate ? format(currentDate, "yyyy-MM-dd") : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (date) {
                handleChange(field, format(date, "yyyy-MM-dd"));
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
