import { useEffect, useState } from "react"
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"

export default function ChipInput({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  // getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)
  const [chips, setChips] = useState([])

  // ✅ Register the field with react-hook-form
  useEffect(() => {
    // Register the input with validation: field is required and must have at least one chip
    register(name, {
      required: true,
      validate: (value) => value.length > 0,
    })
  }, [register, name])

  // ✅ If editing an existing course, populate chips from course data
  useEffect(() => {
    if (editCourse) {
      setChips(course?.tag || [])
    }
  }, [editCourse, course])

  // ✅ Update the form value when chips change
  useEffect(() => {
    setValue(name, chips)
  }, [chips, setValue, name])

  // ✅ Handle adding a new chip when Enter or , is pressed
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      const chipValue = event.target.value.trim()
      if (chipValue && !chips.includes(chipValue)) {
        const newChips = [...chips, chipValue]
        setChips(newChips)
        event.target.value = ""
      }
    }
  }

  // ✅ Remove a chip when the delete button is clicked
  const handleDeleteChip = (chipIndex) => {
    const newChips = chips.filter((_, index) => index !== chipIndex)
    setChips(newChips)
  }

  return (
    <div className="flex flex-col space-y-2">
      {/* Label for the chip input */}
      <label className="text-sm text-richblack-5 uppercase tracking-wider" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>

      {/* Chips display and input field */}
      <div className="flex w-full flex-wrap gap-y-2">
        {chips.map((chip, index) => (
          <div
            key={index}
            className="m-1 flex items-center rounded-full bg-yellow-400 px-2 py-1 text-sm text-richblack-5"
          >
            {chip}
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => handleDeleteChip(index)}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}

        {/* Input field to add new tags */}
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="form-style w-full placeholder:uppercase placeholder:tracking-wider placeholder:text-sm"
        />
      </div>

      {/* Display error if validation fails (e.g., no tags added) */}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
