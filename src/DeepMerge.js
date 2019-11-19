export default class DeepMerge {
    isMergeableObject(val) {
        var nonNullObject = val && typeof val === 'object'
    
        return nonNullObject
            && Object.prototype.toString.call(val) !== '[object RegExp]'
            && Object.prototype.toString.call(val) !== '[object Date]'
    }
    
    emptyTarget(val) {
        return Array.isArray(val) ? [] : {}
    }
    
    cloneIfNecessary(value, optionsArgument) {
        var clone = optionsArgument && optionsArgument.clone === true
        return (clone && this.isMergeableObject(value)) ? this.deepmerge(this.emptyTarget(value), value, optionsArgument) : value
    }
    
    defaultArrayMerge(target, source, optionsArgument) {
        var destination = target.slice()
        source.forEach((e, i) => {
            if (typeof destination[i] === 'undefined') {
                destination[i] = this.cloneIfNecessary(e, optionsArgument)
            } else if (this.isMergeableObject(e)) {
                destination[i] = this.deepmerge(target[i], e, optionsArgument)
            } else if (target.indexOf(e) === -1) {
                destination.push(this.cloneIfNecessary(e, optionsArgument))
            }
        })
        return destination
    }
    
    mergeObject(target, source, optionsArgument) {
        var destination = {}
        if (this.isMergeableObject(target)) {
            Object.keys(target).forEach((key) => {
                destination[key] = this.cloneIfNecessary(target[key], optionsArgument)
            })
        }
        Object.keys(source).forEach((key) => {
            if (!this.isMergeableObject(source[key]) || !target[key]) {
                destination[key] = this.cloneIfNecessary(source[key], optionsArgument)
            } else {
                destination[key] = this.deepmerge(target[key], source[key], optionsArgument)
            }
        })
        return destination
    }
    
    deepmerge(target, source, optionsArgument) {
        var array = Array.isArray(source);
        var options = optionsArgument || { arrayMerge: this.defaultArrayMerge }
        var arrayMerge = options.arrayMerge || this.defaultArrayMerge
    
        if (array) {
            return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : this.cloneIfNecessary(source, optionsArgument)
        } else {
            return this.mergeObject(target, source, optionsArgument)
        }
    }
    
    deepmergeAll(array, optionsArgument) {
        if (!Array.isArray(array) || array.length < 2) {
            throw new Error('first argument should be an array with at least two elements')
        }
    
        // we are sure there are at least 2 values, so it is safe to have no initial value
        return array.reduce((prev, next) => {
            return this.deepmerge(prev, next, optionsArgument)
        })
    }
}