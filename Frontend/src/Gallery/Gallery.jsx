import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Helmet } from "react-helmet-async";
import { Image as ImageIcon, AlertCircle } from "lucide-react";
const Gallery = () => {
  const { isDark } = useTheme(); // ← Theme Hook Added

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fallback images (your original ones)
  const fallbackImages = [
    "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1558655146-9f40138f37f5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581287053822-fd7bf4f1afec?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1611162617210-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80",
  ];

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("https://api.aiknotsit.com/api/gallery");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Invalid API response format");
        }

        // Extract all image URLs from the nested "images" arrays
        const allImageUrls = result.data
          .flatMap((item) => item.images || [])
          .filter((url) => typeof url === "string" && url.trim() !== "");

        setImages(allImageUrls);
      } catch (err) {
        console.error("Gallery fetch error:", err);
        setError(err.message || "Failed to load gallery images");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const displayImages = images.length > 0 ? images : fallbackImages;

  // ====================== THEME CLASSES ======================
  const headingClass = isDark ? "text-white" : "text-gray-900";
  const bodyClass = isDark ? "text-gray-300" : "text-gray-700";
  const accentClass = isDark ? "text-[#8B6B4A]" : "text-gray-700";

  if (loading) {
    return (
      // <div
      //   className={`min-h-screen flex items-center justify-center transition-colors duration-700
      //   ${isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"}`}
      // >
      //   <div className="text-center">
      //     <div className="w-16 h-16 border-4 border-[#EFE5C8]  rounded-full animate-spin mx-auto mb-6"></div>
      //     <p className={`text-2xl ${bodyClass}`}>Loading gallery...</p>
      //   </div>
      // </div>

      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8B6B4A]/30 border-t-[#8B6B4A] rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-medium">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    // <>
    //   <Helmet>
    //     <title>Project Gallery | Atla Inteligent Knots</title>
    //     <meta
    //       name="description"
    //       content="Explore our gallery of website, branding, digital marketing & IT projects."
    //     />
    //     <meta
    //       name="keywords"
    //       content="Project Gallery	Website Portfolio, Work Gallery"
    //     />
    //   </Helmet>
    //   <div
    //     className={`min-h-screen px-4 py-12 md:px-8 transition-colors duration-700
    //   ${isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"}`}
    //   >
    //     <div className="max-w-7xl mx-auto">
    //       <h1
    //         className={`text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-10 md:mb-16 tracking-tight ${accentClass}`}
    //       >
    //         My Photo Gallery
    //       </h1>

    //       {error && (
    //         <p className="text-center text-red-500 mb-8">
    //           {error} — showing fallback images instead
    //         </p>
    //       )}

    //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    //         {displayImages.map((src, index) => (
    //           <div
    //             key={index}
    //             className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl
    //             ${isDark ? "shadow-black/50 hover:shadow-[#EFE5C8]/30" : "shadow-gray-300 hover:shadow-[#EFE5C8]/30"}`}
    //           >
    //             <img
    //               src={
    //                 src.startsWith("http")
    //                   ? `${src}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
    //                   : `https://api.aiknotsit.com${src}?auto=format&fit=crop&w=800&q=80`
    //               }
    //               alt={`Gallery image ${index + 1}`}
    //               className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
    //               loading="lazy"
    //               onError={(e) => {
    //                 e.target.src =
    //                   fallbackImages[index % fallbackImages.length];
    //                 e.target.alt = "Fallback image";
    //               }}
    //             />

    //             <div
    //               className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end
    //             ${isDark ? "" : "from-black/60"}`}
    //             >
    //               <p className="text-white text-sm p-4 font-medium">
    //                 Image {index + 1}
    //               </p>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>
    // </>

    <>
      <Helmet>
        <title>Project Gallery | AI Knots IT Solution</title>
        <meta
          name="description"
          content="Explore our gallery of website, branding, digital marketing and IT projects."
        />
        <meta
          name="keywords"
          content="Project Gallery, Website Portfolio, Work Gallery, AI Knots IT Solution"
        />
      </Helmet>

      <main
        className={`min-h-screen transition-colors duration-700 ${
          isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        {/* Hero */}
        <section className="px-4 pt-20 pb-14 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#8B6B4A]/30 bg-[#8B6B4A]/10 text-[#8B6B4A] font-semibold mb-6">
              <ImageIcon className="w-4 h-4" />
              Project Gallery
            </div>

            <h1
              className={`text-4xl md:text-6xl lg:text-7xl font-black mb-6 ${
                isDark ? "text-white" : "text-[#3d220e]"
              }`}
            >
              Our Creative <span className="text-[#8B6B4A]">Work Gallery</span>
            </h1>

            <p
              className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
                isDark ? "text-gray-300" : "text-[#5c4635]"
              }`}
            >
              Explore our collection of website, branding, digital marketing,
              and IT project visuals.
            </p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-[#8B6B4A]/30 bg-[#8B6B4A]/10 px-4 py-3 text-[#8B6B4A]">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">
                {error} — showing fallback images instead.
              </p>
            </div>
          </div>
        )}

        {/* Gallery */}
        {/* Gallery */}
        <section className="px-4 pb-20 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,320px))] justify-center gap-6">
              {displayImages.map((src, index) => (
                <div
                  key={index}
                  className={`group relative w-full overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl
          ${
            isDark
              ? "bg-gray-900 border-gray-800 hover:border-[#8B6B4A]/60"
              : "bg-white border-gray-200 hover:border-[#8B6B4A]/60 shadow-md"
          }`}
                >
                  <div
                    className="relative h-72 overflow-hidden cursor-zoom-in"
                    onClick={() =>
                      setSelectedImage(
                        src.startsWith("http")
                          ? `${src}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=100`
                          : `https://api.aiknotsit.com${src}`,
                      )
                    }
                  >
                    <img
                      src={
                        src.startsWith("http")
                          ? `${src}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
                          : `https://api.aiknotsit.com${src}?auto=format&fit=crop&w=800&q=80`
                      }
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110 cursor-zoom-in"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          fallbackImages[index % fallbackImages.length];
                        e.target.alt = "Fallback image";
                      }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Content */}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-semibold">
                        Gallery Image {index + 1}
                      </p>
                      <p className="text-[#E7D3BE] text-xs mt-1">
                        AI Knots IT Solution
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Full Image Preview Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-5 right-5 md:top-7 md:right-8 z-10 text-white text-5xl font-light hover:text-[#8B6B4A] transition"
              aria-label="Close image preview"
            >
              ×
            </button>

            <img
              src={selectedImage}
              alt="Gallery Preview"
              className="max-w-[96vw] max-h-[92vh] object-contain rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </main>
    </>
  );
};

export default Gallery;
