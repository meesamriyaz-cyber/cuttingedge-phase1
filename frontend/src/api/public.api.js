import { api } from "./client.js";

const withQuery = (path, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  ).toString();

  return query ? `${path}?${query}` : path;
};

export const getCategories = (params) => api.get(withQuery("/categories", params));
export const getCategoryBySlug = (slug) => api.get(`/categories/${slug}`);

export const getCrafts = (params) => api.get(withQuery("/crafts", params));
export const getFeaturedCrafts = () => api.get("/crafts/featured");
export const getCraftBySlug = (slug) => api.get(`/crafts/slug/${slug}`);

export const getArtisans = (params) => api.get(withQuery("/artisans", params));
export const getFeaturedArtisans = () => api.get("/artisans/featured");
export const getArtisanBySlug = (slug) => api.get(`/artisans/slug/${slug}`);

export const getArticles = (params) => api.get(withQuery("/articles", params));
export const getFeaturedArticles = () => api.get("/articles/featured");
export const getArticleBySlug = (slug) => api.get(`/articles/slug/${slug}`);
