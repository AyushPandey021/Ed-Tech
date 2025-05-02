import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud } from "react-icons/fi"
import { Player } from "video-react"

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  editData,
  video = false,
  viewData = false,
}) {
  const [previewSource, setPreviewSource] = useState(editData || "")
  const [selectedFile, setSelectedFile] = useState(null)
    selectedFile
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      previewFile(file)
      setValue(name, file)
    }
  }, [name, setValue,])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open,
  } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: video ? { "video/*": [] } : { "image/*": [] }
  })

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  useEffect(() => {
    register(name, { required: true })
  }, [register, name])

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5 uppercase tracking-wider" htmlFor={name}>
        {label} {!viewData && <sup className="text-pink-200">*</sup>}
      </label>

      <div
        {...getRootProps()}
        className={`${
          isDragActive ? "bg-richblack-600" : "bg-richblack-700"
        } flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500`}
      >
        <input {...getInputProps()} />
        {previewSource ? (
          <div className="flex w-full flex-col p-6">
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <Player aspectRatio="16:9" playsInline src={previewSource} />
            )}
            {!viewData && (
              <button
                type="button"
                onClick={() => {
                  setPreviewSource("")
                  setSelectedFile(null)
                  setValue(name, null)
                }}
                className="mt-3 text-richblack-400 underline"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center p-6" onClick={open}>
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-pure-greys-800">
              <FiUploadCloud className="text-2xl text-yellow-50" />
            </div>
            <p className="mt-2 max-w-[200px] text-center text-xs text-richblack-200 uppercase tracking-wider">
              Drag and drop a {video ? "video" : "image"}, or click to{" "}
              <span className="font-semibold text-yellow-50">Browse</span>
            </p>
            <ul className="mt-10 flex list-disc justify-between space-x-12 text-center text-xs text-richblack-200 uppercase tracking-wider">
              <li>Aspect Ratio 16:9</li>
              <li>Recommended size 1024x576</li>
            </ul>
          </div>
        )}
      </div>

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
