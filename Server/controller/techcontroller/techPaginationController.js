const techModel = require("../../module/techmodule/techmodule");
const categoryModel = require("../../module/techmodule/categorymodule");

const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 50;

const parsePositiveInteger = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
};

const getPaginatedTechData = async (req, res) => {
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
    const categories = await categoryModel
      .find({}, { name: 1 })
      .sort({ name: 1 })
      .lean();
    const pipeline = [];

    if (selectedCategory && selectedCategory !== "All") {
      const categoryIds = categories
        .filter((category) => category.name === selectedCategory)
        .map((category) => category._id);
      pipeline.push({ $match: { category: { $in: categoryIds } } });
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
                from: categoryModel.collection.name,
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
                _id: 1,
                title: 1,
                description: 1,
                link: 1,
                images: 1,
                createdAt: 1,
                updatedAt: 1,
                "category._id": 1,
                "category.name": 1,
              },
            },
          ],
          metadata: [{ $count: "total" }],
        },
      },
    );

    const [result] = await techModel.aggregate(pipeline).allowDiskUse(true);
    const total = result.metadata[0]?.total ?? 0;
    const categoryNames = [
      ...new Set(categories.map((category) => category.name).filter(Boolean)),
    ];

    return res.status(200).json({
      success: true,
      message: "Tech data fetched successfully",
      data: result.data,
      categories: categoryNames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching paginated tech data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getPaginatedTechData };
