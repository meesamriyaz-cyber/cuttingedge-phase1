import Category from "../models/Category.js";
import Craft from "../models/Craft.js";
import Artisan from "../models/Artisan.js";
import Article from "../models/Article.js";
import Media from "../models/Media.js";

export const getDashboardStats =
async () => {

    const [
        categories,
        crafts,
        artisans,
        articles,
        media
    ] = await Promise.all([

        Category.countDocuments({
            status: true
        }),

        Craft.countDocuments({
            status: true
        }),

        Artisan.countDocuments({
            status: true
        }),

        Article.countDocuments({
            status: true
        }),

        Media.countDocuments({
            status: true
        })

    ]);

    return {
        categories,
        crafts,
        artisans,
        articles,
        media
    };

};
