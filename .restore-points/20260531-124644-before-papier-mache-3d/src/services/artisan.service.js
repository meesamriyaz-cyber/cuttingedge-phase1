import Artisan from "../models/Artisan.js";

export const getArtisansByCraft = async (
    craftId
) => {
    return Artisan.find({
        craftIds: craftId,
        status: true
    })
    .select(
        "name slug district profilePhoto yearsOfExperience"
    )
    .sort({
        featured: -1,
        name: 1
    });
};
