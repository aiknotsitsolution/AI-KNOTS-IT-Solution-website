import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// CKEditor
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import {
  getProductsApi,
  deleteHomeApi,
  updateHomeApi,
  getAdminProductCommentsApi,
  deleteAdminProductCommentApi,
} from "./product.api";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  // Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // Comments Modal
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activeProductComments, setActiveProductComments] = useState([]);
  const [activeProductName, setActiveProductName] = useState("");
  const [activeProductId, setActiveProductId] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  // Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        getProductsApi(),
        fetch("https://ai-knots-website-3.onrender.com/api/blogcategory").then((r) => r.json()),
      ]);

      setProducts(productsRes.data?.data || []);
      if (categoriesRes.success) {
        setCategories(categoriesRes.data || []);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ====================== EDIT FUNCTIONS ======================
  const openEditModal = (product) => {
    setEditData({
      ...product,
      category: product.category?._id?.toString() || "",
    });

    // Set existing images for preview
    const existingPreviews = (product.images || []).map((url) => ({
      url,
      isNew: false,
    }));

    setPreviewImages(existingPreviews);
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
    }));

    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    const img = previewImages[index];
    if (img?.isNew) {
      const newIndex = index - (previewImages.length - selectedFiles.length);
      setSelectedFiles((prev) => prev.filter((_, i) => i !== newIndex));
    }
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    if (!editData.name?.trim() || !editData.description?.trim() || !editData.author?.trim()) {
      toast.error("Name, Author and Description are required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("name", editData.name.trim());
      formData.append("description", editData.description.trim());
      formData.append("author", editData.author.trim());
      formData.append("category", editData.category);

      // Append new images only
      selectedFiles.forEach((file) => formData.append("images", file));

      await updateHomeApi(editData._id, formData);
      toast.success("Updated successfully");

      setIsModalOpen(false);
      setSelectedFiles([]);
      setPreviewImages([]);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ====================== OTHER FUNCTIONS ======================
  const openLivePreview = (product) => {
    setPreviewProduct(product);
    setPreviewModalOpen(true);
  };

  const openCommentsModal = async (product) => {
    setActiveProductId(product._id);
    setActiveProductName(product.name || "Product");
    setCommentModalOpen(true);
    setCommentLoading(true);

    try {
      const res = await getAdminProductCommentsApi(product._id);
      setActiveProductComments(res.data?.data?.comments || []);
    } catch (err) {
      toast.error("Failed to load comments");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteAdminProductCommentApi(activeProductId, commentId);
      toast.success("Comment deleted");
      setActiveProductComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  // Columns
  const columns = useMemo(
    () => [
      {
        header: "No.",
        id: "serial",
        cell: ({ row, table }) =>
          table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1,
      },
      {
        accessorKey: "images",
        header: "Image",
        cell: ({ row }) => {
          const images = row.original.images || [];
          return images.length > 0 ? (
            <img
              src={images[0]}
              alt=""
              className="w-14 h-14 object-cover rounded-lg border"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
              No Img
            </div>
          );
        },
      },
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "author",
        header: "Author",
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => {
          const text = (getValue() || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
          return (
            <div className="max-w-xs line-clamp-3 text-sm" title={text}>
              {text || "—"}
            </div>
          );
        },
      },
      {
        accessorKey: "category.name",
        header: "Category",
        cell: ({ row }) => row.original.category?.name || "—",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => openLivePreview(row.original)}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              👁️ Preview
            </button>
            <button
              onClick={() => openEditModal(row.original)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => openCommentsModal(row.original)}
              className="px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700"
            >
              Comments
            </button>
            <button
              onClick={async () => {
                if (!window.confirm("Delete this item?")) return;
                try {
                  setLoading(true);
                  await deleteHomeApi(row.original._id);
                  toast.success("Deleted successfully");
                  await fetchData();
                } catch (err) {
                  toast.error("Delete failed");
                } finally {
                  setLoading(false);
                }
              }}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { globalFilter, sorting },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden max-w-7xl mx-auto">
        <div className="p-6 border-b bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-800">Product / Blog Management</h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-4 text-left font-medium">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================== EDIT MODAL ====================== */}
      {isModalOpen && editData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Edit Item</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editData.name || ""}
                    onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input
                    type="text"
                    value={editData.author || ""}
                    onChange={(e) => setEditData((p) => ({ ...p, author: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <div className="border rounded-lg">
                    <CKEditor
                      editor={ClassicEditor}
                      data={editData.description || ""}
                      onChange={(_, editor) =>
                        setEditData((p) => ({ ...p, description: editor.getData() }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editData.category || ""}
                    onChange={(e) => setEditData((p) => ({ ...p, category: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesChange}
                    className="w-full"
                  />

                  <div className="flex flex-wrap gap-3 mt-3">
                    {previewImages.map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={img.url}
                          className="w-24 h-24 object-cover rounded-lg border"
                          alt=""
                        />
                        <button
                          onClick={() => removePreview(i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && previewProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0">
              <h2 className="text-2xl font-bold">Live Preview</h2>
              <button onClick={() => setPreviewModalOpen(false)} className="text-4xl text-gray-400 hover:text-black">
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {previewProduct.images?.length > 0 && (
                <img
                  src={previewProduct.images[0]}
                  className="w-full h-80 object-cover rounded-2xl mb-6"
                  alt=""
                />
              )}
              <h1 className="text-4xl font-bold mb-4">{previewProduct.name}</h1>
              <p className="text-xl text-gray-600 mb-6">By {previewProduct.author}</p>
              <div
                dangerouslySetInnerHTML={{ __html: previewProduct.description || "" }}
                className="prose prose-lg max-w-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {commentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-bold">Comments for {activeProductName}</h2>
                  <p className="text-sm text-gray-500">Total: {activeProductComments.length}</p>
                </div>
                <button onClick={() => setCommentModalOpen(false)} className="text-3xl">
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {activeProductComments.length === 0 ? (
                <p className="text-center py-10 text-gray-500">No comments found</p>
              ) : (
                activeProductComments.map((comment) => (
                  <div key={comment._id} className="border rounded-xl p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{comment.user?.name || "Anonymous"}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="mt-3 text-gray-700">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}