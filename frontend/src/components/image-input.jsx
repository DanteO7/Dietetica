import { ImagePlus, X } from "lucide-react";

export default function ImageInput({
  onChange,
  preview,
  label = "Imagen",
  error,
}) {
  return (
    <div>
      {label && (
        <div className="mb-2 block">
          <label className="text-black">{label}</label>
        </div>
      )}

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0])}
      />

      <label
        htmlFor="image-upload"
        className={`rounded-[13px] px-3 py-2 w-full border-[1.7px] bg-[#efefef] cursor-pointer flex items-center gap-2 hover:bg-gray-200 transition-all ${
          error ? "border-red-500" : "border-gray-200"
        }`}
      >
        <ImagePlus size={18} className="text-gray-500" />
        <span className="text-gray-600">
          {preview ? "Cambiar imagen" : "Seleccionar imagen"}
        </span>
      </label>

      {preview && (
        <div className="mt-3 relative w-32 h-32">
          <img
            src={preview}
            className="w-32 h-32 object-cover rounded-xl border"
          />

          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute cursor-pointer -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
          >
            <X size={16} className="text-red-500" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-[13px] mt-1">{error.message}</p>
      )}
    </div>
  );
}
