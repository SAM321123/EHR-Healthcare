const { map, get, uniq, flatten, pullAll } = require('lodash');
const { Op } = require('sequelize');

const ObjConstructor = {}.constructor;

const isJSONObject = (obj) => {
if (obj === undefined || obj === null || obj === true || obj === false || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
}
if (obj.constructor === ObjConstructor || obj.constructor === undefined) {
    return true;
}
return false;
};

const getValue = (values, key) => {
let result;
if (Array.isArray(values)) {
    result = flatten(map(values, key));
} else {
    result = get(values, key);
}
if (Array.isArray(result)) {
    result = uniq(result);
}
if (Array.isArray(result)) {
    result = pullAll(result, [undefined]);
}
return result;
};

const resolveValue = (values, key) => {
if (!values || !key) {
    return values;
}
let result = getValue(values, key);
if (result === undefined || (Array.isArray(result) && result.length === 0)) {
    const indexOf = key.indexOf('.');
    if (indexOf === -1) {
    return result;
    }
    const firstPart = key.substring(0, indexOf);
    const nextPart = key.substring(indexOf + 1);
    result = getValue(values, firstPart);
    if (result === undefined || (Array.isArray(result) && result.length === 0)) {
    return result;
    }
    return resolveValue(result, nextPart);
}
return result;
};

const isOrFilter = (filterValue) => {
    return !!(filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty(Op.or));
};
const isAndFilter = (filterValue) => {
    return !!(filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty(Op.and));
};
const isMatch = (row, filter={}) => {
try {
    const keys = [...Object.keys(filter), ...Object.getOwnPropertySymbols(filter)];
    for (const k of keys) {
        const filterValue = filter[k];
    let matched = false;
    if (k === Op.and) {
        matched = matchAnd(row, filterValue);
    } else if (k === Op.or) {
        matched = matchOr(row, filterValue);
    } else {
        const rowValue = resolveValue(row, k);
        if(isAndFilter(filterValue)){
            matched = matchAnd(rowValue, filterValue[Op.or]);
            }
        else if(isOrFilter(filterValue)){
        matched = matchOr(rowValue, filterValue[Op.or]);

        }
        else if (isInFilter(filterValue)) {
        matched = matchIn(rowValue, filterValue);
        } else if (isNotInFilter(filterValue)) {
        matched = matchNotIn(rowValue, filterValue);
        } else if (isLtOrGt(filterValue)) {
        matched = matchLtOrGt(rowValue, filterValue);
        } else if (isExistsFilter(filterValue)) {
        matched = matchExists(filterValue[Op.exists], rowValue);
        } else if (isElemMatchFilter(filterValue)) {
        matched = elemMatch(rowValue, filterValue);
        } else if (isNotEqFilter(filterValue)) {
        matched = !isLeafMatch(rowValue, filterValue[Op.ne]);
        } else {
        matched = isLeafMatch(rowValue, filterValue);
        }
        }
    console.log("🚀 ~ isMatch ~ matched:", matched,k)
    if (!matched) {
        return false;
    }
    }
    return true;
} catch (err) {
    console.log(`Error in isMatch:`, err);
}
};

const matchAnd = (row, filter) => {
if (!Array.isArray(filter)) {
    throw new Error(`And filter must be an array, but found >> ${JSON.stringify(filter)}`);
}
for (let k = 0; k < filter.length; k++) {
    if (!isMatch(row, filter[k])) {
    return false;
    }
}
return true;
};

const matchOr = (row, filter) => {
if (!Array.isArray(filter)) {
    throw new Error(`Or filter must be an array, but found >> ${JSON.stringify(filter)}`);
}
for (let k = 0; k < filter.length; k++) {
    if (isMatch(row, filter[k])) {
    return true;
    }
}
return false;
};

const isLeafMatch = (rowValue, filterValue) => {
if (Array.isArray(rowValue)) {
    for (let i = 0; i < rowValue.length; i++) {
    if (isLeafMatch(rowValue[i], filterValue)) {
        return true;
    }
    }
} else if (
    (!isJSONObject(rowValue) && rowValue?.toString() === filterValue?.toString()) ||
    (rowValue?._id && rowValue?._id.toString() === filterValue.toString()) ||
    (rowValue?.id && rowValue?.id.toString() === filterValue.toString()) ||
    (rowValue && rowValue.equals && rowValue.equals(filterValue))
) {
    return true;
} else {
    return false;
}
};

const matchIn = (value, filterValue) => {
console.log("🚀 ~ matchIn ~ filterValue:", filterValue)
const filter = filterValue[Op.in];
if (!Array.isArray(filter)) {
    throw new Error(`In filter must be an array, but found >> ${JSON.stringify(filter)}`);
}
for (let k = 0; k < filter.length; k++) {
    if ((value === undefined || value === null) && filter[k] === null) {
    return true;
    }
    if (isLeafMatch(value, filter[k])) {
    return true;
    }
}
return false;
};

const matchNotIn = (value, filterValue) => {
const filter = filterValue[Op.notIn];
if (!Array.isArray(filter)) {
    throw new Error(`NotIn filter must be an array, but found >> ${JSON.stringify(filter)}`);
}
for (let k = 0; k < filter.length; k++) {
    if (isLeafMatch(value, filter[k])) {
    return false;
    }
}
return true;
};

const elemMatch = (value, filterValue) => {
const filter = filterValue[Op.elemMatch];
if (!isJSONObject(filter)) {
    throw new Error(`ElemMatch filter must be an object, but found >> ${JSON.stringify(filter)}`);
}
if (!Array.isArray(value)) {
    throw new Error(`Value must be an array, but found >> ${JSON.stringify(value)}`);
}
for (let k = 0; k < value.length; k++) {
    if (isMatch(value[k], filter)) {
    return true;
    }
}
return false;
};

const matchLtOrGt = (value, filterValue) => {
for (const k in filterValue) {
    const kValue = filterValue[k];
    let matched = false;
    if (k === Op.lt) {
    matched = value < kValue;
    } else if (k === Op.gt) {
    matched = value > kValue;
    } else if (k === Op.lte) {
    matched = value <= kValue;
    } else if (k === Op.gte) {
    matched = value >= kValue;
    } else if (k === Op.eq) {
    matched = value === kValue;
    } else {
    throw new Error(`Only Op.lt, Op.gt, Op.lte, Op.gte are supported but found [${k}], filter is ${JSON.stringify(filterValue)} `);
    }
    if (!matched) {
    return false;
    }
}

return true;
};

const isInFilter = (value) => {
return !!(value && typeof value === 'object' && value.hasOwnProperty(Op.in));
};

const isNotInFilter = (value) => {
return !!(value && typeof value === 'object' && value.hasOwnProperty(Op.notIn));
};

const isElemMatchFilter = (value) => {
return !!(value && typeof value === 'object' && value.hasOwnProperty(Op.elemMatch));
};

const isLtOrGt = (value) => {
return !!(
    value &&
    typeof value === 'object' &&
    (value.hasOwnProperty(Op.lt) ||
    value.hasOwnProperty(Op.lte) ||
    value.hasOwnProperty(Op.gt) ||
    value.hasOwnProperty(Op.gte) ||
    value.hasOwnProperty(Op.eq))
);
};

const isExistsFilter = (value) => {
return value && typeof value === 'object' && value.hasOwnProperty(Op.exists);
};

const isNotEqFilter = (value) => {
return value && typeof value === 'object' && value.hasOwnProperty(Op.ne);
};

const matchExists = (valueToMatch, value) => {
return (valueToMatch === true && value !== void 0) || (valueToMatch === false && value === void 0);
};

const getFieldType = (schema, field, skipError) => {
let fieldType = schema && schema[field].instance;
if (Array.isArray(fieldType)) {
    fieldType = fieldType[0];
}
if (typeof fieldType === 'function') {
    return fieldType;
}
if (!skipError && !fieldType) {
    throw new Error(`No such field exists in schema : [${field}], Schema: ${JSON.stringify(schema)} `);
}
return fieldType;
};

const isValidMongooseId = (id) => {
return /^[a-fA-F0-9]{24}$/.test(id);
};

const matchString = (value, filter) => {
if (!filter || typeof filter !== 'string') {
    return false;
}
return new RegExp(filter, 'i').test(value);
};

const isDate = (value) => {
    return isNull(value) || (typeof value === 'object' && value instanceof Date);
  };
module.exports = {
    isJSONObject,
    getFieldType,
    isMatch,
    isDate,
};