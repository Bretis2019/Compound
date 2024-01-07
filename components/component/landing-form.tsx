"use client"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from "@/components/ui/command"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Calendar} from "@/components/ui/calendar"
import {Input} from "@/components/ui/input"
import {inflationTable} from "@/app/calculate/inflationTable";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {CalendarIcon} from "@radix-ui/react-icons";
import {addDays, format} from "date-fns";


function formatDate(inputDateString: string) {
  // Create a Date object from the input date string
  const inputDate = new Date(inputDateString);

  // Check if the input date is valid
  if (isNaN(inputDate.getTime())) {
    return "Invalid Date";
  }

  // Get the year, month, and day components from the Date object
  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, '0');
  const day = String(inputDate.getDate()).padStart(2, '0');

  // Format the date in "yyyy-MM-dd" format
  return `${year}-${month}-${day}`;
}

export function LandingForm() {
  const router = useRouter();
  const [stockOpen, setStockOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [values, setValues] = useState({
    country: "",
    initialBalance: 0,
    monthlyContribution: 0,
    stock: "",
    startDate: "2023-01-01"
  })

  const [date, setDate] = useState<Date>()

  const handleMonthlyContributionChange = (event: any) => {
    // Ensure that the input value is a valid number
    const newMonthlyContribution = parseFloat(event.target.value);

    setValues({
      ...values,
      monthlyContribution: isNaN(newMonthlyContribution) ? 0 : newMonthlyContribution
    });
  };

  const handleInitialBalanceChange = (event: any) => {
    // Ensure that the input value is a valid number
    const newMonthlyContribution = parseFloat(event.target.value);

    setValues({
      ...values,
      initialBalance: isNaN(newMonthlyContribution) ? 0 : newMonthlyContribution
    });
  };
  function onSubmit() {
    console.log(values);
    //router.push(`/calculate?country=${values.country}&stock=${values.stock}&startDate=${values.startDate}&startingBalance=${values.initialBalance}&monthlyContribution=${values.monthlyContribution}`)
  }

  useEffect(() => {
    if(date){
      const inputDate = date.toString();
      const formattedDate = formatDate(inputDate)
      setValues(prevValues => ({
        ...prevValues,
        startDate: formattedDate
      }));
    }
  },[date])

  const commandItems = Object.keys(inflationTable).map(countryName => (
      <CommandItem key={countryName} value={countryName} onSelect={() => {
        setValues(prevValues => ({
          ...prevValues,  // Spread the previous values
          country: countryName  // Update the country property
        }));
        setCountryOpen(false)
      }}>
        {countryName}
      </CommandItem>
  ));

  const selectItems = Object.keys(inflationTable).map(countryName => (
      <SelectItem key={countryName} value={countryName}>
        {countryName}
      </SelectItem>
  ));


  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  function handleStockChnage(event: any){
    function update(){
      setQuery(event.target.value);
    }
    setTimeout(update, 1000);
  }

  useEffect(() => {
    fetch(`/api/search/?q=${query}`)
        .then((response) => response.json())
        .then(data => {
          setSuggestions(data.suggestions);
        })
  }, [query]);

  return (
    <div key="1" className="w-full max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Financial Planning</CardTitle>
          <CardDescription>Set your financial goals and plan accordingly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">Stock</Label>
            <Select>
              <Popover open={stockOpen} onOpenChange={setStockOpen}>
                <PopoverTrigger asChild>
                  <Button className="w-[200px] justify-between" role="combobox" variant="outline">
                    {values.stock === "" ? "Select a stock...": values.stock}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput onChangeCapture={handleStockChnage} className="h-9" placeholder="Search country..." />
                    <CommandEmpty>No stock found.</CommandEmpty>
                    <CommandGroup>
                      {commandItems}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <SelectContent>
                {selectItems}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button className="w-[200px] justify-between" role="combobox" variant="outline">
                    {values.country === "" ? "Select country...": values.country}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput className="h-9" placeholder="Search country..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {commandItems}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <SelectContent>
                {selectItems}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-date">Start Date</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy-MM-dd") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                  align="start"
                  className="flex w-auto flex-col space-y-2 p-2"
              >
                <Select
                    onValueChange={(value) =>{
                      setDate(addDays(new Date(), parseInt(value)))
                      setDateOpen(false)
                    }
                    }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="-365">Last year</SelectItem>
                    <SelectItem value="-730">Two years</SelectItem>
                    <SelectItem value="-1825">Last five years</SelectItem>
                    <SelectItem value="-3650">Max</SelectItem>
                  </SelectContent>
                </Select>
                <div className="rounded-md border">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="initial-balance">Initial Balance</Label>
            <Input onChange={handleInitialBalanceChange} value={values.initialBalance} id="initial-balance" placeholder="Enter your initial balance" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly-contributions">Monthly Contributions</Label>
            <Input onChange={handleMonthlyContributionChange} value={values.monthlyContribution} id="monthly-contributions" placeholder="Enter your monthly contributions" type="number" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onSubmit} type={"submit"} className="ml-auto">Submit</Button>
        </CardFooter>
      </Card>
    </div>
  )
}


function ChevronsUpDownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  )
}


function CalendarDaysIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  )
}
