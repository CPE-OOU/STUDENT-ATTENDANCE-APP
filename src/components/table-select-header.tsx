'use client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

type TableSelectHeaderProps = {
  titleTag: string;
  title: string;
  selectTitle: string;
  defaultValue: string;
  selectOptions: Array<{ title: string; path: string }>;
};

export const TableSelectHeader: React.FC<TableSelectHeaderProps> = ({
  title,
  titleTag,
  selectTitle,
  defaultValue,
  selectOptions,
}) => {
  const router = useRouter();
  return (
    <div className="w-full flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xm text-neutral-900 uppercase">{titleTag}</p>
        <h4 className="text-2xl font-semibold leaing-[120%]">{title}</h4>
      </div>
      <div>
        <Select
          onValueChange={(path) => {
            router.push(path);
          }}
          defaultValue={defaultValue}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{selectTitle}</SelectLabel>
              {selectOptions.map((option) => (
                <SelectItem value={option.path} key={option.path}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
