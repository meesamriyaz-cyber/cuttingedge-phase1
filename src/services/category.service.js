import Category from "../models/Category.js";

export const findCategoryBySlug =
(slug)=>{

    return Category.findOne({
        slug,
        status:true
    });

};

export const findCategoryById =
(id)=>{

    return Category.findById(id);

};