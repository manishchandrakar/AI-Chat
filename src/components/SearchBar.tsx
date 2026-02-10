"use client"

import { Input } from "@/components/ui/input"

interface ISearchBarProps {
  value: string
  onChange: (value: string) => void
}

export const SearchBar = ({ value, onChange }: ISearchBarProps) => {
  return (
    <Input
      placeholder="Search notes..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-[300px]"
    />
  )
}