/**
 * Resolver de tipos comunes a los que se puede
 * acceder a su valor usando value y son tratados
 * como string
 * 
 * @param {object} el   Elemento del DOM
 * @param {string} key  Clave a definir en los datos de servidor
 * @param {string} tag  Tag del componente vue sobre el que se aplicó
 * @return {object}
 */
export const communTypes = function(el, key, tag){
    const inputTypes = [
        'email',
        'hidden',
        'number',
        'password',
        'search',
        'tel',
        'text',
        'url'
    ];
    let res = {};
    
    if(el.tagName=="INPUT" && inputTypes.includes(el.type)){
        res[key] = el.value;
        return res;
    }

    return false;
}

/**
 * Resolver del input del tipo number, devuelve
 * el resultado como un número y no como string
 * 
 * @param {object} el   Elemento del DOM
 * @param {string} key  Clave a definir en los datos de servidor
 * @param {string} tag  Tag del componente vue sobre el que se aplicó
 * @return {object}
 */
export const numbers = function(el, key, tag){
    let res = {};
    
    if(el.tagName=="INPUT" && el.type=="number"){
        res[key] = Number(el.value);
        return res;
    }

    return false;
}

/**
 * Resolver de elementos select
 * 
 * @param {object} el   Elemento del DOM
 * @param {string} key  Clave a definir en los datos de servidor
 * @param {string} tag  Tag del componente vue sobre el que se aplicó
 * @return {object}
 */
export const selects = function(el, key, tag){
    let res = {};

    if((el.tagName=="SELECT" && el.type=="select") || el.tagName=="SELECT"){
        res[key] = el.value;
        return res;
    }

    return false;
}

/**
 * Resolver de elementos select multiple
 * 
 * @param {object} el   Elemento del DOM
 * @param {string} key  Clave a definir en los datos de servidor
 * @param {string} tag  Tag del componente vue sobre el que se aplicó
 * @return {object}
 */
export const selectsMultiple = function(el, key, tag){
    let res = {};

    /**
     * Guardamos las opciones seleccionadas en un array y posteriormente lo pasamos a object
     */
    if(el.tagName=="SELECT" && el.type=="select-multiple"){
        let optionsSelected = [];
        let options = el && el.options;
        const selectLength = options.length;
        let opt;

        for(var i=0; i<selectLength; i++){
            opt = options[i];

            if(opt.selected) {
                optionsSelected.push(opt.value || opt.text);
            }
        }

        res[key] = Object.assign({...optionsSelected})
        return res;
    }

    return false;
}