const normalizeBasePath = (value) => {
  if (!value) {
    return "";
  }

  return value.replace(/\/$/, "");
};

export const getBasePath = () => {
  const publicUrl = process.env.PUBLIC_URL || "";

  if (!publicUrl) {
    return "";
  }

  try {
    return normalizeBasePath(new URL(publicUrl).pathname);
  } catch {
    return normalizeBasePath(publicUrl);
  }
};

export const withBasePath = (path = "/") => {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!basePath) {
    return normalizedPath;
  }

  return normalizedPath === "/" ? `${basePath}/` : `${basePath}${normalizedPath}`;
};