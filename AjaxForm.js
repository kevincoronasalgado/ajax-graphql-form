import AjaxFormComponent from './components/AjaxForm.vue';
import {communTypes, numbers, selects} from './resolvers.js'

const AjaxForm ={
    install(Vue, options){
        /**
         * Registrar componente AjaxForm
         */
        Vue.component(AjaxFormComponent.name, AjaxFormComponent);

        Vue.registerResolver = function(resolver){
            Vue.prototype.$ajaxForm.resolvers = [
                resolver,
                ...Vue.prototype.$ajaxForm.resolvers,
            ]
        }

        /**
         * Registrar propiedades globales, se pueden
         * usar fuera de este código de la siguiente 
         * manera:
         *      this.$ajaxForm
         */
        Vue.prototype.$ajaxForm = {
            /**
             * Lista ordenada en prioridades de resolvers 
             * a ejecutar para obtener el valor a enviar
             * al servidor dependiendo el elemento sobre 
             * el que se aplique la directivadirectiva v-a-form
             * 
             * @type {array}
             */
            resolvers:[
                communTypes,
                numbers,
                selects
            ],

            /**
             * Datos temporales de formularios, almacena
             * un objeto por formulario, en cada objeto
             * se guardan los elementos a enviar al servidor
             * cuando se usa la directiva con una expresión,
             * por ejemplo:
             *      v-a-form:nombre="modelo"
             * 
             * @type {object}
             */
            forms:{},

            /**
             * Agrega un nuevo formulario solo
             * en caso de no exixtir
             * 
             * @param {string} formId
             * @return {void}
             */
            putForm:function (formId) {
                if(this.forms[formId]){
                    console.error(`Ya existe un formulario con el identificador ${formId}`);
                    return;    
                }

                this.forms[formId]={};
            },

            /**
             * Obtiene un formulario, en caso
             * de no existir devuelve objeto vacio
             * 
             * @param {string} formId
             * @return {object}
             */
            getForm:function (formId) {
                if(!this.forms[formId]){
                    return {};    
                }

                return this.forms[formId];
            },

            /**
             * Agrega una clave y valor a un 
             * formulario existente
             * 
             * @param {string} formId
             * @return {object}
             */
            putValueInForm:function(formId, key, value){
                if(!this.forms[formId]){
                    console.error(`No existe un formulario con el identificador ${formId}`);
                    return;    
                }

                this.forms[formId][key] = value;
            }
        };


        /**
         * Registro de directivas
         */
        Vue.directive('a-form', {
            bind (el, binding, vnode) {
                //No hacer nada en caso de ligar con variable
                if(binding && binding.expression){
                    return;
                }

                //Obtener name y tag de componente en caso de ser componente vue
                let name = binding.arg;
                let tag = vnode.componentOptions && vnode.componentOptions.tag;

                //Agregar etiquetas data-*
                el.setAttribute("data-ajaxform-key", name);
                if(tag){
                    el.setAttribute("data-ajaxform-tag", tag);
                }
            },

            update: function(el, binding, vnode, oldVnode){
                //Solo si hay expresión definida
                if(binding && binding.expression){
                    //Obtener el formulario padre
                    let form = el.closest('[data-role="ajax-form"]');

                    //Agregar el valor cambiante al formulario existente
                    vnode.context.$ajaxForm.putValueInForm(
                        form.id, 
                        binding.arg,
                        binding.value
                    );
                }
                
            }
        })

        Vue.mixin({
            created: function () {
            // some logic ...
            }
        })
    }
}

export default AjaxForm;