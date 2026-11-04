const Product = require("../../module/homemodule/homemodule");
const Category = require("../../module/BlogModule/caetgorymodule");

const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 50;

const parsePositiveInteger = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
};

const getPaginatedBlogPosts = async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const requestedLimit = parsePositiveInteger(req.query.limit, DEFAULT_PAGE_SIZE);
  const categoryName = req.query.category;

  if (
    page === null ||
    requestedLimit === null ||
    !Number.isSafeInteger((page - 1) * requestedLimit) ||
    (categoryName !== undefined && typeof categoryName !== "string")
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid pagination parameters",
    });
  }

  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
  const skip = (page - 1) * limit;
  const selectedCategory = categoryName?.trim();

  try {
    const pipeline = [];

    if (selectedCategory && selectedCategory !== "All") {
      const category = await Category.findOne({ name: selectedCategory })
        .select("_id")
        .lean();

      if (!category) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      pipeline.push({ $match: { category: category._id } });
    }

    pipeline.push(
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: Category.collection.name,
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                name: 1,
                slug: 1,
                description: 1,
                images: 1,
                views: 1,
                likes: 1,
                createdAt: 1,
                author: 1,
                "category.name": 1,
                "category.slug": 1,
              },
            },
          ],
          metadata: [{ $count: "total" }],
        },
      },
    );

    const [result] = await Product.aggregate(pipeline).allowDiskUse(true);
    const total = result.metadata[0]?.total ?? 0;

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching paginated blog posts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog posts",
    });
  }
};

module.exports = { getPaginatedBlogPosts };
