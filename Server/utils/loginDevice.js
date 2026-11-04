const getDeviceName = (agent, deviceType, platform) => {
  if (/ipad/i.test(agent)) return "iPad";
  if (/iphone/i.test(agent)) return "iPhone";
  if (/ipod/i.test(agent)) return "iPod";

  if (/android/i.test(agent)) {
    const model = agent.match(/Android[^;)]*;\s*([^;)]+)/i)?.[1]
      ?.replace(/\s+Build\/.*$/i, "")
      .trim();
    if (model && !/^(?:K|wv|Version\/[\d.]+)$/i.test(model)) {
      return model.replace(/^SM-/i, "Samsung SM-");
    }
    return deviceType === "tablet" ? "Android tablet" : "Android phone";
  }

  if (platform === "Windows") return "Windows PC";
  if (platform === "macOS") return "Mac";
  if (platform === "Linux") return "Linux PC";
  if (deviceType === "tablet") return `${platform} tablet`;
  if (deviceType === "mobile") return `${platform} phone`;
  if (deviceType === "desktop") return "Desktop computer";
  return "Unknown device";
};

const getLoginDevice = (userAgent = "") => {
  const agent = userAgent.slice(0, 512);
  const deviceType = /ipad|tablet/i.test(agent)
    ? "tablet"
    : /mobile|iphone|ipod|android/i.test(agent)
      ? "mobile"
      : agent
        ? "desktop"
        : "unknown";
  const browser = /edg\//i.test(agent)
    ? "Microsoft Edge"
    : /opr\//i.test(agent)
      ? "Opera"
      : /firefox\//i.test(agent)
        ? "Firefox"
        : /chrome\//i.test(agent)
          ? "Chrome"
          : /safari\//i.test(agent)
            ? "Safari"
            : "Unknown browser";
  const platform = /windows/i.test(agent)
    ? "Windows"
    : /iphone|ipad|ipod/i.test(agent)
      ? "iOS"
      : /android/i.test(agent)
        ? "Android"
        : /macintosh|mac os/i.test(agent)
          ? "macOS"
          : /linux/i.test(agent)
            ? "Linux"
            : "Unknown device";

  return {
    userAgent: agent,
    deviceType,
    browser,
    platform,
    deviceName: getDeviceName(agent, deviceType, platform),
  };
};

module.exports = getLoginDevice;
