export interface DateRange{ start: Date|null; end: Date|null; }
export interface DatePickerProps{ startDate?: Date|null; endDate?: Date|null; onChange?: (range: DateRange) => void; month?: number; year?: number; }
export function DatePicker(props: DatePickerProps): JSX.Element;
