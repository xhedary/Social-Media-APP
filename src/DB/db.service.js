export const create = async ({ model, data = {} } = {}) => {
    const document = await model.create(data);
    return document
}
export const find = async ({ model, filter = {}, select = "", populate = [], skip = 0, limit = 1000 } = {}) => {
    const document = await model.find(filter).select(select).populate(populate).skip(skip).limit(limit);
    return document
}
export const findOne = async ({ model, filter = {}, select = "", populate = [] } = {}) => {
    const document = await model.findOne(filter).select(select).populate(populate);
    return document
}
export const findById = async ({ model, id, select = "", populate = [] } = {}) => {
    const document = await model.findById(id).select(select).populate(populate)
    return document
}
export const findOneAndUpdate = async ({ model, filter = {}, data = {}, populate = [], select = "", options = { new: true, runValidators: true } } = {}) => {
    const document = await model.findOneAndUpdate(filter, data, options).select(select).populate(populate);
    return document
}
export const findByIdAndUpdate = async ({ model, id, data = {}, populate = [], options = { new: true, runValidators: true } } = {}) => {
    const document = await model.findByIdAndUpdate(id, data, options).populate(populate);
    return document
}
export const findByIdAndDelete = async ({ model, id = "", select = "", populate = [] } = {}) => {
    const document = await model.findByIdAndDelete(id).populate(populate);
    return document
}
export const findOneAndDelete = async ({ model, filter = {}, data = {}, options = { new: true, runValidators: true } } = {}) => {
    const document = await model.findOneAndDelete(filter, data, options);
    return document
}
export const updateOne = async ({ model, filter = {}, data = {}, options = { new: true, runValidators: true } } = {}) => {
    const document = await model.updateOne(filter, data, options);
    return document
}
export const updateMany = async ({ model, filter = {}, data = {}, options = { new: true, runValidators: true } } = {}) => {
    const document = await model.updateMany(filter, data, options);
    return document
}
export const deleteOne = async ({ model, filter = {}, options = { new: true, runValidators: true } } = {}) => {
    const document = await model.findOneAndDelete(filter, options);
    return document
}
export const deleteMany = async ({ model, filter = {} } = {}) => {
    const document = await model.deleteMany(filter);
    return document
}

export const count = async ({ model, filter = {} } = {}) => {
    const document = await model.countDocuments(filter);
    return document
}
///////////////////////////////////////////////////////// 
export const aggregate = async ({ model, pipeline = [] } = {}) => {
    const document = await model.aggregate(pipeline);
    return document
}

export const distinct = async ({ model, field = "" } = {}) => {
    const document = await model.distinct(field);
    return document
}

export const bulkWrite = async ({ model, data = [] } = {}) => {
    const document = await model.bulkWrite(data);
    return document
}

export const insertMany = async ({ model, data = [] } = {}) => {
    const document = await model.insertMany(data);
    return document
}

export const insertOne = async ({ model, data = {} } = {}) => {
    const document = await model.insertOne(data);
    return document
}

export const replaceOne = async ({ model, data = {} } = {}) => {
    const document = await model.replaceOne(data);
    return document
}






