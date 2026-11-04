import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ImagePlus,
  Images,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  createGalleryItem,
  getAllGalleryItems,
  updateGalleryItem,
  deleteGalleryItem,
} from "./Gallery.api";

const MAX_IMAGES = 10;

const Gallery = () => {
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editFiles, setEditFiles] = useState([]);
  const [editPreviews, setEditPreviews] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const previewUrls = useRef(new Set());

  const createFileInput = useRef(null);
  const editFileInput = useRef(null);

  const createPreview = (file) => {
    const url = URL.createObjectURL(file);
    previewUrls.current.add(url);
    return url;
  };

  const releasePreview = (url) => {
    if (previewUrls.current.delete(url)) URL.revokeObjectURL(url);
  };

  useEffect(
    () => () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
    },
    [],
  );

  const fetchGalleryItems = useCallback(async () => {
    setLoadingItems(true);
    setError("");
    try {
      const response = await getAllGalleryItems();
      const result = response.data?.data ?? response.data;
      if (!Array.isArray(result)) {
        throw new Error("The gallery response was not in the expected format.");
      }
      setGalleryItems(result);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Could not load gallery items.";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  const filteredItems = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    if (!search) return galleryItems;
    return galleryItems.filter((item) =>
      (item.name || "").toLowerCase().includes(search),
    );
  }, [galleryItems, searchText]);

  const imageCount = galleryItems.reduce(
    (total, item) => total + (Array.isArray(item.images) ? item.images.length : 0),
    0,
  );

  const handleCreateFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const availableSlots = MAX_IMAGES - files.length;
    if (selected.length > availableSlots) {
      toast.warning(`You can add up to ${MAX_IMAGES} images per gallery item.`);
    }
    const accepted = selected.slice(0, availableSlots);
    if (accepted.length) {
      setFiles((current) => [...current, ...accepted]);
      setPreviews((current) => [
        ...current,
        ...accepted.map(createPreview),
      ]);
    }
    event.target.value = "";
  };

  const removeCreatePreview = (index) => {
    releasePreview(previews[index]);
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setPreviews((current) =>
      current.filter((_, previewIndex) => previewIndex !== index),
    );
  };

  const resetCreateForm = () => {
    previews.forEach(releasePreview);
    setName("");
    setFiles([]);
    setPreviews([]);
    if (createFileInput.current) createFileInput.current.value = "";
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Enter a name for this gallery item.");
      return;
    }
    if (!files.length) {
      toast.error("Select at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    files.forEach((file) => formData.append("images", file));

    setCreateLoading(true);
    try {
      await createGalleryItem(formData);
      toast.success("Gallery item created successfully.");
      resetCreateForm();
      await fetchGalleryItems();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to create gallery item.",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (item) => {
    editPreviews.forEach(releasePreview);
    setEditingItem(item);
    setEditName(item.name || "");
    setEditFiles([]);
    setEditPreviews([]);
    if (editFileInput.current) editFileInput.current.value = "";
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (editLoading) return;
    editPreviews.forEach(releasePreview);
    setEditModalOpen(false);
    setEditingItem(null);
    setEditName("");
    setEditFiles([]);
    setEditPreviews([]);
    if (editFileInput.current) editFileInput.current.value = "";
  };

  const handleEditFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const currentImageCount = editingItem?.images?.length || 0;
    const availableSlots = Math.max(
      0,
      MAX_IMAGES - currentImageCount - editFiles.length,
    );
    if (selected.length > availableSlots) {
      toast.warning(
        `This item can contain up to ${MAX_IMAGES} images in total.`,
      );
    }
    const accepted = selected.slice(0, availableSlots);
    if (accepted.length) {
      setEditFiles((current) => [...current, ...accepted]);
      setEditPreviews((current) => [
        ...current,
        ...accepted.map(createPreview),
      ]);
    }
    event.target.value = "";
  };

  const removeEditPreview = (index) => {
    releasePreview(editPreviews[index]);
    setEditFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setEditPreviews((current) =>
      current.filter((_, previewIndex) => previewIndex !== index),
    );
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editName.trim()) {
      toast.error("Enter a name for this gallery item.");
      return;
    }

    const formData = new FormData();
    formData.append("name", editName.trim());
    editFiles.forEach((file) => formData.append("images", file));

    setEditLoading(true);
    try {
      await updateGalleryItem(editingItem._id, formData);
      toast.success("Gallery item updated successfully.");
      editPreviews.forEach(releasePreview);
      setEditModalOpen(false);
      setEditingItem(null);
      setEditFiles([]);
      setEditPreviews([]);
      await fetchGalleryItems();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to update gallery item.",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name || "this gallery item"}"?`)) return;
    try {
      await deleteGalleryItem(item._id);
      setGalleryItems((current) =>
        current.filter((galleryItem) => galleryItem._id !== item._id),
      );
      toast.success("Gallery item deleted successfully.");
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to delete gallery item.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-100">
              <Images size={14} />
              Media library
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Gallery
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Organize your photo collections and keep your website gallery up
              to date.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchGalleryItems}
            disabled={loadingItems}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={loadingItems ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Collections
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Images size={19} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loadingItems ? "—" : galleryItems.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total images
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <ImagePlus size={19} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {loadingItems ? "—" : imageCount}
          </p>
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Plus size={19} />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Create collection
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Add a title and up to {MAX_IMAGES} images.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-5 p-5">
            <label className="block text-sm font-semibold text-slate-700">
              Collection name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                placeholder="e.g. Company events"
                disabled={createLoading}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
              />
            </label>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Collection images
              </label>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-7 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <Upload size={19} />
                </span>
                <span className="mt-3 text-sm font-semibold text-slate-700">
                  Choose images to upload
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  JPG, PNG, GIF or WEBP · up to {MAX_IMAGES} images
                </span>
                <input
                  ref={createFileInput}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleCreateFiles}
                  disabled={createLoading || files.length >= MAX_IMAGES}
                  className="sr-only"
                />
              </label>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Selected images</span>
                <span className="font-semibold text-slate-700">
                  {files.length}/{MAX_IMAGES}
                </span>
              </div>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {previews.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                  >
                    <img
                      src={url}
                      alt={`Selected gallery image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeCreatePreview(index)}
                      disabled={createLoading}
                      aria-label={`Remove selected image ${index + 1}`}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950/75 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={resetCreateForm}
                disabled={createLoading || (!name && !files.length)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createLoading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {createLoading ? "Uploading..." : "Create collection"}
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Your collections</h2>
              <p className="mt-1 text-xs text-slate-500">
                Browse and manage uploaded gallery albums.
              </p>
            </div>
            <label className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search collections..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
            </label>
          </div>

          {loadingItems ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
              <LoaderCircle size={19} className="animate-spin text-indigo-600" />
              Loading collections...
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <AlertCircle size={28} className="text-red-400" />
              <p className="mt-3 font-semibold text-slate-800">
                Couldn’t load collections
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">{error}</p>
              <button
                type="button"
                onClick={fetchGalleryItems}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Try again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Images size={22} />
              </span>
              <p className="mt-3 font-semibold text-slate-800">
                {searchText ? "No matching collections" : "No collections yet"}
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {searchText
                  ? "Try a different search term."
                  : "Create your first collection using the form."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {filteredItems.map((item) => (
                <article
                  key={item._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-900/5"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name || "Gallery collection"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <Images size={34} />
                      </div>
                    )}
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-950/75 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
                      <Images size={13} />
                      {item.images?.length || 0}{" "}
                      {(item.images?.length || 0) === 1 ? "image" : "images"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="truncate font-semibold text-slate-900">
                      {item.name || "Untitled collection"}
                    </h3>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {editModalOpen && editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-gallery-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                  Gallery management
                </p>
                <h2
                  id="edit-gallery-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  Edit collection
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={editLoading}
                aria-label="Close edit collection"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5 p-5 sm:p-6">
              <label className="block text-sm font-semibold text-slate-700">
                Collection name
                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  maxLength={100}
                  disabled={editLoading}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
                />
              </label>

              {editingItem.images?.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Current images ({editingItem.images.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {editingItem.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="aspect-square overflow-hidden rounded-xl bg-slate-100"
                      >
                        <img
                          src={image}
                          alt={`${editingItem.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Add more images
                </label>
                <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-indigo-300 hover:bg-indigo-50/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                    <Upload size={17} />
                  </span>
                  <span className="text-xs text-slate-500">
                    <span className="block font-semibold text-slate-700">
                      Choose additional images
                    </span>
                    Up to {MAX_IMAGES} images total
                  </span>
                  <input
                    ref={editFileInput}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditFiles}
                    disabled={
                      editLoading ||
                      (editingItem.images?.length || 0) + editFiles.length >=
                        MAX_IMAGES
                    }
                    className="sr-only"
                  />
                </label>
              </div>

              {editPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {editPreviews.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                    >
                      <img
                        src={url}
                        alt={`New image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeEditPreview(index)}
                        disabled={editLoading}
                        aria-label={`Remove new image ${index + 1}`}
                        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950/75 text-white transition hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editLoading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {editLoading ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {editLoading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Gallery;
