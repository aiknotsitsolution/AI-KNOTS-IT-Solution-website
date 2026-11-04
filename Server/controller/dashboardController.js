const Contact = require("../module/contactmodule/contactmodule");
const Query = require("../module/querymodule/querymodule");
const Product = require("../module/homemodule/homemodule");
const Technology = require("../module/technologymodule/technologymodule");
const TechCategory = require("../module/technologymodule/categorymodule");
const BlogCategory = require("../module/BlogModule/caetgorymodule");
const RecentWork = require("../module/recentworkmodule/recentworkmodule");
const RecentWorkCategory = require("../module/recentworkmodule/recentwrokcategory");

const metricRecordConfig = {
  contacts: {
    model: Contact,
    project: {
      title: { $ifNull: ["$username", "Contact message"] },
      email: 1,
      phone: 1,
      description: "$message",
    },
  },
  queries: {
    model: Query,
    project: {
      title: { $ifNull: ["$name", "Website query"] },
      email: 1,
      phone: 1,
      category: 1,
      description: "$message",
    },
  },
  blogPosts: {
    model: Product,
    categoryCollection: BlogCategory.collection.name,
    project: {
      title: { $ifNull: ["$name", "Untitled blog"] },
      subtitle: "$author",
      description: 1,
      category: {
        $ifNull: [
          { $arrayElemAt: ["$dashboardCategory.name", 0] },
          { $toString: "$category" },
        ],
      },
      link: { $concat: ["/blog/", { $ifNull: ["$slug", ""] }] },
      images: 1,
    },
  },
  techNews: {
    model: Technology,
    categoryCollection: TechCategory.collection.name,
    project: {
      title: { $ifNull: ["$title", "Untitled tech news"] },
      description: 1,
      category: {
        $ifNull: [
          { $arrayElemAt: ["$dashboardCategory.name", 0] },
          { $toString: "$category" },
        ],
      },
      link: 1,
      images: 1,
    },
  },
  recentWorks: {
    model: RecentWork,
    categoryCollection: RecentWorkCategory.collection.name,
    project: {
      title: { $ifNull: ["$title", "Untitled recent work"] },
      description: 1,
      category: {
        $ifNull: [
          { $arrayElemAt: ["$dashboardCategory.name", 0] },
          { $toString: "$category" },
        ],
      },
      link: 1,
      images: 1,
    },
  },
  blogCategories: {
    model: BlogCategory,
    project: {
      title: { $ifNull: ["$name", "Untitled category"] },
      description: { $literal: "Blog category" },
    },
  },
  techCategories: {
    model: TechCategory,
    project: {
      title: { $ifNull: ["$name", "Untitled category"] },
      description: { $literal: "Technology category" },
    },
  },
  recentWorkCategories: {
    model: RecentWorkCategory,
    project: {
      title: { $ifNull: ["$name", "Untitled category"] },
      description: { $literal: "Recent work category" },
    },
  },
};

const startOfUtcMonth = (date, offset = 0) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));

const getMonthlyAnalytics = async (model, comparison) => {
  const [total, [result = { daily: [], comparison: [] }]] =
    await Promise.all([
      model.countDocuments(),
      model.aggregate([
        {
          $match: {
            createdAt: {
              $gte: comparison.previousStart,
              $lt: comparison.currentEnd,
            },
          },
        },
        {
          $facet: {
            daily: [
              { $match: { createdAt: { $gte: comparison.currentStart } } },
              {
                $group: {
                  _id: { $dayOfMonth: "$createdAt" },
                  count: { $sum: 1 },
                },
              },
            ],
            comparison: [
              {
                $group: {
                  _id: null,
                  currentMonth: {
                    $sum: {
                      $cond: [
                        { $gte: ["$createdAt", comparison.currentStart] },
                        1,
                        0,
                      ],
                    },
                  },
                  previousMonth: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gte: ["$createdAt", comparison.previousStart] },
                            { $lt: ["$createdAt", comparison.previousEnd] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ]),
    ]);

  return {
    total,
    daily: result.daily,
    comparison: result.comparison[0] || { currentMonth: 0, previousMonth: 0 },
  };
};

const getDashboardAnalytics = async (req, res) => {
  try {
    const recentWorkPage = Math.max(
      1,
      Number.parseInt(req.query.recentWorkPage, 10) || 1,
    );
    const recentWorkPageSize = Math.min(
      20,
      Math.max(1, Number.parseInt(req.query.recentWorkPageSize, 10) || 6),
    );
    const now = new Date();
    const currentStart = startOfUtcMonth(now);
    const previousStart = startOfUtcMonth(now, -1);
    const previousDays = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0),
    ).getUTCDate();
    const comparisonDay = Math.min(now.getUTCDate(), previousDays);
    const previousEnd = new Date(previousStart);
    previousEnd.setUTCDate(comparisonDay);
    previousEnd.setUTCHours(
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds(),
    );
    const metricsConfig = [
      { key: "contacts", label: "Contact messages", model: Contact },
      { key: "queries", label: "Website queries", model: Query },
      { key: "blogPosts", label: "Blog posts", model: Product },
      { key: "techNews", label: "Tech news", model: Technology },
      { key: "recentWorks", label: "Recent work", model: RecentWork },
      { key: "blogCategories", label: "Blog categories", model: BlogCategory },
      { key: "techCategories", label: "Tech categories", model: TechCategory },
      {
        key: "recentWorkCategories",
        label: "Work categories",
        model: RecentWorkCategory,
      },
    ];

    const [analytics, recentRecords] = await Promise.all([
      Promise.all(
        metricsConfig.map(async ({ key, label, model }) => ({
          key,
          label,
          ...(await getMonthlyAnalytics(model, {
            currentStart,
            currentEnd: now,
            previousStart,
            previousEnd,
          })),
        })),
      ),
      Promise.all([
        Contact.find()
          .select("username createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Query.find()
          .select("name category createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Product.find()
          .select("name createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Technology.find()
          .select("title createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        RecentWork.find()
          .select("title createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        RecentWork.aggregate([
          {
            $facet: {
              items: [
                { $sort: { createdAt: -1, _id: -1 } },
                { $skip: (recentWorkPage - 1) * recentWorkPageSize },
                { $limit: recentWorkPageSize },
                {
                  $project: {
                    title: 1,
                    description: 1,
                    link: 1,
                    images: 1,
                    createdAt: 1,
                  },
                },
              ],
              total: [{ $count: "count" }],
            },
          },
        ]),
      ]),
    ]);

    const recentWorkResult = recentRecords[5][0] || { items: [], total: [] };
    const recentWorkTotal = recentWorkResult.total[0]?.count || 0;
    const activityItems = [
      ...recentRecords[0].map((item) => ({
        id: `contact-${item._id}`,
        type: "contact",
        title: item.username || "New contact message",
        detail: "Sent a contact message",
        createdAt: item.createdAt,
      })),
      ...recentRecords[1].map((item) => ({
        id: `query-${item._id}`,
        type: "query",
        title: item.name || "New website query",
        detail: item.category || "Submitted a query",
        createdAt: item.createdAt,
      })),
      ...recentRecords[2].map((item) => ({
        id: `blog-${item._id}`,
        type: "blog",
        title: item.name || "Untitled blog",
        detail: "Blog post",
        createdAt: item.createdAt,
      })),
      ...recentRecords[3].map((item) => ({
        id: `tech-${item._id}`,
        type: "tech",
        title: item.title || "Untitled tech news",
        detail: "Tech news",
        createdAt: item.createdAt,
      })),
      ...recentRecords[4].map((item) => ({
        id: `work-${item._id}`,
        type: "recentWork",
        title: item.title || "Untitled recent work",
        detail: "Recent work",
        createdAt: item.createdAt,
      })),
    ]
      .sort((first, second) => second.createdAt - first.createdAt)
      .slice(0, 10);

    const metricData = analytics.map(
      ({ key, label, total, daily, comparison }) => ({
        key,
        label,
        total,
        daily: Array.from({ length: now.getUTCDate() }, (_, index) => {
          const day = index + 1;
          return {
            day,
            count: daily.find((entry) => entry._id === day)?.count || 0,
          };
        }),
        currentMonth: comparison.currentMonth,
        previousMonth: comparison.previousMonth,
      }),
    );

    return res.status(200).json({
      success: true,
      data: {
        metrics: metricData,
        recentActivity: activityItems,
        recentWorkItems: recentWorkResult.items,
        recentWorkPagination: {
          page: recentWorkPage,
          pageSize: recentWorkPageSize,
          total: recentWorkTotal,
          totalPages: Math.max(
            1,
            Math.ceil(recentWorkTotal / recentWorkPageSize),
          ),
        },
        comparison: {
          currentMonth: currentStart.toISOString(),
          previousMonth: previousStart.toISOString(),
          throughDay: now.getUTCDate(),
        },
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard analytics.",
    });
  }
};

const getMetricRecords = async (req, res) => {
  const { metricKey } = req.params;
  const config = metricRecordConfig[metricKey];
  if (!config) {
    return res.status(404).json({
      success: false,
      message: "Dashboard metric not found.",
    });
  }

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(
    20,
    Math.max(1, Number.parseInt(req.query.pageSize, 10) || 10),
  );

  try {
    const [result = { items: [], total: [] }] = await config.model.aggregate([
      {
        $facet: {
          items: [
            { $sort: { createdAt: -1, _id: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
            ...(config.categoryCollection
              ? [
                  {
                    $lookup: {
                      from: config.categoryCollection,
                      localField: "category",
                      foreignField: "_id",
                      as: "dashboardCategory",
                    },
                  },
                ]
              : []),
            {
              $project: {
                ...config.project,
                createdAt: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const total = result.total[0]?.count || 0;
    return res.status(200).json({
      success: true,
      data: {
        items: result.items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metric records:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load records for this dashboard metric.",
    });
  }
};

module.exports = { getDashboardAnalytics, getMetricRecords };
