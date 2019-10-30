<template>
    <form :id="identifier" 
        data-role="ajax-form" 
        v-on:submit.prevent="onSubmit"
        ref="formElem">
        
        <slot></slot>

        <slot name="progress" v-if="isSending">
            <div class="ajax-form-progress">
                Enviando
            </div>
        </slot>
    </form>
</template>

<script>
import DeepMerge from '../DeepMerge.js';
import axios from "axios";

export default {
    name:'AjaxForm',
    inheritAttrs:false,
    props:{
        /**
		 * Id que se asignará al formulario
         * 
		 * @type {string}
		 */
        id:{
            type: String
        },

        /**
		 * Método por el que se mandará el
         * formulario
         * 
		 * @type {string}
		 */
        method:{
            type: String,
            default: 'post',
            validator: function (value) {
                return ['post', 'put', 'delete', 'get'].indexOf(value.toLowerCase()) !== -1
            }
        },

        /**
		 * URL a la que se enviará la petición
         * 
		 * @type {string}
		 */
        url:{
            type: String,
            default: null
        },

        /**
         * Indica si el formulario se debe enviar 
         * al servidor, util para rellenar formularios,
         * validar y realizar alguna acción con los datos 
         * sin enviar el formulario
         * 
         * @type {boolean}
         */
        sendToServer:{
            type: Boolean,
            default: true
        },

        /**
         * Callback para validar los datos antes
         * de enviar al servidor
         * 
         * @type {Function}
         */
        validator: Function,

        /**
         * Callback que es llamada una vez se
         * validan los datos, sirve para tranformar
         * la estructura de datos que se enviará
         */
        dataMutator: Function,
    },
    data(){
        return {
            /**
             * Identificador del form, se usa el id proporcionado
             * por el usuario, en otro caso geera uno aleatorio,
             * solo es para referencia
             * 
             * @type {string}
             */
            identifier:null,

            /**
             * Indica si el formulario est´pa en proceso de envio
             * o ya se está enviando
             * 
             * @type {boolean}
             */
            isSending:false
        }
    },
    mounted: function(){
        //Definición de ID
        this.identifier = this.id?this.id:`ajaxform-${this.randomString(6)}`;

        //Registro de formulario
        this.$ajaxForm.putForm(this.identifier);
    },
    methods:{
        /**
         * Genera una cadena aleatoria de letras 
         * minúsculas
         * 
         * @param {int} length  Longitud
         * @return {string}
         */
        randomString(length=6){
            let result= '';
            let characters= 'abcdefghijklmnopqrstuvwxyz';
            let charactersLength = characters.length;
            for ( let i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },

        /**
         * Indica si un elemento proporcionado
         * es un objeto no nulo
         * 
         * @param {obj} testObj
         * @return {boolean}
         */
        isObject(testObj){
            if( (typeof testObj === "object") && (testObj !== null) ){
                return true;
            }

            return false;
        },

        /**
         * Listener del evento submit del formulario,
         * en el se recaban todos los elementos a enviar
         * y se hace la petición al servidor(en caso de
         * así estar configurado)
         * 
         * @param {object} evt  Datos del evento
         */
        onSubmit(evt){
            //Mostrar progress
            this.isSending = true;

            let data = {};
            let nodes = this.$refs.formElem.querySelectorAll('[data-ajaxform-key]');
            let deepmerge = new DeepMerge();

            //Recorrer todos los elementos con el atributo data-ajaxform-key
            nodes.forEach(node => {
                //Obtener key y tag
                let key = node.getAttribute('data-ajaxform-key');
                let tag = node.getAttribute('data-ajaxform-tag');

                //Recorrer cada uno de los reslvers hasta encontrar
                //el correcto, luego rompe ciclo
                for (let index = 0; index < this.$ajaxForm.resolvers.length; index++) {
                    const resolver = this.$ajaxForm.resolvers[index];
                    let resolvedData = resolver(node, key, tag);

                    //Verificar si el resolver fué el correcto
                    if(this.isObject(resolvedData)){
                        //Merge en profundidad con los nuevos datos
                        data = deepmerge.deepmergeAll([data, resolvedData])
                        break;
                    }
                }
            });

            //Merge en profundidad de data con los datos del
            //formulario temporal que amacena los valores
            //cuando se usa expresion, por ejemplo ligado a modelo
            data = deepmerge.deepmergeAll([
                data, 
                this.$ajaxForm.getForm(this.identifier)
            ])

            /**
             * Validar datos antes de enviar al servidor
             */
            if(this.validator && !this.validator(data)){
                this.isSending = false;
                this.$emit('validation-error', data);
                return;
            }
        
            /**
             * Mutar datos antes de ser enviados
             */
            if(this.dataMutator){
                data = this.dataMutator(data);
            }


            if(!this.sendToServer){
                this.isSending = false;
                this.$emit('completed', data);
                return;
            }

            axios({
                method: this.method,
                url: this.url,
                data
            }).then(response=>{
                this.isSending = false;
                this.$emit('success', response);
            }).catch(error=>{
                this.isSending = false;
                this.$emit('error', error);
            });

            console.log('sending', data);
        }
    }
}
</script>

<style scoped>
    .ajax-form-progress{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.7);
        z-index: 100000;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3em;
    }
</style>