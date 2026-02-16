import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { azureRegions } from '@/data/azure-regions'

interface LocationComboboxProps {
  value: string
  onChange: (value: string) => void
  'aria-invalid'?: boolean
  onBlur?: () => void
}

export function LocationCombobox({
  value,
  onChange,
  'aria-invalid': ariaInvalid,
  onBlur,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)

  const selectedRegion = azureRegions.find((r) => r.value === value)
  const isKnownRegion = !!selectedRegion

  if (customMode) {
    return (
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="Custom region name"
          aria-invalid={ariaInvalid}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCustomMode(false)}
          type="button"
        >
          List
        </Button>
      </div>
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next && onBlur) {
          // Defer so React processes any pending onChange dispatch first
          setTimeout(onBlur, 0)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            ariaInvalid &&
              'border-destructive/60 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/50',
          )}
          onClick={() => {
            if (!open) setOpen(true)
          }}
        >
          {isKnownRegion
            ? `${selectedRegion.label} (${selectedRegion.value})`
            : value || 'Select region...'}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search regions..." />
          <CommandList>
            <CommandEmpty>No region found.</CommandEmpty>
            <CommandGroup>
              {azureRegions.map((region) => (
                <CommandItem
                  key={region.value}
                  value={`${region.label} ${region.value}`}
                  onSelect={() => {
                    onChange(region.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === region.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {region.label}{' '}
                  <span className="text-muted-foreground ml-1">
                    ({region.value})
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setCustomMode(true)
                  setOpen(false)
                }}
              >
                Use custom value...
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
